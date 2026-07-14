import { type WorkoutSession } from "./workout-session.js";
import { type WorkoutSessionId } from "./session-id.js";

/**
 * WorkoutSession repository port (blueprint/12 Dependency Rule, 13 Domain
 * Ownership). The Application layer depends on this; Drizzle/Postgres is
 * invisible here. The aggregate is always loaded and saved whole (doc 13
 * Aggregate Consistency).
 */
export const WORKOUT_SESSION_REPOSITORY = Symbol("WORKOUT_SESSION_REPOSITORY");

/** A page of sessions ordered by (performedOn desc, id desc) — a stable total order. */
export interface WorkoutSessionPage {
  readonly items: readonly WorkoutSession[];
  /** Opaque cursor for the next page, or null when there are no more. */
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

export interface ListSessionsParams {
  readonly userId: string;
  /** Opaque cursor from a previous page (absent for the first page). */
  readonly cursor?: string;
  /** Page size after the repository clamps it to a safe maximum. */
  readonly limit: number;
}

export interface WorkoutSessionRepository {
  /** Persist the whole aggregate (insert or full replace of its exercises/sets). */
  save(session: WorkoutSession): Promise<void>;
  /** Load a session by id, or null if it does not exist. */
  findById(id: WorkoutSessionId): Promise<WorkoutSession | null>;
  /** A cursor page of the user's session history (most recently performed first). */
  list(params: ListSessionsParams): Promise<WorkoutSessionPage>;
  /** Physically delete a session (children cascade). */
  delete(id: WorkoutSessionId): Promise<void>;
}
