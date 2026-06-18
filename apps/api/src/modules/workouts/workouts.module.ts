import { Module } from "@nestjs/common";
import { WORKOUT_REPOSITORY } from "./domain/workout.repository.js";
import { PostgresWorkoutRepository } from "./infrastructure/postgres-workout.repository.js";
import { CreateWorkoutUseCase } from "./application/create-workout.use-case.js";
import { GetWorkoutUseCase } from "./application/get-workout.use-case.js";
import { ListWorkoutsUseCase } from "./application/list-workouts.use-case.js";
import { UpdateWorkoutUseCase } from "./application/update-workout.use-case.js";
import { DeleteWorkoutUseCase } from "./application/delete-workout.use-case.js";
import { CompleteWorkoutUseCase } from "./application/complete-workout.use-case.js";
import { DuplicateWorkoutUseCase } from "./application/duplicate-workout.use-case.js";
import { WorkoutsController } from "./presentation/workouts.controller.js";

/**
 * Workouts module composition (blueprint/12). Binds the domain port to its
 * Postgres adapter and registers the use cases. The Drizzle handle
 * (`DRIZZLE`), the domain-event publisher, and the global auth guard come from
 * global modules (DatabaseModule, SharedKernelModule, AuthModule).
 */
@Module({
  controllers: [WorkoutsController],
  providers: [
    CreateWorkoutUseCase,
    GetWorkoutUseCase,
    ListWorkoutsUseCase,
    UpdateWorkoutUseCase,
    DeleteWorkoutUseCase,
    CompleteWorkoutUseCase,
    DuplicateWorkoutUseCase,
    { provide: WORKOUT_REPOSITORY, useClass: PostgresWorkoutRepository },
  ],
})
export class WorkoutsModule {}
