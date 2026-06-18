import { sql } from "drizzle-orm";
import { type DatabaseConnection, type DrizzleDatabase } from "../database-connection.js";
import { schema } from "../schema/index.js";

/**
 * Test/local driver backed by PGlite (real Postgres, in-process). PGlite and
 * `drizzle-orm/pglite` are ESM-only; under our CommonJS build they MUST be
 * loaded via dynamic import so production never bundles them.
 *
 * Use `NodePostgresConnection` for runtime; this exists for deterministic,
 * isolated integration tests (blueprint/18) and local runs without Docker.
 */
export class PgliteConnection implements DatabaseConnection {
  private constructor(
    readonly db: DrizzleDatabase,
    private readonly client: { close: () => Promise<void> },
  ) {}

  /** Async factory — PGlite/drizzle-pglite are imported lazily (ESM-only). */
  static async create(dataDir?: string): Promise<PgliteConnection> {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");

    const client = new PGlite(dataDir);
    const db = drizzle(client, { schema }) as unknown as DrizzleDatabase;
    return new PgliteConnection(db, client);
  }

  async healthcheck(): Promise<void> {
    await this.db.execute(sql`select 1`);
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
