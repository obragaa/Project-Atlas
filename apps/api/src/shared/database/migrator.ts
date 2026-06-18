import { resolve } from "node:path";
import { type DatabaseConnection } from "./database-connection.js";

/**
 * Applies pending Drizzle migrations from `apps/api/drizzle`.
 *
 * Migrations are immutable and applied forward-only (blueprint/13: an applied
 * migration is never edited; corrections come as new migrations). Auto-migration
 * is intended for dev/test; production uses a dedicated advisory-locked deploy
 * step to avoid multi-instance races (doc 12).
 *
 * Works for both drivers: the node-postgres migrator runs the SQL files, and in
 * tests the PGlite migrator (ESM-only) is loaded dynamically.
 */
export async function runMigrations(connection: DatabaseConnection): Promise<void> {
  const migrationsFolder = migrationsDir();

  // Distinguish drivers by whether the dynamic PGlite migrator is needed. The
  // connection's db carries a dialect marker, but the simplest robust signal is
  // to try the node-postgres migrator and fall back to PGlite's.
  const isPglite = connection.constructor.name === "PgliteConnection";

  if (isPglite) {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(connection.db as never, { migrationsFolder });
    return;
  }

  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  await migrate(connection.db as never, { migrationsFolder });
}

function migrationsDir(): string {
  // CommonJS build: __dirname is available. From dist/shared/database (or the
  // src equivalent) climb to apps/api/drizzle, the committed migrations folder.
  return resolve(__dirname, "..", "..", "..", "drizzle");
}
