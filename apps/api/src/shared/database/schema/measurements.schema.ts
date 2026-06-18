import { sql } from "drizzle-orm";
import {
  check,
  doublePrecision,
  date,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Progress measurements (blueprint/13, ADR-0005). Infrastructure-only; the
 * Domain never imports this. A per-user time series; one snapshot per
 * (user_id, recorded_on) — the unique index enforces it and the repository
 * UPSERTs onto it. Weight in kg, measurements in cm.
 *
 * `user_id` references the owning user; cross-aggregate consistency is eventual,
 * so there is no FK to `users` (modules own their data — doc 13). The unique
 * (user_id, recorded_on) index also serves the newest-first history + chart.
 */
export const measurements = pgTable(
  "measurements",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(),
    recordedOn: date("recorded_on").notNull(),
    weightKg: doublePrecision("weight_kg"),
    waistCm: doublePrecision("waist_cm"),
    chestCm: doublePrecision("chest_cm"),
    hipsCm: doublePrecision("hips_cm"),
    armCm: doublePrecision("arm_cm"),
    thighCm: doublePrecision("thigh_cm"),
    calfCm: doublePrecision("calf_cm"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userDateUnique: uniqueIndex("measurements_user_date_key").on(table.userId, table.recordedOn),
    weightValid: check(
      "measurements_weight_valid",
      sql`${table.weightKg} is null or (${table.weightKg} > 0 and ${table.weightKg} <= 1000)`,
    ),
  }),
);

export type MeasurementRow = typeof measurements.$inferSelect;
export type MeasurementInsert = typeof measurements.$inferInsert;
