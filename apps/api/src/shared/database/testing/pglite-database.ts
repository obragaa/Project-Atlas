import { PgliteConnection } from "../drivers/pglite.driver.js";
import { runMigrations } from "../migrator.js";
import { type DatabaseConnection } from "../database-connection.js";

/**
 * Spins up an isolated, freshly-migrated PGlite-backed `DatabaseConnection` for
 * integration tests (blueprint/18: deterministic, isolated, reproducible — each
 * suite gets its own in-process Postgres, no shared env). Test-only utility.
 */
export async function createTestDatabase(): Promise<DatabaseConnection> {
  const connection = await PgliteConnection.create();
  await runMigrations(connection);
  return connection;
}
