import { sql } from "drizzle-orm";
import { date, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * Gamification persistence (blueprint/13, ADR-0006). Infrastructure-only; the
 * Domain never imports this. The module owns these tables and reads nothing from
 * other modules' data.
 *
 * `activity_log` is this module's source of truth — one row per (user, date,
 * kind); the unique index makes event replays idempotent (two workouts the same
 * day are still one active day). `achievement_unlocks` records a milestone once
 * per (user, key) — a dated fact of the journey (doc 09).
 */
export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(),
    activityDate: date("activity_date").notNull(),
    kind: text("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniquePerDayKind: uniqueIndex("activity_log_user_date_kind_key").on(
      table.userId,
      table.activityDate,
      table.kind,
    ),
    byUser: index("activity_log_user_idx").on(table.userId, table.activityDate),
  }),
);

export const achievementUnlocks = pgTable(
  "achievement_unlocks",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(),
    achievementKey: text("achievement_key").notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniquePerKey: uniqueIndex("achievement_unlocks_user_key").on(
      table.userId,
      table.achievementKey,
    ),
  }),
);

export type ActivityLogRow = typeof activityLog.$inferSelect;
export type ActivityLogInsert = typeof activityLog.$inferInsert;
export type AchievementUnlockRow = typeof achievementUnlocks.$inferSelect;
export type AchievementUnlockInsert = typeof achievementUnlocks.$inferInsert;
