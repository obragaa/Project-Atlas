import {
  type Load,
  type SetView,
  type WorkoutItemView,
  type WorkoutSummaryView,
  type WorkoutView,
} from "@atlas/contracts";
import { type Workout } from "../domain/workout.js";
import { type WorkoutItem } from "../domain/workout-item.js";
import { type ExerciseSet } from "../domain/exercise-set.js";
import { type Load as LoadVO } from "../domain/value-objects/load.js";

/**
 * Pure transport mapping (domain → contract). Mappers stay mappers; no
 * orchestration here (blueprint/12). The wire shape comes from @atlas/contracts.
 */

function toLoad(load: LoadVO | null): Load | null {
  return load === null ? null : { weight: load.weight, unit: load.unit };
}

function toSetView(set: ExerciseSet): SetView {
  return { id: set.id.toString(), reps: set.reps, load: toLoad(set.load), notes: set.notes };
}

function toItemView(item: WorkoutItem): WorkoutItemView {
  return {
    id: item.id.toString(),
    exerciseName: item.exerciseName,
    order: item.order,
    sets: item.sets.map(toSetView),
  };
}

export function toWorkoutView(workout: Workout): WorkoutView {
  return {
    id: workout.id.toString(),
    name: workout.name.value,
    status: workout.status,
    items: workout.items.map(toItemView),
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
    completedAt: workout.completedAt?.toISOString() ?? null,
  };
}

export function toWorkoutSummaryView(workout: Workout): WorkoutSummaryView {
  return {
    id: workout.id.toString(),
    name: workout.name.value,
    status: workout.status,
    itemCount: workout.items.length,
    createdAt: workout.createdAt.toISOString(),
    completedAt: workout.completedAt?.toISOString() ?? null,
  };
}
