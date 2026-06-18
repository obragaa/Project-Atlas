import { Injectable } from "@nestjs/common";
import { type CachePort } from "./cache.port.js";

interface Entry {
  value: unknown;
  expiresAt: number;
}

/**
 * In-memory `CachePort` adapter.
 *
 * TRACKED EXCEPTION (blueprint/23, same convention as the former in-memory
 * repository): NOT the source of truth, fully discardable, callers must tolerate
 * a miss. Per-instance only — no cross-instance coherence. Swap for a
 * Redis-backed adapter (reusing REDIS_CLIENT) with zero domain impact when a
 * read path needs cross-instance caching.
 *
 * Owner: backend. Removal/upgrade condition: a real cross-instance read path.
 */
@Injectable()
export class InMemoryCache implements CachePort {
  private readonly store = new Map<string, Entry>();

  get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return Promise.resolve(null);
    }
    if (entry.expiresAt <= now()) {
      this.store.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(entry.value as T);
  }

  set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: now() + ttlSeconds * 1_000 });
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }
}

function now(): number {
  return Date.now();
}
