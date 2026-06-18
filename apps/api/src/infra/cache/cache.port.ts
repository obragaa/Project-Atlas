/**
 * Application cache port (blueprint/17 "Application Cache" layer). The cache is
 * never the source of truth and is fully discardable; callers must tolerate a
 * miss. `ttlSeconds` is REQUIRED on `set` so every entry has an explicit
 * invalidation policy by construction (doc 17).
 *
 * Keying convention: `namespace:entity:id` (e.g. `user:profile:<uuid>`).
 */
export const CACHE = Symbol("CACHE");

export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}
