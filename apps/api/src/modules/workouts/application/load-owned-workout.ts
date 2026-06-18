import { NotFoundError } from "../../../shared/domain/errors.js";
import { type WorkoutRepository } from "../domain/workout.repository.js";
import { type Workout } from "../domain/workout.js";
import { WorkoutId } from "../domain/workout-id.js";

/**
 * Loads a workout and enforces ownership (blueprint/13 Ownership, 15 Least
 * Privilege). A workout that does not exist OR is not owned by the caller yields
 * the SAME not-found error, so the endpoint never reveals other users' ids
 * (no enumeration — doc 16).
 */
export async function loadOwnedWorkout(
  workouts: WorkoutRepository,
  rawId: string,
  userId: string,
): Promise<Workout> {
  const id = parseId(rawId);
  const workout = id ? await workouts.findById(id) : null;
  if (!workout || !workout.isOwnedBy(userId)) {
    throw new NotFoundError("Treino não encontrado.", "workout.not_found");
  }
  return workout;
}

/** A malformed id is treated as "not found", never a 500 (defensive). */
function parseId(rawId: string): WorkoutId | null {
  try {
    return WorkoutId.create(rawId);
  } catch {
    return null;
  }
}
