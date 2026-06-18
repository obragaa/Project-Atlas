import { type Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import { type Environment } from "../../config/environment.js";
import { REDIS_CLIENT } from "../infra.tokens.js";

/**
 * Single shared ioredis client (blueprint/17). Explicit connect/command
 * timeouts and a bounded reconnect strategy so a dead Redis fails fast instead
 * of hanging requests (backpressure / no slow-dependency chains). `lazyConnect`
 * keeps the process bootable without Redis (e.g. local PGlite-only runs); the
 * readiness probe then reports Redis `down` rather than the app crashing.
 */
export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService<Environment, true>): Redis => {
    return new Redis(config.get("REDIS_URL", { infer: true }), {
      lazyConnect: true,
      connectTimeout: config.get("REDIS_CONNECT_TIMEOUT_MS", { infer: true }),
      commandTimeout: config.get("REDIS_COMMAND_TIMEOUT_MS", { infer: true }),
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 200, 2_000),
    });
  },
};
