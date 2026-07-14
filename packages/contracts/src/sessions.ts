/**
 * Workout Sessions transport contract (blueprint/07 - Features.md "Registrar
 * séries/repetições/carga/observações" + "Histórico de treinos", 02 - Product
 * Rules.md "Menos cliques", 13 - Database.md, 14 - API.md).
 *
 * A WorkoutSession is the record of a workout the user *actually performed* — as
 * opposed to a Workout, which is the reusable *template/plan* (see `workouts.ts`).
 * A session is created from a template with one tap ("Treinar agora"), pre-filled
 * with the planned exercises/sets; the user then edits the real values (reps,
 * load, whether each set was completed, effort/RPE, notes) and finalizes it. Each
 * finished session lands in the history and feeds progress + gamification.
 *
 * Identity is opaque; collections are cursor-paginated; payloads are minimal.
 * Load/LoadUnit are reused from the workouts contract (single source of truth).
 */

import { type Load } from "./workouts";

/** Lifecycle of a session: being recorded, or finalized. */
export const SESSION_STATUSES = ["in_progress", "completed"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

/** Rating of Perceived Exertion — how hard a set felt, 1 (trivial) to 10 (maximal). */
export const RPE_MIN = 1;
export const RPE_MAX = 10;

// ── Read models (responses) ──────────────────────────────────────────────────

/** One set the user actually performed within a session exercise. */
export interface PerformedSetView {
  readonly id: string;
  readonly reps: number;
  /** Null for bodyweight sets. */
  readonly load: Load | null;
  /** Whether the set was actually completed (vs. planned-but-skipped). */
  readonly completed: boolean;
  /** Perceived effort 1..10, or null if not rated. */
  readonly rpe: number | null;
  readonly notes: string | null;
}

/** One exercise performed within a session, with its ordered sets. */
export interface SessionExerciseView {
  readonly id: string;
  readonly exerciseName: string;
  readonly order: number;
  readonly sets: readonly PerformedSetView[];
}

/** Full view of a workout-session aggregate. */
export interface WorkoutSessionView {
  readonly id: string;
  /** Template this session was started from; null for an ad-hoc session. */
  readonly sourceWorkoutId: string | null;
  readonly title: string;
  readonly status: SessionStatus;
  /** Calendar day the workout was performed (AAAA-MM-DD, user's local day). */
  readonly performedOn: string;
  readonly exercises: readonly SessionExerciseView[];
  readonly notes: string | null;
  readonly createdAt: string;
  /** ISO timestamp when finalized; null while in progress. */
  readonly completedAt: string | null;
}

/** Compact view for history listings (no nested exercises — keep payload small). */
export interface WorkoutSessionSummaryView {
  readonly id: string;
  readonly title: string;
  readonly status: SessionStatus;
  readonly performedOn: string;
  readonly exerciseCount: number;
  /** Total sets marked completed — a quick "how much did I do" signal. */
  readonly completedSetCount: number;
  readonly completedAt: string | null;
}

// ── Write models (requests) ──────────────────────────────────────────────────

/** A performed set to record. Load absent/null means bodyweight. */
export interface PerformedSetInput {
  readonly reps: number;
  readonly load?: Load | null;
  /** Defaults to true (the user did the set) when omitted. */
  readonly completed?: boolean;
  readonly rpe?: number | null;
  readonly notes?: string | null;
}

/** A performed exercise to record. Order follows array position. */
export interface SessionExerciseInput {
  readonly exerciseName: string;
  readonly sets?: readonly PerformedSetInput[];
}

/**
 * Start a session from a template ("Treinar agora"). The exercises/sets are
 * derived server-side from the source workout; the client only optionally picks
 * the day. `performedOn` defaults to *today* when omitted (blueprint/02: never
 * force the user to type the date for a workout done today).
 */
export interface StartSessionRequest {
  /** Calendar day (AAAA-MM-DD). Defaults to today when omitted. Never in the future. */
  readonly performedOn?: string;
}

/**
 * Full replacement of a session's recorded content (PUT semantics, doc 14):
 * the real exercises/sets performed, plus an optional overall note and day.
 */
export interface UpdateSessionRequest {
  readonly title: string;
  readonly performedOn: string;
  readonly exercises: readonly SessionExerciseInput[];
  readonly notes?: string | null;
}
