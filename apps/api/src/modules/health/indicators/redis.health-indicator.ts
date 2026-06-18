import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Redis } from "ioredis";
import { type Environment } from "../../../config/environment.js";
import { REDIS_CLIENT } from "../../../infra/infra.tokens.js";
import { type HealthCheckResult, type HealthIndicator } from "../health-indicator.port.js";
import { withTimeout } from "./with-timeout.js";

/**
 * Redis readiness check. Issues a `PING` under a short timeout; a missing or
 * unreachable Redis maps to `down`. Liveness-only — no key access (blueprint/21).
 */
@Injectable()
export class RedisHealthIndicator implements HealthIndicator {
  readonly name = "redis";
  readonly critical = true;
  private readonly timeoutMs: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    config: ConfigService<Environment, true>,
  ) {
    this.timeoutMs = config.get("READINESS_CHECK_TIMEOUT_MS", { infer: true });
  }

  async check(): Promise<HealthCheckResult> {
    const startedAt = Date.now();
    try {
      const pong = await withTimeout(this.redis.ping(), this.timeoutMs);
      const status = pong === "PONG" ? "ok" : "down";
      return { status, durationMs: Date.now() - startedAt };
    } catch {
      return {
        status: "down",
        durationMs: Date.now() - startedAt,
        detail: "cache unreachable",
      };
    }
  }
}
