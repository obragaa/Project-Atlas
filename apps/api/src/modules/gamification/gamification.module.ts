import { Module, type OnApplicationBootstrap } from "@nestjs/common";
import { InProcessEventDispatcher } from "../../shared/events/in-process-event-dispatcher.js";
import {
  ACHIEVEMENT_UNLOCK_REPOSITORY,
  ACTIVITY_REPOSITORY,
} from "./domain/gamification.repository.js";
import { PostgresActivityRepository } from "./infrastructure/postgres-activity.repository.js";
import { PostgresAchievementUnlockRepository } from "./infrastructure/postgres-achievement-unlock.repository.js";
import { RecordActivityUseCase } from "./application/record-activity.use-case.js";
import { GetOverviewUseCase } from "./application/get-overview.use-case.js";
import { GamificationController } from "./presentation/gamification.controller.js";
import { WorkoutCompleted } from "../workouts/domain/events.js";
import { MeasurementRecorded } from "../progress/domain/events.js";

/**
 * Gamification module composition (blueprint/12, ADR-0006). Owns its activity
 * log + achievement unlocks and reacts to other domains' events: on bootstrap it
 * registers handlers that append activity and unlock milestones when a workout
 * is completed or a measurement is recorded. The handlers are isolated by the
 * dispatcher, so a gamification failure never breaks the originating flow.
 */
@Module({
  controllers: [GamificationController],
  providers: [
    RecordActivityUseCase,
    GetOverviewUseCase,
    { provide: ACTIVITY_REPOSITORY, useClass: PostgresActivityRepository },
    { provide: ACHIEVEMENT_UNLOCK_REPOSITORY, useClass: PostgresAchievementUnlockRepository },
  ],
})
export class GamificationModule implements OnApplicationBootstrap {
  constructor(
    private readonly dispatcher: InProcessEventDispatcher,
    private readonly recordActivity: RecordActivityUseCase,
  ) {}

  onApplicationBootstrap(): void {
    this.dispatcher.on<WorkoutCompleted>(WorkoutCompleted.name, (event) =>
      this.recordActivity.execute({
        userId: event.userId,
        kind: "workout_completed",
        occurredAt: event.occurredAt,
      }),
    );

    this.dispatcher.on<MeasurementRecorded>(MeasurementRecorded.name, (event) =>
      this.recordActivity.execute({
        userId: event.userId,
        kind: "measurement_recorded",
        occurredAt: event.occurredAt,
      }),
    );
  }
}
