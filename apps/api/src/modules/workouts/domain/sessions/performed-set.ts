import { Entity } from "../../../../shared/domain/entity.js";
import { ValidationError } from "../../../../shared/domain/errors.js";
import { type Load } from "../value-objects/load.js";
import { PerformedSetId } from "./session-id.js";
import { type Rpe } from "./value-objects/rpe.js";

interface PerformedSetProps {
  reps: number;
  /** Null for a bodyweight set. */
  load: Load | null;
  /** Whether the set was actually completed (vs. planned-but-skipped). */
  completed: boolean;
  /** Perceived effort, or null if not rated. */
  rpe: Rpe | null;
  notes: string | null;
}

const MAX_REPS = 1000;
const MAX_NOTES = 280;

/**
 * A set the user actually performed inside a session exercise (blueprint/13 —
 * part of the WorkoutSession aggregate; never referenced from outside the root).
 * Reps are 1..1000; load is optional (bodyweight); `completed` records whether
 * the set was done or skipped; RPE and notes are optional detail.
 */
export class PerformedSet extends Entity<PerformedSetId> {
  private readonly props: PerformedSetProps;

  private constructor(id: PerformedSetId, props: PerformedSetProps) {
    super(id);
    this.props = props;
  }

  static create(input: {
    reps: number;
    load?: Load | null;
    completed?: boolean;
    rpe?: Rpe | null;
    notes?: string | null;
  }): PerformedSet {
    return new PerformedSet(PerformedSetId.generate(), PerformedSet.validate(input));
  }

  /** Rehydrate from persistence with an existing id (no validation re-run). */
  static restore(id: PerformedSetId, props: PerformedSetProps): PerformedSet {
    return new PerformedSet(id, { ...props });
  }

  private static validate(input: {
    reps: number;
    load?: Load | null;
    completed?: boolean;
    rpe?: Rpe | null;
    notes?: string | null;
  }): PerformedSetProps {
    if (!Number.isInteger(input.reps) || input.reps < 1 || input.reps > MAX_REPS) {
      throw new ValidationError(
        "Número de repetições inválido.",
        [{ field: "reps", message: "Repetições inválidas.", code: "session.reps_invalid" }],
        "session.reps_invalid",
      );
    }
    const notes = input.notes?.trim() ?? null;
    if (notes !== null && notes.length > MAX_NOTES) {
      throw new ValidationError(
        `As observações devem ter até ${MAX_NOTES} caracteres.`,
        [{ field: "notes", message: "Observação muito longa.", code: "session.notes_too_long" }],
        "session.notes_too_long",
      );
    }
    return {
      reps: input.reps,
      load: input.load ?? null,
      // The user did the set unless told otherwise (blueprint/02 — sensible default).
      completed: input.completed ?? true,
      rpe: input.rpe ?? null,
      notes: notes && notes.length > 0 ? notes : null,
    };
  }

  get reps(): number {
    return this.props.reps;
  }

  get load(): Load | null {
    return this.props.load;
  }

  get completed(): boolean {
    return this.props.completed;
  }

  get rpe(): Rpe | null {
    return this.props.rpe;
  }

  get notes(): string | null {
    return this.props.notes;
  }
}
