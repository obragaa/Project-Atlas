import { type Equipment, type MuscleGroup } from "@atlas/contracts";
import { type Exercise } from "./exercise.js";

/**
 * Exercise catalogue repository port (blueprint/12 Dependency Rule, 13 Domain
 * Ownership). Read-only: the catalogue is seeded, not written through the app
 * (ADR-0004). Drizzle/Postgres is invisible here.
 */
export const EXERCISE_REPOSITORY = Symbol("EXERCISE_REPOSITORY");

/** Declarative, combinable catalogue filters (blueprint/14 Filtering). */
export interface ExerciseQuery {
  readonly search?: string;
  readonly muscle?: MuscleGroup;
  readonly equipment?: Equipment;
  /** Opaque cursor from a previous page. */
  readonly cursor?: string;
  /** Page size after the repository clamps it to a safe maximum. */
  readonly limit: number;
}

/** A page of exercises ordered by (name asc, id asc) — a stable total order. */
export interface ExercisePage {
  readonly items: readonly Exercise[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

export interface ExerciseRepository {
  /** A cursor page of the catalogue, filtered and ordered alphabetically. */
  search(query: ExerciseQuery): Promise<ExercisePage>;
  /** Look up one exercise by its stable slug, or null if unknown. */
  findBySlug(slug: string): Promise<Exercise | null>;
  /** Count catalogue entries (used by the seed to stay idempotent). */
  count(): Promise<number>;
}
