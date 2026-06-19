import { Inject, Module, type OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectPinoLogger, type PinoLogger } from "nestjs-pino";
import { type Environment } from "../../config/environment.js";
import { type DrizzleDatabase } from "../../shared/database/database-connection.js";
import { DRIZZLE } from "../../shared/database/database.tokens.js";
import { EXERCISE_REPOSITORY } from "./domain/exercise.repository.js";
import { PostgresExerciseRepository } from "./infrastructure/postgres-exercise.repository.js";
import { seedExercises } from "./infrastructure/seed/seed-exercises.js";
import { ListExercisesUseCase } from "./application/list-exercises.use-case.js";
import { GetExerciseUseCase } from "./application/get-exercise.use-case.js";
import { ExercisesController } from "./presentation/exercises.controller.js";

/**
 * Exercises module composition (blueprint/12). Binds the read-only catalogue
 * port to its Postgres adapter and registers the query use cases.
 *
 * On bootstrap it idempotently seeds the catalogue — but only when auto-migrate
 * is enabled (dev/test), mirroring the migration gate. In production the seed
 * ships through the same advisory-locked deploy step as migrations, never on a
 * live boot (doc 13/12).
 */
@Module({
  controllers: [ExercisesController],
  providers: [
    ListExercisesUseCase,
    GetExerciseUseCase,
    { provide: EXERCISE_REPOSITORY, useClass: PostgresExerciseRepository },
  ],
  exports: [ListExercisesUseCase, GetExerciseUseCase],
})
export class ExercisesModule implements OnApplicationBootstrap {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
    private readonly config: ConfigService<Environment, true>,
    @InjectPinoLogger(ExercisesModule.name) private readonly logger: PinoLogger,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.config.get("DATABASE_AUTO_MIGRATE", { infer: true })) {
      return;
    }
    try {
      const inserted = await seedExercises(this.db);
      if (inserted > 0) {
        this.logger.info({ inserted }, "exercise catalogue seeded");
      }
    } catch (error) {
      // A failed seed must not crash the app; the catalogue endpoints simply
      // return what is present. Log for visibility (blueprint/21).
      this.logger.warn({ err: error }, "exercise catalogue seed failed");
    }
  }
}
