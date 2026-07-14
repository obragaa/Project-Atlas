import { type LoadUnit } from "@atlas/contracts";
import {
  type PerformedSetRow,
  type SessionExerciseRow,
  type WorkoutSessionRow,
} from "../../../../shared/database/schema/index.js";
import { WorkoutSession, type SessionStatus } from "../../domain/sessions/workout-session.js";
import { SessionExercise } from "../../domain/sessions/session-exercise.js";
import { PerformedSet } from "../../domain/sessions/performed-set.js";
import {
  WorkoutSessionId,
  SessionExerciseId,
  PerformedSetId,
} from "../../domain/sessions/session-id.js";
import { SessionDate } from "../../domain/sessions/value-objects/session-date.js";
import { Rpe } from "../../domain/sessions/value-objects/rpe.js";
import { Load } from "../../domain/value-objects/load.js";
import { WorkoutName } from "../../domain/value-objects/workout-name.js";

/**
 * Translates between session rows and the `WorkoutSession` aggregate. The only
 * place that knows column names; row types never escape Infrastructure
 * (blueprint/12). `toDomain` rehydrates via `restore` factories (no events).
 */

/** A loaded aggregate's rows, grouped for rehydration. */
export interface SessionRowBundle {
  readonly session: WorkoutSessionRow;
  readonly exercises: readonly SessionExerciseRow[];
  readonly sets: readonly PerformedSetRow[];
}

function setFromRow(row: PerformedSetRow): PerformedSet {
  const load =
    row.loadWeight === null || row.loadUnit === null
      ? null
      : Load.create(row.loadWeight, row.loadUnit as LoadUnit);
  return PerformedSet.restore(PerformedSetId.create(row.id), {
    reps: row.reps,
    load,
    completed: row.completed,
    rpe: row.rpe === null ? null : Rpe.create(row.rpe),
    notes: row.notes,
  });
}

export function toDomain(bundle: SessionRowBundle): WorkoutSession {
  const setsByExercise = new Map<string, PerformedSetRow[]>();
  for (const set of bundle.sets) {
    const list = setsByExercise.get(set.exerciseId) ?? [];
    list.push(set);
    setsByExercise.set(set.exerciseId, list);
  }

  const exercises = [...bundle.exercises]
    .sort((a, b) => a.position - b.position)
    .map((exerciseRow) => {
      const sets = (setsByExercise.get(exerciseRow.id) ?? [])
        .sort((a, b) => a.position - b.position)
        .map(setFromRow);
      return SessionExercise.restore(SessionExerciseId.create(exerciseRow.id), {
        exerciseName: exerciseRow.exerciseName,
        order: exerciseRow.position,
        sets,
      });
    });

  return WorkoutSession.restore(WorkoutSessionId.create(bundle.session.id), {
    userId: bundle.session.userId,
    sourceWorkoutId: bundle.session.sourceWorkoutId,
    title: WorkoutName.create(bundle.session.title),
    status: bundle.session.status as SessionStatus,
    // `performed_on` is a DATE column → the driver returns AAAA-MM-DD; today is
    // irrelevant on restore (a stored date is by definition already valid/past).
    performedOn: SessionDate.create(bundle.session.performedOn, bundle.session.performedOn),
    exercises,
    notes: bundle.session.notes,
    createdAt: bundle.session.createdAt,
    completedAt: bundle.session.completedAt,
  });
}

/** Flattens an aggregate into rows to persist (insert order: session→exercises→sets). */
export function toPersistence(session: WorkoutSession): {
  session: WorkoutSessionRow;
  exercises: SessionExerciseRow[];
  sets: PerformedSetRow[];
} {
  const sessionRow: WorkoutSessionRow = {
    id: session.id.toString(),
    userId: session.userId,
    sourceWorkoutId: session.sourceWorkoutId,
    title: session.title.value,
    status: session.status,
    performedOn: session.performedOn.value,
    notes: session.notes,
    createdAt: session.createdAt,
    completedAt: session.completedAt,
  };

  const exercises: SessionExerciseRow[] = [];
  const sets: PerformedSetRow[] = [];

  for (const exercise of session.exercises) {
    exercises.push({
      id: exercise.id.toString(),
      sessionId: sessionRow.id,
      exerciseName: exercise.exerciseName,
      position: exercise.order,
      createdAt: session.createdAt,
    });
    exercise.sets.forEach((set, index) => {
      sets.push({
        id: set.id.toString(),
        exerciseId: exercise.id.toString(),
        position: index,
        reps: set.reps,
        loadWeight: set.load?.weight ?? null,
        loadUnit: set.load?.unit ?? null,
        completed: set.completed,
        rpe: set.rpe?.value ?? null,
        notes: set.notes,
      });
    });
  }

  return { session: sessionRow, exercises, sets };
}
