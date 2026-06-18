import { ValueObject } from "../../../../shared/domain/value-object.js";
import { ValidationError } from "../../../../shared/domain/errors.js";

interface WorkoutNameProps {
  readonly value: string;
}

const MAX_LENGTH = 120;

/**
 * Workout name value object (blueprint/13 "Value Objects"). Trimmed; 1..120
 * chars. Self-validating so an invalid name can never enter the aggregate.
 */
export class WorkoutName extends ValueObject<WorkoutNameProps> {
  private constructor(props: WorkoutNameProps) {
    super(props);
  }

  static create(raw: string): WorkoutName {
    const normalized = raw.trim();
    if (normalized.length < 1 || normalized.length > MAX_LENGTH) {
      throw new ValidationError(
        `O nome do treino deve ter entre 1 e ${MAX_LENGTH} caracteres.`,
        [{ field: "name", message: "Nome de treino inválido.", code: "workout.name_invalid" }],
        "workout.name_invalid",
      );
    }
    return new WorkoutName({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }

  override toString(): string {
    return this.props.value;
  }
}
