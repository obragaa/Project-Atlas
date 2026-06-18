import { Controller, Get, HttpStatus, Res, VERSION_NEUTRAL } from "@nestjs/common";
import { type HealthReport } from "@atlas/contracts";
import { type Response } from "express";
import { Public } from "../auth/presentation/public.decorator.js";
import { ReadinessService } from "./readiness.service.js";

/**
 * Health probes (blueprint/19, 21). Liveness and startup stay dependency-free;
 * readiness verifies critical dependencies. Unauthenticated by design.
 *
 * Readiness returns the `HealthReport` body with an explicit 200/503 status and
 * does NOT throw, so the global ProblemDetailsFilter never rewrites the body
 * into application/problem+json.
 */
@Public()
@Controller({ path: "health", version: VERSION_NEUTRAL })
export class HealthController {
  private readonly version = process.env.npm_package_version ?? "0.1.0";

  constructor(private readonly readiness: ReadinessService) {}

  @Get("live")
  liveness(): HealthReport {
    // Dependency-free: proves the event loop is up (blueprint/21).
    return {
      status: "ok",
      checkedAt: new Date().toISOString(),
      version: this.version,
    };
  }

  @Get("startup")
  startup(): HealthReport {
    // Dependency-free: the process has booted. Distinguishes "still booting"
    // from "failed" for the orchestrator (blueprint/21).
    return {
      status: "ok",
      checkedAt: new Date().toISOString(),
      version: this.version,
    };
  }

  @Get("ready")
  async readinessProbe(@Res() res: Response): Promise<void> {
    const report = await this.readiness.check();
    const code = report.status === "down" ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;
    res.status(code).json(report);
  }
}
