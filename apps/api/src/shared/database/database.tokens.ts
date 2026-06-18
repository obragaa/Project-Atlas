/**
 * DI tokens for the database layer. Symbols mirror the auth ports convention so
 * the concrete driver (node-postgres vs PGlite) stays invisible to consumers
 * (blueprint/12 Dependency Rule).
 */

/** The Drizzle query handle (engine-agnostic query builder). */
export const DRIZZLE = Symbol("DRIZZLE");

/** The connection abstraction: transactions, healthcheck, lifecycle. */
export const DATABASE_CONNECTION = Symbol("DATABASE_CONNECTION");
