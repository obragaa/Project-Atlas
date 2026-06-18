import { Inject, Injectable } from "@nestjs/common";
import { WORKOUT_REPOSITORY, type WorkoutRepository } from "../domain/workout.repository.js";
import { loadOwnedWorkout } from "./load-owned-workout.js";

export interface DeleteWorkoutCommand {
  readonly userId: string;
  readonly workoutId: string;
}

/**
 * Deletes a workout the caller owns (blueprint/07 "Excluir treino"). Physical
 * delete — no soft delete in this slice (ADR-0003). Idempotent from the client's
 * view: a missing/foreign workout returns the same not-found result.
 */
@Injectable()
export class DeleteWorkoutUseCase {
  constructor(@Inject(WORKOUT_REPOSITORY) private readonly workouts: WorkoutRepository) {}

  async execute(command: DeleteWorkoutCommand): Promise<void> {
    const workout = await loadOwnedWorkout(this.workouts, command.workoutId, command.userId);
    await this.workouts.delete(workout.id);
  }
}
