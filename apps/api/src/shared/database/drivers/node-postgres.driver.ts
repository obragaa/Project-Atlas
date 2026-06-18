import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { type ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { type Environment } from "../../../config/environment.js";
import { type DatabaseConnection, type DrizzleDatabase } from "../database-connection.js";
import { schema } from "../schema/index.js";

/**
 * Runtime driver: a single shared node-postgres `Pool` wrapped by Drizzle
 * (blueprint/17 connection pooling, explicit timeouts). CJS-safe — imported
 * statically.
 */
export class NodePostgresConnection implements DatabaseConnection {
  readonly db: DrizzleDatabase;
  private readonly pool: Pool;

  constructor(config: ConfigService<Environment, true>) {
    this.pool = new Pool({
      connectionString: config.get("DATABASE_URL", { infer: true }),
      max: config.get("DATABASE_POOL_MAX", { infer: true }),
      connectionTimeoutMillis: config.get("DATABASE_CONNECT_TIMEOUT_MS", { infer: true }),
      idleTimeoutMillis: config.get("DATABASE_IDLE_TIMEOUT_MS", { infer: true }),
      statement_timeout: config.get("DATABASE_STATEMENT_TIMEOUT_MS", { infer: true }),
      ssl: config.get("DATABASE_SSL", { infer: true }) ? { rejectUnauthorized: false } : undefined,
    });
    this.db = drizzle(this.pool, { schema }) as unknown as DrizzleDatabase;
  }

  async healthcheck(): Promise<void> {
    await this.db.execute(sql`select 1`);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
