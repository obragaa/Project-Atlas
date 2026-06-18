import { type LoadUnit, LOAD_UNITS } from "@atlas/contracts";
import { ValueObject } from "../../../../shared/domain/value-object.js";
import { ValidationError } from "../../../../shared/domain/errors.js";

interface LoadProps {
  readonly weight: number;
  readonly unit: LoadUnit;
}

const MAX_WEIGHT = 10_000;

/**
 * A resistance load: weight + unit (blueprint/13 "Value Objects" — Weight).
 * Immutable and self-validating. Absence of a Load means a bodyweight set, so
 * `null` is handled by the caller, not by this type.
 */
export class Load extends ValueObject<LoadProps> {
  private constructor(props: LoadProps) {
    super(props);
  }

  static create(weight: number, unit: LoadUnit): Load {
    if (!Number.isFinite(weight) || weight < 0 || weight > MAX_WEIGHT) {
      throw new ValidationError(
        "Carga inválida.",
        [{ field: "load.weight", message: "Carga inválida.", code: "workout.load_invalid" }],
        "workout.load_invalid",
      );
    }
    if (!LOAD_UNITS.includes(unit)) {
      throw new ValidationError(
        "Unidade de carga inválida.",
        [{ field: "load.unit", message: "Unidade inválida.", code: "workout.load_unit_invalid" }],
        "workout.load_unit_invalid",
      );
    }
    return new Load({ weight, unit });
  }

  get weight(): number {
    return this.props.weight;
  }

  get unit(): LoadUnit {
    return this.props.unit;
  }
}
