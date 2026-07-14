import {
  type Load,
  type PerformedSetView,
  type SessionExerciseView,
  type WorkoutSessionSummaryView,
  type WorkoutSessionView,
} from "@atlas/contracts";
import { type WorkoutSession } from "../../domain/sessions/workout-session.js";
import { type SessionExercise } from "../../domain/sessions/session-exercise.js";
import { type PerformedSet } from "../../domain/sessions/performed-set.js";
import { type Load as LoadVO } from "../../domain/value-objects/load.js";

/**
 * Pure transport mapping (domain → contract) for workout sessions. Mappers stay
 * mappers; no orchestration here (blueprint/12). The wire shape comes from
 * @atlas/contracts.
 */

function toLoad(load: LoadVO | null): Load | null {
  return load === null ? null : { weight: load.weight, unit: load.unit };
}

function toSetView(set: PerformedSet): PerformedSetView {
  return {
    id: set.id.toString(),
    reps: set.reps,
    load: toLoad(set.load),
    completed: set.completed,
    rpe: set.rpe?.value ?? null,
    notes: set.notes,
  };
}

function toExerciseView(exercise: SessionExercise): SessionExerciseView {
  return {
    id: exercise.id.toString(),
    exerciseName: exercise.exerciseName,
    order: exercise.order,
    sets: exercise.sets.map(toSetView),
  };
}

export function toSessionView(session: WorkoutSession): WorkoutSessionView {
  return {
    id: session.id.toString(),
    sourceWorkoutId: session.sourceWorkoutId,
    title: session.title.value,
    status: session.status,
    performedOn: session.performedOn.value,
    exercises: session.exercises.map(toExerciseView),
    notes: session.notes,
    createdAt: session.createdAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
  };
}

export function toSessionSummaryView(session: WorkoutSession): WorkoutSessionSummaryView {
  return {
    id: session.id.toString(),
    title: session.title.value,
    status: session.status,
    performedOn: session.performedOn.value,
    exerciseCount: session.exercises.length,
    completedSetCount: session.completedSetCount,
    completedAt: session.completedAt?.toISOString() ?? null,
  };
}
