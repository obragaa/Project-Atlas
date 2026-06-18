import { users } from "./users.schema.js";
import { workouts, workoutItems, exerciseSets } from "./workouts.schema.js";
import { exercises } from "./exercises.schema.js";
import { measurements } from "./measurements.schema.js";

/**
 * Single schema surface passed to `drizzle(client, { schema })` and the
 * migrator. Future module tables are aggregated here.
 */
export const schema = { users, workouts, workoutItems, exerciseSets, exercises, measurements };

export { users, workouts, workoutItems, exerciseSets, exercises, measurements };
export type { UserRow, UserInsert } from "./users.schema.js";
export type {
  WorkoutRow,
  WorkoutInsert,
  WorkoutItemRow,
  WorkoutItemInsert,
  ExerciseSetRow,
  ExerciseSetInsert,
} from "./workouts.schema.js";
export type { ExerciseRow, ExerciseInsert } from "./exercises.schema.js";
export type { MeasurementRow, MeasurementInsert } from "./measurements.schema.js";
