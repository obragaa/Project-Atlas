import { Inject, Injectable } from "@nestjs/common";
import { type UpdateWorkoutRequest, type WorkoutView } from "@atlas/contracts";
import { WORKOUT_REPOSITORY, type WorkoutRepository } from "../domain/workout.repository.js";
import { WorkoutName } from "../domain/value-objects/workout-name.js";
import { assembleItems } from "./workout-assembler.js";
import { loadOwnedWorkout } from "./load-owned-workout.js";
import { toWorkoutView } from "./workout.mapper.js";

export interface UpdateWorkoutCommand {
  readonly userId: string;
  readonly workoutId: string;
  readonly request: UpdateWorkoutRequest;
}

/**
 * Replaces a workout's editable content (blueprint/07 "Editar treino", doc 14
 * PUT = full replacement). A completed workout is immutable (the aggregate
 * enforces this).
 */
@Injectable()
export class UpdateWorkoutUseCase {
  constructor(@Inject(WORKOUT_REPOSITORY) private readonly workouts: WorkoutRepository) {}

  async execute(command: UpdateWorkoutCommand): Promise<WorkoutView> {
    const workout = await loadOwnedWorkout(this.workouts, command.workoutId, command.userId);
    const name = WorkoutName.create(command.request.name);
    const items = assembleItems(command.request.items);

    workout.replaceContent(name, items);
    await this.workouts.save(workout);

    return toWorkoutView(workout);
  }
}
