import { users } from "./users.schema.js";

/**
 * Single schema surface passed to `drizzle(client, { schema })` and the
 * migrator. Future module tables are aggregated here.
 */
export const schema = { users };

export { users };
export type { UserRow, UserInsert } from "./users.schema.js";
