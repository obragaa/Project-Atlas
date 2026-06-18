import { type Equipment, type MuscleGroup } from "@atlas/contracts";
import { type ExerciseRow } from "../../../../shared/database/schema/index.js";
import { Exercise } from "../../domain/exercise.js";
import { ExerciseId } from "../../domain/exercise-id.js";

/**
 * Translates an `exercises` row into the `Exercise` entity. The only place that
 * knows column names; row types never escape Infrastructure (blueprint/12).
 * `restore` trusts the DB — its CHECK constraints already enforce the closed
 * sets — so muscle/equipment values are cast, not re-validated.
 */
export function exerciseFromRow(row: ExerciseRow): Exercise {
  return Exercise.restore(ExerciseId.create(row.id), {
    slug: row.slug,
    name: row.name,
    primaryMuscle: row.primaryMuscle as MuscleGroup,
    muscles: row.muscles as MuscleGroup[],
    equipment: row.equipment as Equipment,
    instructions: row.instructions,
    tips: row.tips,
    variations: row.variations,
  });
}
