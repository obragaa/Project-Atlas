/**
 * DI tokens for shared backing-service clients. A single global InfraModule owns
 * these singletons so the whole process shares one Redis connection
 * (blueprint/12 multiple-instances, connection budget).
 */
export const REDIS_CLIENT = Symbol("REDIS_CLIENT");
