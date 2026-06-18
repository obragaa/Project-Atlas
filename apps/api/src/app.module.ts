import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { loadEnvironment } from "./config/environment.js";
import {
  CORRELATION_ID_HEADER,
  CorrelationIdMiddleware,
  getCorrelationId,
} from "./shared/http/correlation-id.middleware.js";
import { DatabaseModule } from "./shared/database/database.module.js";
import { SharedKernelModule } from "./shared/shared-kernel.module.js";
import { InfraModule } from "./infra/infra.module.js";
import { CacheModule } from "./infra/cache/cache.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { WorkoutsModule } from "./modules/workouts/workouts.module.js";
import { ExercisesModule } from "./modules/exercises/exercises.module.js";
import { type Request } from "express";

/**
 * Root composition module. Wires cross-cutting concerns (validated config,
 * structured logging with correlation ids — blueprint/21) and mounts domain
 * modules. Domain modules never import the framework into their Domain layer.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: loadEnvironment,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? "info",
        // Correlation id ties every log line to its request (blueprint/21).
        customProps: (req) => ({
          correlationId: getCorrelationId(req as unknown as Request),
        }),
        // Never log secrets or sensitive headers (blueprint/16 - Security.md,
        // 15 "0 credenciais em logs"). Covers every auth body shape: register/
        // login (password), refresh/logout (refreshToken), and any echoed token.
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.body.password",
            "req.body.refreshToken",
            "req.body.accessToken",
            "res.body.tokens.accessToken",
            "res.body.tokens.refreshToken",
            "res.body.accessToken",
            "res.body.refreshToken",
          ],
          remove: true,
        },
        autoLogging: true,
      },
    }),
    InfraModule,
    SharedKernelModule,
    CacheModule,
    DatabaseModule.forRoot(),
    AuthModule,
    WorkoutsModule,
    ExercisesModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Correlation id runs first so it is available to logs and handlers.
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}

export { CORRELATION_ID_HEADER };
