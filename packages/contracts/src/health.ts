/**
 * Health check contract (blueprint/19 - DevOps.md, 21 - Observability.md).
 * Health endpoints never depend on business logic.
 */

export type HealthStatus = "ok" | "degraded" | "down";

export interface HealthReport {
  readonly status: HealthStatus;
  /** ISO-8601 timestamp of the check. */
  readonly checkedAt: string;
  /** Service version / build identifier. */
  readonly version: string;
}
