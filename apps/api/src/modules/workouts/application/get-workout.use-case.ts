import { Inject, Injectable } from "@nestjs/common";
import { type WorkoutView } from "@atlas/contracts";
import { WORKOUT_REPOSITORY, type WorkoutRepository } from "../domain/workout.repository.js";
import { loadOwnedWorkout } from "./load-owned-workout.js";
import { toWorkoutView } from "./workout.mapper.js";

export interface GetWorkoutQuery {
  readonly userId: string;
  readonly workoutId: string;
}

/** Returns one workout the caller owns (blueprint/07, 13 Ownership). */
@Injectable()
export class GetWorkoutUseCase {
  constructor(@Inject(WORKOUT_REPOSITORY) private readonly workouts: WorkoutRepository) {}

  async execute(query: GetWorkoutQuery): Promise<WorkoutView> {
    const workout = await loadOwnedWorkout(this.workouts, query.workoutId, query.userId);
    return toWorkoutView(workout);
  }
}
