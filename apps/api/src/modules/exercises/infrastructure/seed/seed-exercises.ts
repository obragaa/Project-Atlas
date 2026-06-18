import { type DrizzleDatabase } from "../../../../shared/database/database-connection.js";
import { exercises } from "../../../../shared/database/schema/index.js";
import { Exercise } from "../../domain/exercise.js";
import { EXERCISE_CATALOGUE } from "./exercise-catalogue.js";

/**
 * Seeds the exercise catalogue idempotently (blueprint/13 Versionamento: seeds
 * are forward-only and safe to re-run). Each entry is validated through the
 * domain factory before insert (the seed can never introduce malformed data),
 * then upserted by its stable slug with `onConflictDoNothing` so existing rows
 * are left untouched. Returns how many new rows were inserted.
 */
export async function seedExercises(db: DrizzleDatabase): Promise<number> {
  const rows = EXERCISE_CATALOGUE.map((entry) => {
    // Validate + normalize via the aggregate factory (e.g. primary muscle is
    // folded into the worked-muscle set).
    const exercise = Exercise.create({
      slug: entry.slug,
      name: entry.name,
      primaryMuscle: entry.primaryMuscle,
      muscles: entry.muscles,
      equipment: entry.equipment,
      instructions: entry.instructions,
      tips: entry.tips,
      variations: entry.variations,
    });
    return {
      id: exercise.id.toString(),
      slug: exercise.slug,
      name: exercise.name,
      primaryMuscle: exercise.primaryMuscle,
      muscles: [...exercise.muscles],
      equipment: exercise.equipment,
      instructions: exercise.instructions,
      tips: [...exercise.tips],
      variations: [...exercise.variations],
    };
  });

  const inserted = await db
    .insert(exercises)
    .values(rows)
    .onConflictDoNothing({ target: exercises.slug })
    .returning({ slug: exercises.slug });

  return inserted.length;
}
