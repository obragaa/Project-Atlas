import { type PgDatabase } from "drizzle-orm/pg-core";
import { type schema } from "./schema/index.js";

/**
 * Engine-agnostic Drizzle handle. Both the node-postgres and PGlite drivers
 * produce a structurally compatible query builder over the same `schema`, so
 * repositories are byte-identical across runtime and tests.
 */
export type DrizzleDatabase = PgDatabase<never, typeof schema>;

/**
 * The connection abstraction (blueprint/12 Dependency Rule). Hides whether the
 * engine is node-postgres or PGlite. Exposes the Drizzle handle, a healthcheck
 * seam used by the readiness probe (so it never opens a throwaway connection),
 * and explicit lifecycle control for ordered shutdown (blueprint/20).
 */
export interface DatabaseConnection {
  /** The Drizzle query handle. */
  readonly db: DrizzleDatabase;

  /**
   * A trivial liveness query (`SELECT 1`) used by the Postgres health
   * indicator. Never touches business tables (blueprint/21).
   */
  healthcheck(): Promise<void>;

  /** Closes the underlying pool/instance. Called last during shutdown. */
  close(): Promise<void>;
}
