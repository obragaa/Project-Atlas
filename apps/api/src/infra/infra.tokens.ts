import { type Redis } from "ioredis";

/**
 * DI tokens for shared backing-service clients. A single global InfraModule owns
 * these singletons so the whole process shares one Redis connection
 * (blueprint/12 multiple-instances, connection budget).
 */
export const REDIS_CLIENT = Symbol("REDIS_CLIENT");

/**
 * The shared Redis client's type, re-exported from the infra layer so
 * composition roots can type the injected singleton without importing the
 * driver directly (the `ioredis` import stays Infrastructure-only, blueprint/12).
 */
export type RedisClient = Redis;
