import { Entity } from "../../../shared/domain/entity.js";
import { ValidationError } from "../../../shared/domain/errors.js";
import { SetId } from "./workout-id.js";
import { type Load } from "./value-objects/load.js";

interface SetProps {
  reps: number;
  /** Null for a bodyweight set. */
  load: Load | null;
  notes: string | null;
}

const MAX_REPS = 1000;
const MAX_NOTES = 280;

/**
 * A recorded set inside a workout item (blueprint/13 — part of the Workout
 * aggregate; never referenced from outside the root). Reps are 1..1000; load is
 * optional (bodyweight); notes are short free text.
 */
export class ExerciseSet extends Entity<SetId> {
  private readonly props: SetProps;

  private constructor(id: SetId, props: SetProps) {
    super(id);
    this.props = props;
  }

  static create(input: { reps: number; load?: Load | null; notes?: string | null }): ExerciseSet {
    return new ExerciseSet(SetId.generate(), ExerciseSet.validate(input));
  }

  /** Rehydrate from persistence with an existing id (no validation re-run). */
  static restore(
    id: SetId,
    props: { reps: number; load: Load | null; notes: string | null },
  ): ExerciseSet {
    return new ExerciseSet(id, { ...props });
  }

  private static validate(input: {
    reps: number;
    load?: Load | null;
    notes?: string | null;
  }): SetProps {
    if (!Number.isInteger(input.reps) || input.reps < 1 || input.reps > MAX_REPS) {
      throw new ValidationError(
        "Número de repetições inválido.",
        [{ field: "reps", message: "Repetições inválidas.", code: "workout.reps_invalid" }],
        "workout.reps_invalid",
      );
    }
    const notes = input.notes?.trim() ?? null;
    if (notes !== null && notes.length > MAX_NOTES) {
      throw new ValidationError(
        `As observações devem ter até ${MAX_NOTES} caracteres.`,
        [{ field: "notes", message: "Observação muito longa.", code: "workout.notes_too_long" }],
        "workout.notes_too_long",
      );
    }
    return {
      reps: input.reps,
      load: input.load ?? null,
      notes: notes && notes.length > 0 ? notes : null,
    };
  }

  get reps(): number {
    return this.props.reps;
  }

  get load(): Load | null {
    return this.props.load;
  }

  get notes(): string | null {
    return this.props.notes;
  }
}
