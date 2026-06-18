/**
 * Exercises transport contract (blueprint/07 - Features.md "Exercícios", 13 -
 * Database.md, 14 - API.md). The catalogue is a curated, system-owned library
 * (ADR-0004): read-only over the wire. Identity is opaque; a stable `slug` is
 * the public handle. Collections are cursor-paginated.
 */

/** Muscle groups (closed set, blueprint/07 "Agrupamento muscular"). */
export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "glutes",
  "core",
  "fullBody",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/** Equipment categories (closed set). */
export const EQUIPMENT = [
  "barbell",
  "dumbbell",
  "machine",
  "bodyweight",
  "cable",
  "other",
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

/** Full view of a catalogue exercise. */
export interface ExerciseView {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly primaryMuscle: MuscleGroup;
  readonly muscles: readonly MuscleGroup[];
  readonly equipment: Equipment;
  readonly instructions: string;
  readonly tips: readonly string[];
  readonly variations: readonly string[];
}

/** Compact view for collection listings (no instructions/tips — small payload). */
export interface ExerciseSummaryView {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly primaryMuscle: MuscleGroup;
  readonly equipment: Equipment;
}

/** Declarative, combinable filters for the catalogue (blueprint/14 Filtering). */
export interface ExerciseFilter {
  /** Case-insensitive name contains. */
  readonly search?: string;
  /** Matches the primary muscle or any worked muscle. */
  readonly muscle?: MuscleGroup;
  readonly equipment?: Equipment;
}
