import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import { type Role } from "@atlas/contracts";
import {
  type AccessTokenClaims,
  type RefreshTokenClaims,
  type RefreshTokenContext,
  type TokenService,
} from "../domain/ports.js";
import { type Environment } from "../../../config/environment.js";

/**
 * JWT-based token service (blueprint/15 ADR-001: separate short-lived access
 * tokens from longer-lived refresh tokens, signed with distinct secrets so a
 * leak of one does not compromise the other). The refresh token carries session
 * context (sid/fid/jti) so the store can locate the session in O(1) from a
 * presented token; the access token stays minimal so the guard remains
 * stateless.
 */
@Injectable()
export class JwtTokenService implements TokenService {
  readonly accessTokenTtl: number;
  readonly refreshTokenTtl: number;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService<Environment, true>,
  ) {
    this.accessTokenTtl = config.get("AUTH_ACCESS_TOKEN_TTL", { infer: true });
    this.refreshTokenTtl = config.get("AUTH_REFRESH_TOKEN_TTL", { infer: true });
    this.accessSecret = config.get("AUTH_ACCESS_TOKEN_SECRET", { infer: true });
    this.refreshSecret = config.get("AUTH_REFRESH_TOKEN_SECRET", { infer: true });
  }

  issueAccessToken(claims: AccessTokenClaims): Promise<string> {
    return this.jwt.signAsync(
      { sub: claims.sub, roles: claims.roles },
      { secret: this.accessSecret, expiresIn: this.accessTokenTtl },
    );
  }

  issueRefreshToken(subject: string, context: RefreshTokenContext): Promise<string> {
    return this.jwt.signAsync(
      { sub: subject, typ: "refresh", sid: context.sid, fid: context.fid, jti: uuidv4() },
      { secret: this.refreshSecret, expiresIn: this.refreshTokenTtl },
    );
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const payload = await this.jwt.verifyAsync<{ sub: string; roles: Role[] }>(token, {
      secret: this.accessSecret,
    });
    return { sub: payload.sub, roles: payload.roles };
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenClaims> {
    const payload = await this.jwt.verifyAsync<{
      sub: string;
      typ?: string;
      sid?: string;
      fid?: string;
      jti?: string;
    }>(token, { secret: this.refreshSecret });

    if (payload.typ !== "refresh" || !payload.sid || !payload.fid || !payload.jti) {
      throw new Error("Not a valid refresh token.");
    }
    return { sub: payload.sub, sid: payload.sid, fid: payload.fid, jti: payload.jti };
  }
}
