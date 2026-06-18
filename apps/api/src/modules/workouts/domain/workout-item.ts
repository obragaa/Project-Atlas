import { Entity } from "../../../shared/domain/entity.js";
import { ValidationError } from "../../../shared/domain/errors.js";
import { WorkoutItemId } from "./workout-id.js";
import { type ExerciseSet } from "./exercise-set.js";

const MAX_NAME = 120;

/**
 * An exercise within a workout (blueprint/13 — part of the Workout aggregate).
 * In this slice the exercise is free text (ADR-0003: no catalogue FK yet). Owns
 * its ordered sets; `order` is assigned by the root, not the item.
 */
export class WorkoutItem extends Entity<WorkoutItemId> {
  private _exerciseName: string;
  private _order: number;
  private readonly _sets: ExerciseSet[];

  private constructor(id: WorkoutItemId, exerciseName: string, order: number, sets: ExerciseSet[]) {
    super(id);
    this._exerciseName = exerciseName;
    this._order = order;
    this._sets = sets;
  }

  static create(input: { exerciseName: string; order: number; sets?: ExerciseSet[] }): WorkoutItem {
    const name = WorkoutItem.validateName(input.exerciseName);
    return new WorkoutItem(WorkoutItemId.generate(), name, input.order, input.sets ?? []);
  }

  /** Rehydrate from persistence. */
  static restore(
    id: WorkoutItemId,
    props: { exerciseName: string; order: number; sets: ExerciseSet[] },
  ): WorkoutItem {
    return new WorkoutItem(id, props.exerciseName, props.order, props.sets);
  }

  private static validateName(raw: string): string {
    const name = raw.trim();
    if (name.length < 1 || name.length > MAX_NAME) {
      throw new ValidationError(
        `O nome do exercício deve ter entre 1 e ${MAX_NAME} caracteres.`,
        [
          {
            field: "exerciseName",
            message: "Exercício inválido.",
            code: "workout.exercise_invalid",
          },
        ],
        "workout.exercise_invalid",
      );
    }
    return name;
  }

  get exerciseName(): string {
    return this._exerciseName;
  }

  get order(): number {
    return this._order;
  }

  /** Set position within the workout; only the aggregate root calls this. */
  reorder(order: number): void {
    this._order = order;
  }

  get sets(): readonly ExerciseSet[] {
    return this._sets;
  }
}
