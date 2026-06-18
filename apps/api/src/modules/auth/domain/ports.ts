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

export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");

export interface AccessTokenClaims {
  readonly sub: string;
  readonly roles: readonly Role[];
}

export interface TokenService {
  issueAccessToken(claims: AccessTokenClaims): Promise<string>;
  issueRefreshToken(subject: string): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenClaims>;
  verifyRefreshToken(token: string): Promise<{ sub: string }>;
  /** Access token lifetime in seconds (advertised to clients). */
  readonly accessTokenTtl: number;
}
