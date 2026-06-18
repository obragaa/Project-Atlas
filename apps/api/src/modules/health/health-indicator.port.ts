import { type HealthStatus } from "@atlas/contracts";

/**
 * Multi-provider DI token: every dependency check is registered under this token
 * so the ReadinessService can inject them all (blueprint/21).
 */
export const HEALTH_INDICATORS = Symbol("HEALTH_INDICATORS");

export interface HealthCheckResult {
  readonly status: HealthStatus;
  readonly durationMs: number;
  /** Safe detail only — never error internals or secrets (blueprint/16/21). */
  readonly detail?: string;
}

/**
 * A single dependency health check. Implementations run a trivial liveness probe
 * (SELECT 1 / PING) — never business logic (blueprint/21 "Health Checks never
 * validate business rules").
 */
export interface HealthIndicator {
  readonly name: string;
  /** When true, a `down` result fails readiness (503); else it degrades it. */
  readonly critical: boolean;
  check(): Promise<HealthCheckResult>;
}
