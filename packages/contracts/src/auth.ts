/**
 * Authentication transport contract (blueprint/15 - Authentication.md).
 *
 * Identity is opaque and never derived from email/username (doc 15
 * "Identity Model"). Access + refresh token separation per doc 15 ADR-001.
 */

/** Roles in the RBAC model (blueprint/15 - Authentication.md "Roles"). */
export const ROLES = ["user", "coach", "administrator", "support"] as const;
export type Role = (typeof ROLES)[number];

/** Registration request — collects only what is essential (doc 08 "Cadastro"). */
export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
}

/** Credential login request. */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

/** Refresh request — rotates the refresh token (doc 15 "Token Rotation"). */
export interface RefreshRequest {
  readonly refreshToken: string;
}

/** The authenticated session's token pair. */
export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  /** Access token lifetime in seconds. */
  readonly expiresIn: number;
  readonly tokenType: "Bearer";
}

/** Public, non-sensitive view of the authenticated user. */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly Role[];
}

/** Successful authentication response. */
export interface AuthSession {
  readonly user: AuthenticatedUser;
  readonly tokens: TokenPair;
}
