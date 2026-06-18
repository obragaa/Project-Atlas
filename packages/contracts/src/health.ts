/**
 * Health check contract (blueprint/19 - DevOps.md, 21 - Observability.md).
 * Health endpoints never depend on business logic.
 */

export type HealthStatus = "ok" | "degraded" | "down";

/** Per-dependency check result surfaced by the readiness probe. */
export interface HealthCheckReport {
  readonly name: string;
  readonly status: HealthStatus;
  /** Duration of the check in milliseconds. */
  readonly durationMs: number;
  /** Safe, user-facing detail only — never error internals or secrets. */
  readonly detail?: string;
}

export interface HealthReport {
  readonly status: HealthStatus;
  /** ISO-8601 timestamp of the check. */
  readonly checkedAt: string;
  /** Service version / build identifier. */
  readonly version: string;
  /**
   * Per-dependency results. Present on readiness; absent on liveness (which
   * stays dependency-free, blueprint/21).
   */
  readonly checks?: readonly HealthCheckReport[];
}
