import { type Role } from "@atlas/contracts";
import { type User } from "./user.js";
import { type UserId } from "./user-id.js";
import { type Email } from "./value-objects/email.js";

/**
 * Domain ports — abstractions the Application layer depends on. Implementations
 * live in Infrastructure (blueprint/12 Dependency Rule: dependencies point
 * inward; the domain never knows the concrete adapter). Injected by DI token.
 */

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
  save(user: User): Promise<void>;
}

export const PASSWORD_HASHER = Symbol("PASSWORD_HASHER");

export interface PasswordHasher {
  hash(plaintext: string): Promise<string>;
  verify(hash: string, plaintext: string): Promise<boolean>;
}

export const REFRESH_TOKEN_HASHER = Symbol("REFRESH_TOKEN_HASHER");

/** Hashes refresh tokens for at-rest storage (never plaintext, blueprint/15). */
export interface RefreshTokenHasher {
  hash(rawToken: string): string;
  matches(a: string, b: string): boolean;
}

export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");

export interface AccessTokenClaims {
  readonly sub: string;
  readonly roles: readonly Role[];
}

/** Session context embedded in a refresh token so the store finds it in O(1). */
export interface RefreshTokenContext {
  readonly sid: string;
  readonly fid: string;
}

export interface RefreshTokenClaims extends RefreshTokenContext {
  readonly sub: string;
  /** Per-rotation unique id. */
  readonly jti: string;
}

export interface TokenService {
  issueAccessToken(claims: AccessTokenClaims): Promise<string>;
  issueRefreshToken(subject: string, context: RefreshTokenContext): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenClaims>;
  verifyRefreshToken(token: string): Promise<RefreshTokenClaims>;
  /** Access token lifetime in seconds (advertised to clients). */
  readonly accessTokenTtl: number;
  /** Refresh token lifetime in seconds (drives session/key TTLs). */
  readonly refreshTokenTtl: number;
}
