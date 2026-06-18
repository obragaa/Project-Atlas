import {
  type DynamicModule,
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Environment } from "../../config/environment.js";
import { type DatabaseConnection } from "./database-connection.js";
import { NodePostgresConnection } from "./drivers/node-postgres.driver.js";
import { PgliteConnection } from "./drivers/pglite.driver.js";
import { DATABASE_CONNECTION, DRIZZLE } from "./database.tokens.js";
import { runMigrations } from "./migrator.js";

/**
 * Global database module (blueprint/12, 13). Owns the single connection for the
 * process, selects the driver from `DATABASE_DRIVER`, exposes the Drizzle handle
 * and the connection abstraction, and closes the connection last during ordered
 * shutdown (blueprint/20).
 */
@Global()
@Module({})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_CONNECTION) private readonly connection: DatabaseConnection) {}

  static forRoot(): DynamicModule {
    const connectionProvider = {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: async (config: ConfigService<Environment, true>): Promise<DatabaseConnection> => {
        const connection =
          config.get("DATABASE_DRIVER", { infer: true }) === "pglite"
            ? await PgliteConnection.create()
            : new NodePostgresConnection(config);

        if (config.get("DATABASE_AUTO_MIGRATE", { infer: true })) {
          await runMigrations(connection);
        }
        return connection;
      },
    };

    const drizzleProvider = {
      provide: DRIZZLE,
      inject: [DATABASE_CONNECTION],
      useFactory: (connection: DatabaseConnection) => connection.db,
    };

    return {
      module: DatabaseModule,
      providers: [connectionProvider, drizzleProvider],
      exports: [DATABASE_CONNECTION, DRIZZLE],
    };
  }

  async onApplicationShutdown(): Promise<void> {
    await this.connection.close();
  }
}
