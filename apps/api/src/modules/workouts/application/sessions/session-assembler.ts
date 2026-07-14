import { type PerformedSetInput, type SessionExerciseInput } from "@atlas/contracts";
import { SessionExercise } from "../../domain/sessions/session-exercise.js";
import { PerformedSet } from "../../domain/sessions/performed-set.js";
import { Rpe } from "../../domain/sessions/value-objects/rpe.js";
import { Load } from "../../domain/value-objects/load.js";

/**
 * Builds domain session exercises/sets from contract input. Lives in the
 * Application layer because it bridges the wire shape and the aggregate; the
 * resulting objects are fully validated domain entities (validation in their
 * factories). Order is assigned by array position and re-normalized by the root.
 */
function toSet(input: PerformedSetInput): PerformedSet {
  const load =
    input.load === undefined || input.load === null
      ? null
      : Load.create(input.load.weight, input.load.unit);
  const rpe = input.rpe === undefined || input.rpe === null ? null : Rpe.create(input.rpe);
  return PerformedSet.create({
    reps: input.reps,
    load,
    completed: input.completed,
    rpe,
    notes: input.notes ?? null,
  });
}

export function assembleSessionExercises(
  inputs: readonly SessionExerciseInput[],
): SessionExercise[] {
  return inputs.map((input, index) =>
    SessionExercise.create({
      exerciseName: input.exerciseName,
      order: index,
      sets: (input.sets ?? []).map(toSet),
    }),
  );
}
