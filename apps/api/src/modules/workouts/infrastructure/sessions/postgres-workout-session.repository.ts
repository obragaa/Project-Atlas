import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../../shared/database/database-connection.js";
import { DRIZZLE } from "../../../../shared/database/database.tokens.js";
import {
  performedSets,
  sessionExercises,
  workoutSessions,
} from "../../../../shared/database/schema/index.js";
import {
  type ListSessionsParams,
  type WorkoutSessionPage,
  type WorkoutSessionRepository,
} from "../../domain/sessions/workout-session.repository.js";
import { type WorkoutSession } from "../../domain/sessions/workout-session.js";
import { type WorkoutSessionId } from "../../domain/sessions/session-id.js";
import { toDomain, toPersistence } from "./session.mapper.js";
import { decodeCursor, encodeCursor } from "./session-cursor.js";

/**
 * PostgreSQL `WorkoutSessionRepository` (blueprint/12, 13). Drizzle is confined
 * here. The aggregate is saved/loaded whole; `save` runs in a transaction limited
 * to the aggregate (doc 13 ADR-002), replacing children so it is idempotent.
 * History uses keyset (cursor) pagination on (performed_on desc, id desc).
 */
@Injectable()
export class PostgresWorkoutSessionRepository implements WorkoutSessionRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async save(session: WorkoutSession): Promise<void> {
    const { session: sessionRow, exercises, sets } = toPersistence(session);

    await this.db.transaction(async (tx) => {
      await tx
        .insert(workoutSessions)
        .values(sessionRow)
        .onConflictDoUpdate({
          target: workoutSessions.id,
          set: {
            title: sessionRow.title,
            status: sessionRow.status,
            performedOn: sessionRow.performedOn,
            notes: sessionRow.notes,
            completedAt: sessionRow.completedAt,
          },
        });

      // Replace children wholesale (the aggregate is the consistency boundary).
      // Deleting exercises cascades to their sets; then re-insert current state.
      await tx.delete(sessionExercises).where(eq(sessionExercises.sessionId, sessionRow.id));

      if (exercises.length > 0) {
        await tx.insert(sessionExercises).values(exercises);
      }
      if (sets.length > 0) {
        await tx.insert(performedSets).values(sets);
      }
    });
  }

  async findById(id: WorkoutSessionId): Promise<WorkoutSession | null> {
    const sessionRows = await this.db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id.toString()))
      .limit(1);
    const sessionRow = sessionRows.at(0);
    if (!sessionRow) {
      return null;
    }

    const exerciseRows = await this.db
      .select()
      .from(sessionExercises)
      .where(eq(sessionExercises.sessionId, sessionRow.id));

    const exerciseIds = exerciseRows.map((row) => row.id);
    const setRows =
      exerciseIds.length > 0
        ? await this.db
            .select()
            .from(performedSets)
            .where(inArray(performedSets.exerciseId, exerciseIds))
        : [];

    return toDomain({ session: sessionRow, exercises: exerciseRows, sets: setRows });
  }

  async list(params: ListSessionsParams): Promise<WorkoutSessionPage> {
    const cursor = params.cursor ? decodeCursor(params.cursor) : null;

    // Keyset predicate: rows strictly "after" the cursor in (performedOn desc, id desc).
    const keyset = cursor
      ? or(
          lt(workoutSessions.performedOn, cursor.performedOn),
          and(
            eq(workoutSessions.performedOn, cursor.performedOn),
            lt(workoutSessions.id, cursor.id),
          ),
        )
      : undefined;

    // Fetch one extra to know whether another page exists.
    const rows = await this.db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.userId, params.userId), keyset))
      .orderBy(desc(workoutSessions.performedOn), desc(workoutSessions.id))
      .limit(params.limit + 1);

    const hasNext = rows.length > params.limit;
    const pageRows = hasNext ? rows.slice(0, params.limit) : rows;

    // Batch-load exercises + sets for the page (no N+1, doc 13). Summaries need
    // the completed-set count, so the sets are required — one query each.
    const pageIds = pageRows.map((row) => row.id);
    const exerciseRows =
      pageIds.length > 0
        ? await this.db
            .select()
            .from(sessionExercises)
            .where(inArray(sessionExercises.sessionId, pageIds))
        : [];
    const exerciseIds = exerciseRows.map((row) => row.id);
    const setRows =
      exerciseIds.length > 0
        ? await this.db
            .select()
            .from(performedSets)
            .where(inArray(performedSets.exerciseId, exerciseIds))
        : [];

    const exercisesBySession = new Map<string, typeof exerciseRows>();
    for (const exercise of exerciseRows) {
      const list = exercisesBySession.get(exercise.sessionId) ?? [];
      list.push(exercise);
      exercisesBySession.set(exercise.sessionId, list);
    }

    const items = pageRows.map((row) =>
      toDomain({
        session: row,
        exercises: exercisesBySession.get(row.id) ?? [],
        sets: setRows,
      }),
    );

    const last = pageRows.at(-1);
    const nextCursor =
      hasNext && last ? encodeCursor({ performedOn: last.performedOn, id: last.id }) : null;

    return { items, nextCursor, hasNext };
  }

  async delete(id: WorkoutSessionId): Promise<void> {
    // Children cascade via FK ON DELETE CASCADE (see migration 0005).
    await this.db.delete(workoutSessions).where(eq(workoutSessions.id, id.toString()));
  }
}
