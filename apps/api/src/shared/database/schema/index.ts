import { users } from "./users.schema.js";
import { workouts, workoutItems, exerciseSets } from "./workouts.schema.js";
import { exercises } from "./exercises.schema.js";
import { measurements } from "./measurements.schema.js";
import { activityLog, achievementUnlocks } from "./gamification.schema.js";

/**
 * Single schema surface passed to `drizzle(client, { schema })` and the
 * migrator. Future module tables are aggregated here.
 */
export const schema = {
  users,
  workouts,
  workoutItems,
  exerciseSets,
  exercises,
  measurements,
  activityLog,
  achievementUnlocks,
};

export {
  users,
  workouts,
  workoutItems,
  exerciseSets,
  exercises,
  measurements,
  activityLog,
  achievementUnlocks,
};
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
export type {
  ActivityLogRow,
  ActivityLogInsert,
  AchievementUnlockRow,
  AchievementUnlockInsert,
} from "./gamification.schema.js";
