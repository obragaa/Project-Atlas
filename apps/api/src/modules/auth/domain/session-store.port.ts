import { type SessionRiskLevel } from "./session.js";

/**
 * Session store port (blueprint/15). The Application layer depends on this;
 * Redis is invisible here (Dependency Rule). An in-memory adapter mirrors it for
 * tests.
 */
export const SESSION_STORE = Symbol("SESSION_STORE");

export interface CreateSessionParams {
  readonly userId: string;
  readonly deviceId: string;
  readonly riskLevel: SessionRiskLevel;
  /** Session lifetime in seconds (the refresh-token window). */
  readonly ttlSeconds: number;
}

export interface CreatedSession {
  readonly sessionId: string;
  readonly familyId: string;
}

export interface RotateParams {
  readonly sessionId: string;
  readonly familyId: string;
  /** Keyed SHA-256 of the refresh token the client presented. */
  readonly presentedHash: string;
  /** Keyed SHA-256 of the new refresh token to store on success. */
  readonly nextHash: string;
  readonly ttlSeconds: number;
}

export type RotateOutcome =
  | { readonly kind: "rotated" }
  /** A superseded token was replayed — the family was revoked (theft signal). */
  | { readonly kind: "reuse_detected" }
  /** No usable session for these ids (missing, expired, or already revoked). */
  | { readonly kind: "invalid" };

export interface SessionStore {
  /** Mints a new session (status active) with sid+fid; no refresh hash yet. */
  createSession(params: CreateSessionParams): Promise<CreatedSession>;
  /** Binds the initial refresh-token hash once the token has been issued. */
  bindRefreshHash(sessionId: string, refreshHash: string, ttlSeconds: number): Promise<void>;
  /** Atomic compare-current-hash-then-swap; detects reuse (blueprint/15). */
  rotate(params: RotateParams): Promise<RotateOutcome>;
  /** Revoke a single session (one device). */
  revokeSession(sessionId: string): Promise<void>;
  /** Revoke an entire login chain (on reuse, logout, compromise). */
  revokeFamily(familyId: string, ttlSeconds: number): Promise<void>;
  /** Revoke every session for a user (logout-everywhere, password change). */
  revokeAllForUser(userId: string, ttlSeconds: number): Promise<void>;
}
