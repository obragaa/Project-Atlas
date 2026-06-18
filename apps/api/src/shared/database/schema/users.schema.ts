import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * `users` table (blueprint/13 - Database.md). Infrastructure-only; the Domain
 * never imports this.
 *
 * - `id`: opaque UUID PK, app-generated via `UserId.generate()` (doc 13: opaque
 *   keys, never natural keys). `gen_random_uuid()` is a safety-net default only;
 *   identity always comes from the app, never the DB.
 * - `email`: a unique attribute (NOT identity). Stored as text; the Email value
 *   object already lowercases, and a unique index on `lower(email)` enforces
 *   case-insensitive uniqueness with PGlite/Postgres parity (no citext).
 * - `roles`: text[] with a non-empty CHECK (mirrors @atlas/contracts ROLES);
 *   avoids enum migration churn.
 * - `version`: reserved for optimistic locking (doc 13 Concorrência) — DORMANT
 *   (default 0, never compared) until a concurrent-write use case needs it.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    roles: text("roles")
      .array()
      .notNull()
      .default(sql`'{user}'`),
    version: integer("version").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_lower_key").on(sql`lower(${table.email})`),
    rolesNotEmpty: check("users_roles_not_empty", sql`array_length(${table.roles}, 1) >= 1`),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
