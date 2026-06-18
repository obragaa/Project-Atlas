/**
 * Session model (blueprint/15 "Session Model" + "Session Lifecycle"). The store
 * (Redis) is the source of truth for session state; this module defines the
 * shape, the lifecycle status, and the legal transitions. The raw refresh token
 * never lives here — only a reference to its current at-rest hash.
 */

export const SESSION_STATUSES = ["created", "active", "renewed", "expired", "revoked"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export type SessionRiskLevel = "low" | "medium" | "high";

/** A session record as held by the store. */
export interface SessionRecord {
  readonly sessionId: string;
  readonly familyId: string;
  readonly userId: string;
  readonly deviceId: string;
  status: SessionStatus;
  /** Keyed SHA-256 of the most-recent refresh token (never plaintext). */
  currentRefreshHash: string;
  riskLevel: SessionRiskLevel;
  readonly issuedAt: number;
  expiresAt: number;
  lastActivity: number;
}

/** A session is usable for rotation only while active or renewed. */
export function isUsable(status: SessionStatus): boolean {
  return status === "active" || status === "renewed";
}
