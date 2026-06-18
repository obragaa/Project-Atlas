import { type SetInput, type WorkoutItemInput } from "@atlas/contracts";
import { WorkoutItem } from "../domain/workout-item.js";
import { ExerciseSet } from "../domain/exercise-set.js";
import { Load } from "../domain/value-objects/load.js";

/**
 * Builds domain items/sets from contract input. Lives in the Application layer
 * because it bridges the wire shape and the aggregate; the resulting objects are
 * fully validated domain entities (validation happens in their factories). Order
 * is assigned by array position and re-normalized by the aggregate root.
 */
function toSet(input: SetInput): ExerciseSet {
  const load =
    input.load === undefined || input.load === null
      ? null
      : Load.create(input.load.weight, input.load.unit);
  return ExerciseSet.create({ reps: input.reps, load, notes: input.notes ?? null });
}

export function assembleItems(inputs: readonly WorkoutItemInput[]): WorkoutItem[] {
  return inputs.map((input, index) =>
    WorkoutItem.create({
      exerciseName: input.exerciseName,
      order: index,
      sets: (input.sets ?? []).map(toSet),
    }),
  );
}
