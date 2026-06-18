import { Inject, Injectable } from "@nestjs/common";
import { type TokenPair } from "@atlas/contracts";
import { AuthenticationError } from "../../../shared/domain/errors.js";
import { AUDIT_LOGGER, type AuditLogger } from "../../../shared/audit/audit-logger.port.js";
import {
  REFRESH_TOKEN_HASHER,
  type RefreshTokenHasher,
  TOKEN_SERVICE,
  type TokenService,
  USER_REPOSITORY,
  type UserRepository,
} from "../domain/ports.js";
import { SESSION_STORE, type SessionStore } from "../domain/session-store.port.js";
import { UserId } from "../domain/user-id.js";

export interface RefreshSessionCommand {
  readonly refreshToken: string;
}

/**
 * Rotates a refresh token (blueprint/15 "Token Rotation", remediates the
 * "Refresh Token reutilizável" + "Sessões sem revogação" anti-patterns).
 *
 * Flow: verify the JWT, extract sid/fid, then atomically rotate in the store —
 * comparing the presented token's hash to the session's current hash. Replaying
 * a superseded token is treated as theft and revokes the entire family
 * (fail-secure). Only the most recently issued refresh token is ever valid.
 */
@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(SESSION_STORE) private readonly sessions: SessionStore,
    @Inject(REFRESH_TOKEN_HASHER) private readonly refreshHasher: RefreshTokenHasher,
    @Inject(AUDIT_LOGGER) private readonly audit: AuditLogger,
  ) {}

  async execute(command: RefreshSessionCommand): Promise<TokenPair> {
    const claims = await this.verify(command.refreshToken);
    const ttl = this.tokens.refreshTokenTtl;

    const user = await this.users.findById(UserId.create(claims.sub));
    if (!user) {
      throw new AuthenticationError("Sessão inválida ou expirada.", "auth.invalid_refresh");
    }

    // Issue the next refresh token up front so its hash can be the swap target.
    const nextRefreshToken = await this.tokens.issueRefreshToken(claims.sub, {
      sid: claims.sid,
      fid: claims.fid,
    });

    const outcome = await this.sessions.rotate({
      sessionId: claims.sid,
      familyId: claims.fid,
      presentedHash: this.refreshHasher.hash(command.refreshToken),
      nextHash: this.refreshHasher.hash(nextRefreshToken),
      ttlSeconds: ttl,
    });

    if (outcome.kind === "reuse_detected") {
      // A superseded token was replayed: the store revoked the whole family.
      // This is a security event, not a routine failure (blueprint/15 Audit).
      this.audit.record({
        action: "auth.session_revoked",
        outcome: "failure",
        userId: claims.sub,
        sessionId: claims.sid,
        familyId: claims.fid,
        reason: "auth.refresh_reuse_detected",
      });
      throw new AuthenticationError(
        "Detectamos um problema de segurança na sua sessão. Entre novamente.",
        "auth.refresh_reuse_detected",
      );
    }
    if (outcome.kind === "invalid") {
      throw new AuthenticationError("Sessão inválida ou expirada.", "auth.invalid_refresh");
    }

    const accessToken = await this.tokens.issueAccessToken({
      sub: claims.sub,
      roles: [...user.roles],
    });

    this.audit.record({
      action: "auth.token_refreshed",
      outcome: "success",
      userId: claims.sub,
      sessionId: claims.sid,
      familyId: claims.fid,
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      expiresIn: this.tokens.accessTokenTtl,
      tokenType: "Bearer",
    };
  }

  private async verify(token: string) {
    try {
      return await this.tokens.verifyRefreshToken(token);
    } catch {
      throw new AuthenticationError("Sessão inválida ou expirada.", "auth.invalid_refresh");
    }
  }
}
