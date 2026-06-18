import { Inject, Injectable } from "@nestjs/common";
import { AUDIT_LOGGER, type AuditLogger } from "../../../shared/audit/audit-logger.port.js";
import { TOKEN_SERVICE, type TokenService } from "../domain/ports.js";
import { SESSION_STORE, type SessionStore } from "../domain/session-store.port.js";

export interface LogoutCommand {
  readonly refreshToken: string;
  /** When true, revokes every session for the user (logout everywhere). */
  readonly allDevices?: boolean;
}

/**
 * Revokes the caller's session (blueprint/15: logout is real, not a no-op). By
 * default it revokes this login chain (the family); `allDevices` revokes every
 * session for the user. The access token still expires on its own (the guard is
 * stateless), but the refresh path is dead immediately.
 *
 * Logout is idempotent and never leaks whether the token was valid: a bad or
 * expired token simply results in nothing to revoke.
 */
@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(SESSION_STORE) private readonly sessions: SessionStore,
    @Inject(AUDIT_LOGGER) private readonly audit: AuditLogger,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const ttl = this.tokens.refreshTokenTtl;

    let claims;
    try {
      claims = await this.tokens.verifyRefreshToken(command.refreshToken);
    } catch {
      // Nothing to revoke; logout is idempotent and silent (fail-closed).
      return;
    }

    if (command.allDevices) {
      await this.sessions.revokeAllForUser(claims.sub, ttl);
      this.audit.record({
        action: "auth.logout",
        outcome: "success",
        userId: claims.sub,
        reason: "all_devices",
      });
      return;
    }

    await this.sessions.revokeFamily(claims.fid, ttl);
    this.audit.record({
      action: "auth.logout",
      outcome: "success",
      userId: claims.sub,
      sessionId: claims.sid,
      familyId: claims.fid,
    });
  }
}
