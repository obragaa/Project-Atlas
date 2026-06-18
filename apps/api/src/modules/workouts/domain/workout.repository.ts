import { type Workout } from "./workout.js";
import { type WorkoutId } from "./workout-id.js";

/**
 * Workout repository port (blueprint/12 Dependency Rule, 13 Domain Ownership).
 * The Application layer depends on this; Drizzle/Postgres is invisible here. The
 * aggregate is always loaded and saved whole (doc 13 Aggregate Consistency).
 */
export const WORKOUT_REPOSITORY = Symbol("WORKOUT_REPOSITORY");

/** A page of workouts ordered by (createdAt desc, id desc) — a stable total order. */
export interface WorkoutPage {
  readonly items: readonly Workout[];
  /** Opaque cursor for the next page, or null when there are no more. */
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

export interface ListWorkoutsParams {
  readonly userId: string;
  /** Opaque cursor from a previous page (absent for the first page). */
  readonly cursor?: string;
  /** Page size after the repository clamps it to a safe maximum. */
  readonly limit: number;
}

export interface WorkoutRepository {
  /** Persist the whole aggregate (insert or full replace of its items/sets). */
  save(workout: Workout): Promise<void>;
  /** Load a workout by id, or null if it does not exist. */
  findById(id: WorkoutId): Promise<Workout | null>;
  /** A cursor page of the user's workouts (newest first). */
  list(params: ListWorkoutsParams): Promise<WorkoutPage>;
  /** Physically delete a workout (no soft delete in this slice, ADR-0003). */
  delete(id: WorkoutId): Promise<void>;
}
