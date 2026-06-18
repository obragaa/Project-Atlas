import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { type Role } from "@atlas/contracts";
import { type AccessTokenClaims, type TokenService } from "../domain/ports.js";
import { type Environment } from "../../../config/environment.js";

/**
 * JWT-based token service (blueprint/15 ADR-001: separate short-lived access
 * tokens from longer-lived refresh tokens, signed with distinct secrets so a
 * leak of one does not compromise the other).
 */
@Injectable()
export class JwtTokenService implements TokenService {
  readonly accessTokenTtl: number;
  private readonly refreshTtl: number;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService<Environment, true>,
  ) {
    this.accessTokenTtl = config.get("AUTH_ACCESS_TOKEN_TTL", { infer: true });
    this.refreshTtl = config.get("AUTH_REFRESH_TOKEN_TTL", { infer: true });
    this.accessSecret = config.get("AUTH_ACCESS_TOKEN_SECRET", { infer: true });
    this.refreshSecret = config.get("AUTH_REFRESH_TOKEN_SECRET", { infer: true });
  }

  issueAccessToken(claims: AccessTokenClaims): Promise<string> {
    return this.jwt.signAsync(
      { sub: claims.sub, roles: claims.roles },
      { secret: this.accessSecret, expiresIn: this.accessTokenTtl },
    );
  }

  issueRefreshToken(subject: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: subject, typ: "refresh" },
      { secret: this.refreshSecret, expiresIn: this.refreshTtl },
    );
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const payload = await this.jwt.verifyAsync<{ sub: string; roles: Role[] }>(token, {
      secret: this.accessSecret,
    });
    return { sub: payload.sub, roles: payload.roles };
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    const payload = await this.jwt.verifyAsync<{ sub: string; typ?: string }>(token, {
      secret: this.refreshSecret,
    });
    if (payload.typ !== "refresh") {
      throw new Error("Not a refresh token.");
    }
    return { sub: payload.sub };
  }
}
