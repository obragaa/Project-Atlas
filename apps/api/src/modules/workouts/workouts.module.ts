import { Module } from "@nestjs/common";
import { WORKOUT_REPOSITORY } from "./domain/workout.repository.js";
import { WORKOUT_SESSION_REPOSITORY } from "./domain/sessions/workout-session.repository.js";
import { PostgresWorkoutRepository } from "./infrastructure/postgres-workout.repository.js";
import { PostgresWorkoutSessionRepository } from "./infrastructure/sessions/postgres-workout-session.repository.js";
import { CreateWorkoutUseCase } from "./application/create-workout.use-case.js";
import { GetWorkoutUseCase } from "./application/get-workout.use-case.js";
import { ListWorkoutsUseCase } from "./application/list-workouts.use-case.js";
import { UpdateWorkoutUseCase } from "./application/update-workout.use-case.js";
import { DeleteWorkoutUseCase } from "./application/delete-workout.use-case.js";
import { DuplicateWorkoutUseCase } from "./application/duplicate-workout.use-case.js";
import { StartSessionUseCase } from "./application/sessions/start-session.use-case.js";
import { GetSessionUseCase } from "./application/sessions/get-session.use-case.js";
import { ListSessionsUseCase } from "./application/sessions/list-sessions.use-case.js";
import { UpdateSessionUseCase } from "./application/sessions/update-session.use-case.js";
import { CompleteSessionUseCase } from "./application/sessions/complete-session.use-case.js";
import { DeleteSessionUseCase } from "./application/sessions/delete-session.use-case.js";
import { WorkoutsController } from "./presentation/workouts.controller.js";
import { SessionsController } from "./presentation/sessions/sessions.controller.js";

/**
 * Workouts module composition (blueprint/12). Binds the domain ports (workout
 * template + performed session) to their Postgres adapters and registers the use
 * cases. The Drizzle handle (`DRIZZLE`), the domain-event publisher, and the
 * global auth guard come from global modules (DatabaseModule, SharedKernelModule,
 * AuthModule).
 */
@Module({
  controllers: [WorkoutsController, SessionsController],
  providers: [
    CreateWorkoutUseCase,
    GetWorkoutUseCase,
    ListWorkoutsUseCase,
    UpdateWorkoutUseCase,
    DeleteWorkoutUseCase,
    DuplicateWorkoutUseCase,
    StartSessionUseCase,
    GetSessionUseCase,
    ListSessionsUseCase,
    UpdateSessionUseCase,
    CompleteSessionUseCase,
    DeleteSessionUseCase,
    { provide: WORKOUT_REPOSITORY, useClass: PostgresWorkoutRepository },
    { provide: WORKOUT_SESSION_REPOSITORY, useClass: PostgresWorkoutSessionRepository },
  ],
  exports: [CreateWorkoutUseCase],
})
export class WorkoutsModule {}
