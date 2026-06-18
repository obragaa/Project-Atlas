/**
 * Workouts transport contract (blueprint/07 - Features.md "Treinos", 13 -
 * Database.md "Aggregate Roots", 14 - API.md). A Workout is a self-contained
 * aggregate: it owns its items, and each item owns its sets (ADR-0003). Identity
 * is opaque; collections are cursor-paginated; payloads are minimal.
 */

/** Lifecycle of a workout (blueprint/13 "Entidades", ADR-0003). */
export const WORKOUT_STATUSES = ["draft", "active", "completed"] as const;
export type WorkoutStatus = (typeof WORKOUT_STATUSES)[number];

/** Unit a load is expressed in. */
export const LOAD_UNITS = ["kg", "lb"] as const;
export type LoadUnit = (typeof LOAD_UNITS)[number];

/** A resistance load: a weight plus its unit. Absent load means bodyweight. */
export interface Load {
  readonly weight: number;
  readonly unit: LoadUnit;
}

// ── Read models (responses) ──────────────────────────────────────────────────

/** One recorded set within an exercise item. */
export interface SetView {
  readonly id: string;
  readonly reps: number;
  /** Null for bodyweight sets. */
  readonly load: Load | null;
  readonly notes: string | null;
}

/** One exercise within a workout, with its ordered sets. */
export interface WorkoutItemView {
  readonly id: string;
  readonly exerciseName: string;
  readonly order: number;
  readonly sets: readonly SetView[];
}

/** Full view of a workout aggregate. */
export interface WorkoutView {
  readonly id: string;
  readonly name: string;
  readonly status: WorkoutStatus;
  readonly items: readonly WorkoutItemView[];
  readonly createdAt: string;
  readonly updatedAt: string;
  /** ISO timestamp when completed; null otherwise. */
  readonly completedAt: string | null;
}

/** Compact view for collection listings (no nested items — keep payload small). */
export interface WorkoutSummaryView {
  readonly id: string;
  readonly name: string;
  readonly status: WorkoutStatus;
  readonly itemCount: number;
  readonly createdAt: string;
  readonly completedAt: string | null;
}

// ── Write models (requests) ──────────────────────────────────────────────────

/** A set to create within an item. */
export interface SetInput {
  readonly reps: number;
  readonly load?: Load | null;
  readonly notes?: string | null;
}

/** An exercise item to create within a workout. Order follows array position. */
export interface WorkoutItemInput {
  readonly exerciseName: string;
  readonly sets?: readonly SetInput[];
}

/** Create a new workout (starts as `draft`). */
export interface CreateWorkoutRequest {
  readonly name: string;
  readonly items?: readonly WorkoutItemInput[];
}

/** Full replacement of a workout's editable content (PUT semantics, doc 14). */
export interface UpdateWorkoutRequest {
  readonly name: string;
  readonly items: readonly WorkoutItemInput[];
}
