import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { type Redis } from "ioredis";
import { redisProvider } from "./cache/redis.provider.js";
import { REDIS_CLIENT } from "./infra.tokens.js";

/**
 * Global infrastructure module (blueprint/20). Owns the shared backing-service
 * clients (currently the Redis connection) and closes them during ordered
 * shutdown. The Postgres connection is owned by DatabaseModule; both close on
 * shutdown after the drain window enforced by the ShutdownGate.
 */
@Global()
@Module({
  providers: [redisProvider],
  exports: [REDIS_CLIENT],
})
export class InfraModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    // quit() drains pending replies then closes; ignore if never connected.
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }
}
