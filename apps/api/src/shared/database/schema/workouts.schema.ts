import { sql } from "drizzle-orm";
import {
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Workouts persistence (blueprint/13, ADR-0003). Infrastructure-only; the Domain
 * never imports this. The aggregate is `workouts` → `workout_items` →
 * `exercise_sets`; children cascade-delete with the root (doc 13: explicit
 * delete behavior, the whole aggregate is one consistency boundary).
 *
 * - opaque UUID PKs, app-generated (doc 13: never natural keys).
 * - `user_id` is a reference to the owning user; cross-aggregate consistency is
 *   eventual, so there is no FK to `users` (modules own their data — doc 13).
 * - `status` is text + CHECK (mirrors @atlas/contracts WORKOUT_STATUSES), no enum
 *   migration churn.
 * - list index on (user_id, created_at desc, id desc) serves the cursor page.
 */
export const workouts = pgTable(
  "workouts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    statusValid: check(
      "workouts_status_valid",
      sql`${table.status} in ('draft', 'active', 'completed')`,
    ),
    userListIdx: index("workouts_user_created_idx").on(
      table.userId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
  }),
);

export const workoutItems = pgTable(
  "workout_items",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseName: text("exercise_name").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    byWorkoutIdx: index("workout_items_workout_idx").on(table.workoutId, table.position),
  }),
);

export const exerciseSets = pgTable(
  "exercise_sets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    itemId: uuid("item_id")
      .notNull()
      .references(() => workoutItems.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    reps: integer("reps").notNull(),
    /** Null for bodyweight sets. */
    loadWeight: doublePrecision("load_weight"),
    loadUnit: text("load_unit"),
    notes: text("notes"),
  },
  (table) => ({
    byItemIdx: index("exercise_sets_item_idx").on(table.itemId, table.position),
    repsPositive: check("exercise_sets_reps_positive", sql`${table.reps} >= 1`),
    loadUnitValid: check(
      "exercise_sets_load_unit_valid",
      sql`${table.loadUnit} is null or ${table.loadUnit} in ('kg', 'lb')`,
    ),
  }),
);

export type WorkoutRow = typeof workouts.$inferSelect;
export type WorkoutInsert = typeof workouts.$inferInsert;
export type WorkoutItemRow = typeof workoutItems.$inferSelect;
export type WorkoutItemInsert = typeof workoutItems.$inferInsert;
export type ExerciseSetRow = typeof exerciseSets.$inferSelect;
export type ExerciseSetInsert = typeof exerciseSets.$inferInsert;
