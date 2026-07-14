import { Entity } from "../../../../shared/domain/entity.js";
import { ValidationError } from "../../../../shared/domain/errors.js";
import { SessionExerciseId } from "./session-id.js";
import { type PerformedSet } from "./performed-set.js";

const MAX_NAME = 120;

/**
 * An exercise performed within a session (blueprint/13 — part of the
 * WorkoutSession aggregate). The name is a snapshot taken when the session was
 * started (so renaming the template later never rewrites history). Owns its
 * ordered performed sets; `order` is assigned by the root, not the exercise.
 */
export class SessionExercise extends Entity<SessionExerciseId> {
  private _exerciseName: string;
  private _order: number;
  private readonly _sets: PerformedSet[];

  private constructor(
    id: SessionExerciseId,
    exerciseName: string,
    order: number,
    sets: PerformedSet[],
  ) {
    super(id);
    this._exerciseName = exerciseName;
    this._order = order;
    this._sets = sets;
  }

  static create(input: {
    exerciseName: string;
    order: number;
    sets?: PerformedSet[];
  }): SessionExercise {
    const name = SessionExercise.validateName(input.exerciseName);
    return new SessionExercise(SessionExerciseId.generate(), name, input.order, input.sets ?? []);
  }

  /** Rehydrate from persistence. */
  static restore(
    id: SessionExerciseId,
    props: { exerciseName: string; order: number; sets: PerformedSet[] },
  ): SessionExercise {
    return new SessionExercise(id, props.exerciseName, props.order, props.sets);
  }

  private static validateName(raw: string): string {
    const name = raw.trim();
    if (name.length < 1 || name.length > MAX_NAME) {
      throw new ValidationError(
        `O nome do exercício deve ter entre 1 e ${MAX_NAME} caracteres.`,
        [{ field: "exerciseName", message: "Exercício inválido.", code: "session.exercise_invalid" }],
        "session.exercise_invalid",
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

  /** Set position within the session; only the aggregate root calls this. */
  reorder(order: number): void {
    this._order = order;
  }

  get sets(): readonly PerformedSet[] {
    return this._sets;
  }

  /** Count of sets the user actually completed — feeds the summary/gamification. */
  get completedSetCount(): number {
    return this._sets.filter((set) => set.completed).length;
  }
}
