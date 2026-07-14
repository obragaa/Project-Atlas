import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Workout sessions persistence (blueprint/13, ADR-0008). Infrastructure-only;
 * the Domain never imports this. The aggregate is `workout_sessions` →
 * `session_exercises` → `performed_sets`; children cascade-delete with the root
 * (doc 13: the whole aggregate is one consistency boundary).
 *
 * - opaque UUID PKs, app-generated (doc 13: never natural keys).
 * - `user_id` references the owning user; no cross-aggregate FK (modules own
 *   their data — doc 13). `source_workout_id` is a soft link to the template and
 *   is intentionally NOT an FK, so deleting a template never rewrites history.
 * - `performed_on` is a civil DATE (the day the workout was done), not a
 *   timestamp — evaluated in the app timezone at write time (see local-day.ts).
 * - `status` is text + CHECK (mirrors @atlas/contracts SESSION_STATUSES).
 * - list index on (user_id, performed_on desc, id desc) serves the history cursor.
 */
export const workoutSessions = pgTable(
  "workout_sessions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(),
    sourceWorkoutId: uuid("source_workout_id"),
    title: text("title").notNull(),
    status: text("status").notNull().default("in_progress"),
    performedOn: date("performed_on").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    statusValid: check(
      "workout_sessions_status_valid",
      sql`${table.status} in ('in_progress', 'completed')`,
    ),
    userHistoryIdx: index("workout_sessions_user_performed_idx").on(
      table.userId,
      table.performedOn.desc(),
      table.id.desc(),
    ),
  }),
);

export const sessionExercises = pgTable(
  "session_exercises",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    exerciseName: text("exercise_name").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    bySessionIdx: index("session_exercises_session_idx").on(table.sessionId, table.position),
  }),
);

export const performedSets = pgTable(
  "performed_sets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => sessionExercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    reps: integer("reps").notNull(),
    /** Null for bodyweight sets. */
    loadWeight: doublePrecision("load_weight"),
    loadUnit: text("load_unit"),
    /** Whether the set was actually completed (vs. planned-but-skipped). */
    completed: boolean("completed").notNull().default(true),
    /** Perceived effort 1..10, or null if not rated. */
    rpe: smallint("rpe"),
    notes: text("notes"),
  },
  (table) => ({
    byExerciseIdx: index("performed_sets_exercise_idx").on(table.exerciseId, table.position),
    repsPositive: check("performed_sets_reps_positive", sql`${table.reps} >= 1`),
    loadUnitValid: check(
      "performed_sets_load_unit_valid",
      sql`${table.loadUnit} is null or ${table.loadUnit} in ('kg', 'lb')`,
    ),
    rpeRange: check("performed_sets_rpe_range", sql`${table.rpe} is null or ${table.rpe} between 1 and 10`),
  }),
);

export type WorkoutSessionRow = typeof workoutSessions.$inferSelect;
export type WorkoutSessionInsert = typeof workoutSessions.$inferInsert;
export type SessionExerciseRow = typeof sessionExercises.$inferSelect;
export type SessionExerciseInsert = typeof sessionExercises.$inferInsert;
export type PerformedSetRow = typeof performedSets.$inferSelect;
export type PerformedSetInsert = typeof performedSets.$inferInsert;
