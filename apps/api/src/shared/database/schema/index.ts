import { users } from "./users.schema.js";
import { workouts, workoutItems, exerciseSets } from "./workouts.schema.js";

/**
 * Single schema surface passed to `drizzle(client, { schema })` and the
 * migrator. Future module tables are aggregated here.
 */
export const schema = { users, workouts, workoutItems, exerciseSets };

export { users, workouts, workoutItems, exerciseSets };
export type { UserRow, UserInsert } from "./users.schema.js";
export type {
  WorkoutRow,
  WorkoutInsert,
  WorkoutItemRow,
  WorkoutItemInsert,
  ExerciseSetRow,
  ExerciseSetInsert,
} from "./workouts.schema.js";
