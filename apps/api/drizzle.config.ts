import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit configuration (blueprint/13). Generates immutable SQL migrations
 * into `apps/api/drizzle` from the schema. Credentials come from the
 * environment; never hardcoded (doc 16).
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/database/schema/*.schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://atlas:atlas@localhost:5432/atlas",
  },
  strict: true,
  verbose: true,
});
