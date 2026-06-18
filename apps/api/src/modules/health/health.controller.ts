import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { type HealthReport } from "@atlas/contracts";
import { Public } from "../auth/presentation/public.decorator.js";

/**
 * Health probes (blueprint/19 - DevOps.md, 21 - Observability.md). These never
 * touch business logic or the database's correctness — they only confirm the
 * process is alive and ready to serve. Unauthenticated by design.
 */
@Public()
@Controller({ path: "health", version: VERSION_NEUTRAL })
export class HealthController {
  private readonly version = process.env.npm_package_version ?? "0.1.0";

  @Get("live")
  liveness(): HealthReport {
    return {
      status: "ok",
      checkedAt: new Date().toISOString(),
      version: this.version,
    };
  }

  @Get("ready")
  readiness(): HealthReport {
    // Readiness will later verify critical dependencies (DB, cache) once they
    // exist. The skeleton reports ready.
    return {
      status: "ok",
      checkedAt: new Date().toISOString(),
      version: this.version,
    };
  }
}
