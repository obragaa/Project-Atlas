import { Inject, Injectable } from "@nestjs/common";
import { type AuthSession, type TokenPair } from "@atlas/contracts";
import {
  REFRESH_TOKEN_HASHER,
  type RefreshTokenHasher,
  TOKEN_SERVICE,
  type TokenService,
} from "../domain/ports.js";
import { SESSION_STORE, type SessionStore } from "../domain/session-store.port.js";
import { type SessionRiskLevel } from "../domain/session.js";
import { type User } from "../domain/user.js";
import { toAuthenticatedUser } from "./session.mapper.js";

export interface SessionContext {
  readonly deviceId: string;
  readonly riskLevel: SessionRiskLevel;
}

/**
 * Turns a successful authentication into a tracked session (blueprint/15:
 * "every authentication == one Created->Active session"). Owns the orchestration
 * the transport mapper must not: create the session, issue the access+refresh
 * pair with sid/fid embedded, and register the initial refresh-hash. Lives in
 * the Application layer; depends only on ports.
 */
@Injectable()
export class SessionFactory {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(SESSION_STORE) private readonly sessions: SessionStore,
    @Inject(REFRESH_TOKEN_HASHER) private readonly refreshHasher: RefreshTokenHasher,
  ) {}

  async openSession(user: User, context: SessionContext): Promise<AuthSession> {
    return {
      user: toAuthenticatedUser(user),
      tokens: await this.issueForNewSession(user, context),
    };
  }

  private async issueForNewSession(user: User, context: SessionContext): Promise<TokenPair> {
    const ttl = this.tokens.refreshTokenTtl;
    const subject = user.id.toString();

    // Mint the session first so the refresh token can embed sid/fid.
    const { sessionId, familyId } = await this.sessions.createSession({
      userId: subject,
      deviceId: context.deviceId,
      riskLevel: context.riskLevel,
      ttlSeconds: ttl,
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.tokens.issueAccessToken({ sub: subject, roles: [...user.roles] }),
      this.tokens.issueRefreshToken(subject, { sid: sessionId, fid: familyId }),
    ]);

    // Register the issued token's hash as the session's current refresh hash.
    await this.sessions.bindRefreshHash(sessionId, this.refreshHasher.hash(refreshToken), ttl);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.tokens.accessTokenTtl,
      tokenType: "Bearer",
    };
  }
}
