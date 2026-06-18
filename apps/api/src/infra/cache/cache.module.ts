import { Global, Module } from "@nestjs/common";
import { CACHE } from "./cache.port.js";
import { InMemoryCache } from "./in-memory-cache.adapter.js";

/**
 * Global cache module (blueprint/17). Binds CACHE -> InMemoryCache for now; a
 * Redis-backed adapter (reusing REDIS_CLIENT) can replace it in one line with
 * zero changes at call sites (Dependency Rule, blueprint/12).
 */
@Global()
@Module({
  providers: [{ provide: CACHE, useClass: InMemoryCache }],
  exports: [CACHE],
})
export class CacheModule {}
