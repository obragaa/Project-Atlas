import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../shared/database/database-connection.js";
import { DRIZZLE } from "../../../shared/database/database.tokens.js";
import { exerciseSets, workoutItems, workouts } from "../../../shared/database/schema/index.js";
import {
  type ListWorkoutsParams,
  type WorkoutPage,
  type WorkoutRepository,
} from "../domain/workout.repository.js";
import { type Workout } from "../domain/workout.js";
import { type WorkoutId } from "../domain/workout-id.js";
import { toDomain, toPersistence } from "./persistence/workout.mapper.js";
import { decodeCursor, encodeCursor } from "./workout-cursor.js";

/**
 * PostgreSQL `WorkoutRepository` (blueprint/12, 13). Drizzle is confined here.
 * The aggregate is saved/loaded whole; `save` runs in a transaction limited to
 * the aggregate (doc 13 ADR-002), replacing children so it is idempotent.
 * Listing uses keyset (cursor) pagination on (created_at desc, id desc).
 */
@Injectable()
export class PostgresWorkoutRepository implements WorkoutRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async save(workout: Workout): Promise<void> {
    const { workout: workoutRow, items, sets } = toPersistence(workout);

    await this.db.transaction(async (tx) => {
      await tx
        .insert(workouts)
        .values(workoutRow)
        .onConflictDoUpdate({
          target: workouts.id,
          set: {
            name: workoutRow.name,
            status: workoutRow.status,
            updatedAt: workoutRow.updatedAt,
            completedAt: workoutRow.completedAt,
          },
        });

      // Replace children wholesale (the aggregate is the consistency boundary).
      // Deleting items cascades to their sets; then re-insert the current state.
      await tx.delete(workoutItems).where(eq(workoutItems.workoutId, workoutRow.id));

      if (items.length > 0) {
        await tx.insert(workoutItems).values(items);
      }
      if (sets.length > 0) {
        await tx.insert(exerciseSets).values(sets);
      }
    });
  }

  async findById(id: WorkoutId): Promise<Workout | null> {
    const workoutRows = await this.db
      .select()
      .from(workouts)
      .where(eq(workouts.id, id.toString()))
      .limit(1);
    const workoutRow = workoutRows.at(0);
    if (!workoutRow) {
      return null;
    }

    const itemRows = await this.db
      .select()
      .from(workoutItems)
      .where(eq(workoutItems.workoutId, workoutRow.id));

    const itemIds = itemRows.map((row) => row.id);
    const setRows =
      itemIds.length > 0
        ? await this.db.select().from(exerciseSets).where(inArray(exerciseSets.itemId, itemIds))
        : [];

    return toDomain({ workout: workoutRow, items: itemRows, sets: setRows });
  }

  async list(params: ListWorkoutsParams): Promise<WorkoutPage> {
    const cursor = params.cursor ? decodeCursor(params.cursor) : null;

    // Keyset predicate: rows strictly "after" the cursor in (createdAt desc, id desc).
    const keyset = cursor
      ? or(
          lt(workouts.createdAt, cursor.createdAt),
          and(eq(workouts.createdAt, cursor.createdAt), lt(workouts.id, cursor.id)),
        )
      : undefined;

    // Fetch one extra to know whether another page exists.
    const rows = await this.db
      .select()
      .from(workouts)
      .where(and(eq(workouts.userId, params.userId), keyset))
      .orderBy(desc(workouts.createdAt), desc(workouts.id))
      .limit(params.limit + 1);

    const hasNext = rows.length > params.limit;
    const pageRows = hasNext ? rows.slice(0, params.limit) : rows;

    // Hydrate each summary's item counts cheaply (no nested items in listings):
    // listing maps to WorkoutSummaryView via the aggregate, so we still build the
    // aggregate but with its items, keeping a single code path. Item rows are
    // loaded in one batched query to avoid N+1 (doc 13).
    const pageIds = pageRows.map((row) => row.id);
    const itemRows =
      pageIds.length > 0
        ? await this.db.select().from(workoutItems).where(inArray(workoutItems.workoutId, pageIds))
        : [];

    const itemsByWorkout = new Map<string, typeof itemRows>();
    for (const item of itemRows) {
      const list = itemsByWorkout.get(item.workoutId) ?? [];
      list.push(item);
      itemsByWorkout.set(item.workoutId, list);
    }

    const items = pageRows.map((row) =>
      // Sets are not needed for the summary; pass an empty set list.
      toDomain({ workout: row, items: itemsByWorkout.get(row.id) ?? [], sets: [] }),
    );

    const last = pageRows.at(-1);
    const nextCursor =
      hasNext && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null;

    return { items, nextCursor, hasNext };
  }

  async delete(id: WorkoutId): Promise<void> {
    // Children cascade via FK ON DELETE CASCADE (see migration).
    await this.db.delete(workouts).where(eq(workouts.id, id.toString()));
  }
}
