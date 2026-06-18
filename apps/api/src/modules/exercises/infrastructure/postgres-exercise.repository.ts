import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, gt, or, sql, type SQL } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../shared/database/database-connection.js";
import { DRIZZLE } from "../../../shared/database/database.tokens.js";
import { exercises } from "../../../shared/database/schema/index.js";
import {
  type ExercisePage,
  type ExerciseQuery,
  type ExerciseRepository,
} from "../domain/exercise.repository.js";
import { type Exercise } from "../domain/exercise.js";
import { exerciseFromRow } from "./persistence/exercise.mapper.js";
import { decodeCursor, encodeCursor } from "./exercise-cursor.js";

/**
 * PostgreSQL `ExerciseRepository` (blueprint/12, 13). Drizzle is confined here.
 * Read-only over the catalogue (seeded). Search filters are combinable; results
 * use keyset (cursor) pagination on (lower(name) asc, id asc) — a stable total
 * order for an alphabetical library.
 */
@Injectable()
export class PostgresExerciseRepository implements ExerciseRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async search(query: ExerciseQuery): Promise<ExercisePage> {
    const filters: SQL[] = [];

    if (query.search) {
      filters.push(sql`lower(${exercises.name}) like ${"%" + query.search.toLowerCase() + "%"}`);
    }
    if (query.muscle) {
      // Match the primary muscle or membership in the worked-muscle array.
      filters.push(
        or(
          eq(exercises.primaryMuscle, query.muscle),
          sql`${query.muscle} = any(${exercises.muscles})`,
        )!,
      );
    }
    if (query.equipment) {
      filters.push(eq(exercises.equipment, query.equipment));
    }

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;
    if (cursor) {
      // Keyset: rows strictly after the cursor in (lower(name) asc, id asc).
      filters.push(
        or(
          sql`lower(${exercises.name}) > ${cursor.name}`,
          and(sql`lower(${exercises.name}) = ${cursor.name}`, gt(exercises.id, cursor.id)),
        )!,
      );
    }

    const rows = await this.db
      .select()
      .from(exercises)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(sql`lower(${exercises.name})`, asc(exercises.id))
      .limit(query.limit + 1);

    const hasNext = rows.length > query.limit;
    const pageRows = hasNext ? rows.slice(0, query.limit) : rows;
    const items = pageRows.map(exerciseFromRow);

    const last = pageRows.at(-1);
    const nextCursor =
      hasNext && last ? encodeCursor({ name: last.name.toLowerCase(), id: last.id }) : null;

    return { items, nextCursor, hasNext };
  }

  async findBySlug(slug: string): Promise<Exercise | null> {
    const rows = await this.db.select().from(exercises).where(eq(exercises.slug, slug)).limit(1);
    const row = rows.at(0);
    return row ? exerciseFromRow(row) : null;
  }

  async count(): Promise<number> {
    const rows = await this.db.select({ value: sql<number>`count(*)::int` }).from(exercises);
    return rows.at(0)?.value ?? 0;
  }
}
