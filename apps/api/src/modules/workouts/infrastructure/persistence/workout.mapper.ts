import { type LoadUnit } from "@atlas/contracts";
import {
  type ExerciseSetRow,
  type WorkoutItemRow,
  type WorkoutRow,
} from "../../../../shared/database/schema/index.js";
import { Workout, type WorkoutStatus } from "../../domain/workout.js";
import { WorkoutItem } from "../../domain/workout-item.js";
import { ExerciseSet } from "../../domain/exercise-set.js";
import { WorkoutId, WorkoutItemId, SetId } from "../../domain/workout-id.js";
import { Load } from "../../domain/value-objects/load.js";
import { WorkoutName } from "../../domain/value-objects/workout-name.js";

/**
 * Translates between the workout rows and the `Workout` aggregate. The only
 * place that knows column names; row types never escape Infrastructure
 * (blueprint/12). `toDomain` rehydrates via `restore` factories (no events).
 */

/** A loaded aggregate's rows, grouped for rehydration. */
export interface WorkoutRowBundle {
  readonly workout: WorkoutRow;
  readonly items: readonly WorkoutItemRow[];
  readonly sets: readonly ExerciseSetRow[];
}

function setFromRow(row: ExerciseSetRow): ExerciseSet {
  const load =
    row.loadWeight === null || row.loadUnit === null
      ? null
      : Load.create(row.loadWeight, row.loadUnit as LoadUnit);
  return ExerciseSet.restore(SetId.create(row.id), { reps: row.reps, load, notes: row.notes });
}

export function toDomain(bundle: WorkoutRowBundle): Workout {
  const setsByItem = new Map<string, ExerciseSetRow[]>();
  for (const set of bundle.sets) {
    const list = setsByItem.get(set.itemId) ?? [];
    list.push(set);
    setsByItem.set(set.itemId, list);
  }

  const items = [...bundle.items]
    .sort((a, b) => a.position - b.position)
    .map((itemRow) => {
      const sets = (setsByItem.get(itemRow.id) ?? [])
        .sort((a, b) => a.position - b.position)
        .map(setFromRow);
      return WorkoutItem.restore(WorkoutItemId.create(itemRow.id), {
        exerciseName: itemRow.exerciseName,
        order: itemRow.position,
        sets,
      });
    });

  return Workout.restore(WorkoutId.create(bundle.workout.id), {
    userId: bundle.workout.userId,
    name: WorkoutName.create(bundle.workout.name),
    status: bundle.workout.status as WorkoutStatus,
    items,
    createdAt: bundle.workout.createdAt,
    updatedAt: bundle.workout.updatedAt,
    completedAt: bundle.workout.completedAt,
  });
}

/** Flattens an aggregate into the rows to persist (insert order: workout→items→sets). */
export function toPersistence(workout: Workout): {
  workout: WorkoutRow;
  items: WorkoutItemRow[];
  sets: ExerciseSetRow[];
} {
  const workoutRow: WorkoutRow = {
    id: workout.id.toString(),
    userId: workout.userId,
    name: workout.name.value,
    status: workout.status,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt,
    completedAt: workout.completedAt,
  };

  const items: WorkoutItemRow[] = [];
  const sets: ExerciseSetRow[] = [];

  for (const item of workout.items) {
    items.push({
      id: item.id.toString(),
      workoutId: workoutRow.id,
      exerciseName: item.exerciseName,
      position: item.order,
      createdAt: workout.createdAt,
    });
    item.sets.forEach((set, index) => {
      sets.push({
        id: set.id.toString(),
        itemId: item.id.toString(),
        position: index,
        reps: set.reps,
        loadWeight: set.load?.weight ?? null,
        loadUnit: set.load?.unit ?? null,
        notes: set.notes,
      });
    });
  }

  return { workout: workoutRow, items, sets };
}
