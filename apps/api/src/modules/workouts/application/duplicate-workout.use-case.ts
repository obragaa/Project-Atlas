import { Inject, Injectable } from "@nestjs/common";
import { type WorkoutView } from "@atlas/contracts";
import {
  DOMAIN_EVENT_PUBLISHER,
  type DomainEventPublisher,
} from "../../../shared/domain/domain-event-publisher.js";
import { WORKOUT_REPOSITORY, type WorkoutRepository } from "../domain/workout.repository.js";
import { WorkoutItem } from "../domain/workout-item.js";
import { ExerciseSet } from "../domain/exercise-set.js";
import { loadOwnedWorkout } from "./load-owned-workout.js";
import { toWorkoutView } from "./workout.mapper.js";

export interface DuplicateWorkoutCommand {
  readonly userId: string;
  readonly workoutId: string;
}

/**
 * Duplicates a workout into a fresh draft (blueprint/07 "Duplicar treino"). New
 * ids throughout; no completion carried over — the copy starts clean so the user
 * iterates without touching history (ADR-0003).
 */
@Injectable()
export class DuplicateWorkoutUseCase {
  constructor(
    @Inject(WORKOUT_REPOSITORY) private readonly workouts: WorkoutRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: DuplicateWorkoutCommand): Promise<WorkoutView> {
    const source = await loadOwnedWorkout(this.workouts, command.workoutId, command.userId);

    const copy = source.duplicate((item) =>
      WorkoutItem.create({
        exerciseName: item.exerciseName,
        order: item.order,
        sets: item.sets.map((set) =>
          ExerciseSet.create({ reps: set.reps, load: set.load, notes: set.notes }),
        ),
      }),
    );

    await this.workouts.save(copy);
    await this.events.publishFor(copy);

    return toWorkoutView(copy);
  }
}
