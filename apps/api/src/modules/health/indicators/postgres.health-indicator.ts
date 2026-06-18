import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Environment } from "../../../config/environment.js";
import { type DatabaseConnection } from "../../../shared/database/database-connection.js";
import { DATABASE_CONNECTION } from "../../../shared/database/database.tokens.js";
import { type HealthCheckResult, type HealthIndicator } from "../health-indicator.port.js";
import { withTimeout } from "./with-timeout.js";

/**
 * Postgres readiness check. Runs the connection's driver-agnostic `healthcheck()`
 * (a `SELECT 1`) under a short timeout. Reuses the real connection — it never
 * opens a throwaway one — and never touches business tables (blueprint/21).
 */
@Injectable()
export class PostgresHealthIndicator implements HealthIndicator {
  readonly name = "postgres";
  readonly critical = true;
  private readonly timeoutMs: number;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: DatabaseConnection,
    config: ConfigService<Environment, true>,
  ) {
    this.timeoutMs = config.get("READINESS_CHECK_TIMEOUT_MS", { infer: true });
  }

  async check(): Promise<HealthCheckResult> {
    const startedAt = Date.now();
    try {
      await withTimeout(this.connection.healthcheck(), this.timeoutMs);
      return { status: "ok", durationMs: Date.now() - startedAt };
    } catch {
      return {
        status: "down",
        durationMs: Date.now() - startedAt,
        detail: "database unreachable",
      };
    }
  }
}
