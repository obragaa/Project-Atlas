import { Inject, Injectable } from "@nestjs/common";
import { type HealthCheckReport, type HealthReport, type HealthStatus } from "@atlas/contracts";
import { HEALTH_INDICATORS, type HealthIndicator } from "./health-indicator.port.js";
import { ShutdownGate } from "./shutdown.gate.js";

const VERSION = process.env.npm_package_version ?? "0.1.0";

/**
 * Aggregates dependency health into a single readiness report (blueprint/21).
 * Runs all indicators in parallel (bulkhead — one slow/failing dependency never
 * blocks the others, blueprint/17). While shutting down it forces `down` so the
 * load balancer drains the instance.
 */
@Injectable()
export class ReadinessService {
  constructor(
    @Inject(HEALTH_INDICATORS) private readonly indicators: HealthIndicator[],
    private readonly shutdownGate: ShutdownGate,
  ) {}

  async check(): Promise<HealthReport> {
    if (this.shutdownGate.isShuttingDown) {
      return {
        status: "down",
        checkedAt: new Date().toISOString(),
        version: VERSION,
        checks: [{ name: "lifecycle", status: "down", durationMs: 0, detail: "shutting down" }],
      };
    }

    const results = await Promise.allSettled(
      this.indicators.map(async (indicator) => {
        const result = await indicator.check();
        return { indicator, result };
      }),
    );

    const checks: HealthCheckReport[] = [];
    let anyCriticalDown = false;
    let anyNonCriticalDown = false;

    results.forEach((settled, index) => {
      if (settled.status === "fulfilled") {
        const { indicator, result } = settled.value;
        checks.push({
          name: indicator.name,
          status: result.status,
          durationMs: result.durationMs,
          ...(result.detail ? { detail: result.detail } : {}),
        });
        if (result.status === "down") {
          if (indicator.critical) anyCriticalDown = true;
          else anyNonCriticalDown = true;
        }
      } else {
        const indicator = this.indicators[index];
        checks.push({
          name: indicator?.name ?? "unknown",
          status: "down",
          durationMs: 0,
          detail: "check failed",
        });
        if (indicator?.critical ?? true) anyCriticalDown = true;
      }
    });

    const status: HealthStatus = anyCriticalDown ? "down" : anyNonCriticalDown ? "degraded" : "ok";

    return { status, checkedAt: new Date().toISOString(), version: VERSION, checks };
  }
}
