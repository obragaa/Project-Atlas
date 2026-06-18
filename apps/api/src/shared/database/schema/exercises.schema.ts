import { sql } from "drizzle-orm";
import { check, index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * Exercise catalogue (blueprint/13, ADR-0004). Infrastructure-only; the Domain
 * never imports this. System-owned reference data loaded by a seed migration;
 * read-mostly, no per-user owner.
 *
 * - opaque UUID PK, app-generated (doc 13).
 * - `slug` is a stable, unique public handle (doc 14 Naming) — NOT the key.
 * - `primary_muscle` / `equipment` are text + CHECK mirroring the closed sets in
 *   @atlas/contracts (no enum migration churn, consistent with users/workouts).
 * - `muscles` is text[] (worked muscles); the muscle filter tests membership.
 * - index on lower(name) serves case-insensitive search and the alphabetical
 *   (name, id) cursor order (doc 17: index the queries we actually run).
 */
export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    primaryMuscle: text("primary_muscle").notNull(),
    muscles: text("muscles")
      .array()
      .notNull()
      .default(sql`'{}'`),
    equipment: text("equipment").notNull(),
    instructions: text("instructions").notNull().default(""),
    tips: text("tips")
      .array()
      .notNull()
      .default(sql`'{}'`),
    variations: text("variations")
      .array()
      .notNull()
      .default(sql`'{}'`),
  },
  (table) => ({
    slugUnique: uniqueIndex("exercises_slug_key").on(table.slug),
    nameLowerIdx: index("exercises_name_lower_idx").on(sql`lower(${table.name})`),
    primaryMuscleValid: check(
      "exercises_primary_muscle_valid",
      sql`${table.primaryMuscle} in ('chest','back','shoulders','biceps','triceps','legs','glutes','core','fullBody')`,
    ),
    equipmentValid: check(
      "exercises_equipment_valid",
      sql`${table.equipment} in ('barbell','dumbbell','machine','bodyweight','cable','other')`,
    ),
  }),
);

export type ExerciseRow = typeof exercises.$inferSelect;
export type ExerciseInsert = typeof exercises.$inferInsert;
