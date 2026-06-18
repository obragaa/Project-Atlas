import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller.js";
import { ReadinessService } from "./readiness.service.js";
import { ShutdownGate } from "./shutdown.gate.js";
import { HEALTH_INDICATORS, type HealthIndicator } from "./health-indicator.port.js";
import { PostgresHealthIndicator } from "./indicators/postgres.health-indicator.js";
import { RedisHealthIndicator } from "./indicators/redis.health-indicator.js";

/**
 * Health module. Registers the dependency indicators and aggregates them under
 * the HEALTH_INDICATORS token (Nest has no native multi-provider, so a factory
 * collects the individually-provided indicators into the array the
 * ReadinessService consumes).
 */
@Module({
  controllers: [HealthController],
  providers: [
    ReadinessService,
    ShutdownGate,
    PostgresHealthIndicator,
    RedisHealthIndicator,
    {
      provide: HEALTH_INDICATORS,
      inject: [PostgresHealthIndicator, RedisHealthIndicator],
      useFactory: (postgres: HealthIndicator, redis: HealthIndicator): HealthIndicator[] => [
        postgres,
        redis,
      ],
    },
  ],
})
export class HealthModule {}
