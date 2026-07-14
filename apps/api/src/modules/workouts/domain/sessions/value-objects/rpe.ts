import { RPE_MAX, RPE_MIN } from "@atlas/contracts";
import { ValueObject } from "../../../../../shared/domain/value-object.js";
import { ValidationError } from "../../../../../shared/domain/errors.js";

interface RpeProps {
  readonly value: number;
}

/**
 * Rating of Perceived Exertion (blueprint/07 "Registrar observações" — effort is
 * part of what a serious lifter records). An integer 1..10 describing how hard a
 * set felt. Optional at the set level, so `null` is handled by the caller.
 */
export class Rpe extends ValueObject<RpeProps> {
  private constructor(props: RpeProps) {
    super(props);
  }

  static create(value: number): Rpe {
    if (!Number.isInteger(value) || value < RPE_MIN || value > RPE_MAX) {
      throw new ValidationError(
        `O esforço percebido (RPE) deve ser um inteiro de ${RPE_MIN} a ${RPE_MAX}.`,
        [{ field: "rpe", message: "RPE inválido.", code: "session.rpe_invalid" }],
        "session.rpe_invalid",
      );
    }
    return new Rpe({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
