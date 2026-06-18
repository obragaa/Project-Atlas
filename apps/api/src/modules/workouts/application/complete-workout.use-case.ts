import { Inject, Injectable } from "@nestjs/common";
import { type WorkoutView } from "@atlas/contracts";
import {
  DOMAIN_EVENT_PUBLISHER,
  type DomainEventPublisher,
} from "../../../shared/domain/domain-event-publisher.js";
import { WORKOUT_REPOSITORY, type WorkoutRepository } from "../domain/workout.repository.js";
import { loadOwnedWorkout } from "./load-owned-workout.js";
import { toWorkoutView } from "./workout.mapper.js";

export interface CompleteWorkoutCommand {
  readonly userId: string;
  readonly workoutId: string;
}

/**
 * Marks a workout completed (blueprint/07, 13 "WorkoutCompleted"). The aggregate
 * records the WorkoutCompleted fact; the dispatcher fans it out (today: the
 * audit channel via the registered handler). Re-completing is a conflict.
 */
@Injectable()
export class CompleteWorkoutUseCase {
  constructor(
    @Inject(WORKOUT_REPOSITORY) private readonly workouts: WorkoutRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: CompleteWorkoutCommand): Promise<WorkoutView> {
    const workout = await loadOwnedWorkout(this.workouts, command.workoutId, command.userId);

    workout.complete();
    await this.workouts.save(workout);
    await this.events.publishFor(workout);

    return toWorkoutView(workout);
  }
}
