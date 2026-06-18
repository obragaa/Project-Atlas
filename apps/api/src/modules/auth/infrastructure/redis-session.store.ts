import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Redis } from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { type Environment } from "../../../config/environment.js";
import { REDIS_CLIENT } from "../../../infra/infra.tokens.js";
import {
  type CreateSessionParams,
  type CreatedSession,
  type RotateOutcome,
  type RotateParams,
  type SessionStore,
} from "../domain/session-store.port.js";

/**
 * Redis-backed `SessionStore` (blueprint/15/16). Implements current-hash refresh
 * rotation with reuse detection and family-wide revocation, using Lua scripts so
 * the compare-and-swap and the family fan-out are atomic (no TOCTOU race between
 * two concurrent refreshes, no reuse slipping between check and swap).
 *
 * Key schema (prefix from AUTH_SESSION_KEY_PREFIX, default "atlas"):
 *   {p}:sess:{sid}          Hash  — the session record (incl. currentRefreshHash)
 *   {p}:fam:{fid}           Set   — sids in the family
 *   {p}:fam:revoked:{fid}   "1"   — tombstone for a revoked family
 *   {p}:user:sessions:{uid} Set   — active sids for a user
 * Every key carries a TTL so abandoned sessions self-expire; the tombstone TTL
 * is the full refresh window so a late-replayed stale token still hits it.
 */
@Injectable()
export class RedisSessionStore implements SessionStore {
  private readonly prefix: string;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    config: ConfigService<Environment, true>,
  ) {
    this.prefix = config.get("AUTH_SESSION_KEY_PREFIX", { infer: true });
  }

  private sessKey(sid: string): string {
    return `${this.prefix}:sess:${sid}`;
  }
  private famKey(fid: string): string {
    return `${this.prefix}:fam:${fid}`;
  }
  private revokedKey(fid: string): string {
    return `${this.prefix}:fam:revoked:${fid}`;
  }
  private userKey(uid: string): string {
    return `${this.prefix}:user:sessions:${uid}`;
  }

  async createSession(params: CreateSessionParams): Promise<CreatedSession> {
    const sessionId = uuidv4();
    const familyId = uuidv4();
    const nowMs = Date.now();
    const ttl = params.ttlSeconds;

    const multi = this.redis.multi();
    multi.hset(this.sessKey(sessionId), {
      sessionId,
      familyId,
      userId: params.userId,
      deviceId: params.deviceId,
      status: "active",
      currentRefreshHash: "",
      riskLevel: params.riskLevel,
      issuedAt: nowMs,
      expiresAt: nowMs + ttl * 1_000,
      lastActivity: nowMs,
    });
    multi.expire(this.sessKey(sessionId), ttl);
    multi.sadd(this.famKey(familyId), sessionId);
    multi.expire(this.famKey(familyId), ttl);
    multi.sadd(this.userKey(params.userId), sessionId);
    multi.expire(this.userKey(params.userId), ttl);
    await multi.exec();

    return { sessionId, familyId };
  }

  async bindRefreshHash(sessionId: string, refreshHash: string, ttlSeconds: number): Promise<void> {
    const multi = this.redis.multi();
    multi.hset(this.sessKey(sessionId), "currentRefreshHash", refreshHash);
    multi.expire(this.sessKey(sessionId), ttlSeconds);
    await multi.exec();
  }

  /**
   * Atomic rotation. Returns:
   *   1  -> rotated (hash swapped)
   *   0  -> reuse detected (family was revoked inside the script)
   *  -1  -> invalid (missing/expired/revoked/unusable)
   */
  private static readonly ROTATE_LUA = `
    local sessKey = KEYS[1]
    local revokedKey = KEYS[2]
    local famKey = KEYS[3]
    local presented = ARGV[1]
    local nextHash = ARGV[2]
    local ttl = tonumber(ARGV[3])
    local now = ARGV[4]

    if redis.call('EXISTS', revokedKey) == 1 then return -1 end
    if redis.call('EXISTS', sessKey) == 0 then return -1 end

    local status = redis.call('HGET', sessKey, 'status')
    if status ~= 'active' and status ~= 'renewed' then return -1 end

    local current = redis.call('HGET', sessKey, 'currentRefreshHash')
    if current ~= presented then
      -- reuse of a superseded token: revoke the whole family
      redis.call('SET', revokedKey, '1', 'EX', ttl)
      local members = redis.call('SMEMBERS', famKey)
      for i = 1, #members do
        redis.call('DEL', 'SESSPLACEHOLDER' .. members[i])
      end
      redis.call('DEL', famKey)
      return 0
    end

    redis.call('HSET', sessKey, 'currentRefreshHash', nextHash, 'status', 'renewed', 'lastActivity', now)
    redis.call('EXPIRE', sessKey, ttl)
    return 1
  `;

  async rotate(params: RotateParams): Promise<RotateOutcome> {
    // The family members are session ids; the script deletes their session keys
    // by prefixing. We pass the session-key prefix so the script can build keys.
    const script = RedisSessionStore.ROTATE_LUA.replace("SESSPLACEHOLDER", `${this.prefix}:sess:`);
    const result = (await this.redis.eval(
      script,
      3,
      this.sessKey(params.sessionId),
      this.revokedKey(params.familyId),
      this.famKey(params.familyId),
      params.presentedHash,
      params.nextHash,
      String(params.ttlSeconds),
      String(Date.now()),
    )) as number;

    if (result === 1) return { kind: "rotated" };
    if (result === 0) return { kind: "reuse_detected" };
    return { kind: "invalid" };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.redis.del(this.sessKey(sessionId));
  }

  async revokeFamily(familyId: string, ttlSeconds: number): Promise<void> {
    const members = await this.redis.smembers(this.famKey(familyId));
    const multi = this.redis.multi();
    multi.set(this.revokedKey(familyId), "1", "EX", ttlSeconds);
    for (const sid of members) {
      multi.del(this.sessKey(sid));
    }
    multi.del(this.famKey(familyId));
    await multi.exec();
  }

  async revokeAllForUser(userId: string, ttlSeconds: number): Promise<void> {
    const sids = await this.redis.smembers(this.userKey(userId));
    if (sids.length === 0) {
      return;
    }
    const multi = this.redis.multi();
    for (const sid of sids) {
      const fid = await this.redis.hget(this.sessKey(sid), "familyId");
      if (fid) {
        multi.set(this.revokedKey(fid), "1", "EX", ttlSeconds);
      }
      multi.del(this.sessKey(sid));
    }
    multi.del(this.userKey(userId));
    await multi.exec();
  }
}
