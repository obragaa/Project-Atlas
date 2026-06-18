import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  type CreateSessionParams,
  type CreatedSession,
  type RotateOutcome,
  type RotateParams,
  type SessionStore,
} from "../domain/session-store.port.js";
import { type SessionRecord, isUsable } from "../domain/session.js";

/**
 * In-memory `SessionStore` mirroring the Redis adapter's semantics (current-hash
 * rotation, reuse-triggered family revocation, tombstones). TRACKED EXCEPTION
 * (blueprint/23): for tests and local runs without Redis. The production adapter
 * is `RedisSessionStore`. Single-process only.
 */
@Injectable()
export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly families = new Map<string, Set<string>>();
  private readonly userSessions = new Map<string, Set<string>>();
  private readonly revokedFamilies = new Set<string>();

  createSession(params: CreateSessionParams): Promise<CreatedSession> {
    const sessionId = uuidv4();
    const familyId = uuidv4();
    const nowMs = Date.now();

    this.sessions.set(sessionId, {
      sessionId,
      familyId,
      userId: params.userId,
      deviceId: params.deviceId,
      status: "active",
      currentRefreshHash: "",
      riskLevel: params.riskLevel,
      issuedAt: nowMs,
      expiresAt: nowMs + params.ttlSeconds * 1_000,
      lastActivity: nowMs,
    });
    addTo(this.families, familyId, sessionId);
    addTo(this.userSessions, params.userId, sessionId);

    return Promise.resolve({ sessionId, familyId });
  }

  bindRefreshHash(sessionId: string, refreshHash: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.currentRefreshHash = refreshHash;
    }
    return Promise.resolve();
  }

  rotate(params: RotateParams): Promise<RotateOutcome> {
    if (this.revokedFamilies.has(params.familyId)) {
      return Promise.resolve({ kind: "invalid" });
    }

    const session = this.sessions.get(params.sessionId);
    if (!session || session.familyId !== params.familyId || !isUsable(session.status)) {
      return Promise.resolve({ kind: "invalid" });
    }

    if (session.currentRefreshHash !== params.presentedHash) {
      // A superseded token was replayed — revoke the whole family (theft).
      this.revokeFamilySync(params.familyId);
      return Promise.resolve({ kind: "reuse_detected" });
    }

    session.currentRefreshHash = params.nextHash;
    session.status = "renewed";
    session.lastActivity = Date.now();
    session.expiresAt = Date.now() + params.ttlSeconds * 1_000;
    return Promise.resolve({ kind: "rotated" });
  }

  revokeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = "revoked";
      this.sessions.delete(sessionId);
    }
    return Promise.resolve();
  }

  revokeFamily(familyId: string): Promise<void> {
    this.revokeFamilySync(familyId);
    return Promise.resolve();
  }

  revokeAllForUser(userId: string): Promise<void> {
    const ids = this.userSessions.get(userId);
    if (ids) {
      for (const sessionId of ids) {
        const session = this.sessions.get(sessionId);
        if (session) {
          this.revokedFamilies.add(session.familyId);
        }
        this.sessions.delete(sessionId);
      }
      this.userSessions.delete(userId);
    }
    return Promise.resolve();
  }

  private revokeFamilySync(familyId: string): void {
    this.revokedFamilies.add(familyId);
    const ids = this.families.get(familyId);
    if (ids) {
      for (const sessionId of ids) {
        this.sessions.delete(sessionId);
      }
      this.families.delete(familyId);
    }
  }
}

function addTo(map: Map<string, Set<string>>, key: string, value: string): void {
  const set = map.get(key) ?? new Set<string>();
  set.add(value);
  map.set(key, set);
}
