/**
 * Audit trail port (blueprint/15 "Audit Trail" + blueprint/21 fourth pillar
 * "Events"). The audit channel is SEPARATE from technical logs: it records
 * security-relevant facts (who did what, when) that must be retained and are
 * never mixed with operational debug output. Every entry is append-only from the
 * application's point of view; durable, tamper-evident storage is a tracked
 * exception (docs/architecture.md) — today entries flow to a dedicated log
 * channel.
 *
 * An audit entry NEVER contains secrets: no passwords, no raw tokens. Only
 * stable identifiers (userId, sessionId, familyId), the action, and the outcome.
 */
export const AUDIT_LOGGER = Symbol("AUDIT_LOGGER");

/** Auditable actions (blueprint/15 "Audit Trail", 13 "Auditoria"). Extend as
 * modules grow. */
export type AuditAction =
  | "auth.register"
  | "auth.login"
  | "auth.login_failed"
  | "auth.token_refreshed"
  | "auth.logout"
  | "auth.session_revoked"
  | "workout.completed";

export type AuditOutcome = "success" | "failure";

export interface AuditEvent {
  readonly action: AuditAction;
  readonly outcome: AuditOutcome;
  /** The subject the action concerns, when known (opaque user id). */
  readonly userId?: string;
  /** Session/family identifiers when the action is session-scoped. */
  readonly sessionId?: string;
  readonly familyId?: string;
  /** The device the action originated from, when known. */
  readonly deviceId?: string;
  /** Stable machine-readable reason (e.g. "auth.refresh_reuse_detected"). */
  readonly reason?: string;
}

export interface AuditLogger {
  /** Records one immutable audit entry. Must never throw into the caller. */
  record(event: AuditEvent): void;
}
