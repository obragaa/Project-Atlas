import { ValueObject } from "../../../../shared/domain/value-object.js";
import { ValidationError } from "../../../../shared/domain/errors.js";

/** The optional body measurements a snapshot can carry, all in centimetres. */
export interface MeasurementFields {
  readonly waist: number | null;
  readonly chest: number | null;
  readonly hips: number | null;
  readonly arm: number | null;
  readonly thigh: number | null;
  readonly calf: number | null;
}

const KEYS: readonly (keyof MeasurementFields)[] = [
  "waist",
  "chest",
  "hips",
  "arm",
  "thigh",
  "calf",
];
const MAX_CM = 400;

/**
 * Body measurements value object (blueprint/13 Value Objects). Every field is
 * optional (a snapshot may record only some); present values are validated to a
 * sane centimetre range. Immutable.
 */
export class BodyMeasurements extends ValueObject<MeasurementFields> {
  private constructor(props: MeasurementFields) {
    super(props);
  }

  static create(
    input: Partial<Record<keyof MeasurementFields, number | null | undefined>>,
  ): BodyMeasurements {
    const normalize = (key: keyof MeasurementFields): number | null => {
      const raw = input[key];
      if (raw === undefined || raw === null) {
        return null;
      }
      if (!Number.isFinite(raw) || raw <= 0 || raw > MAX_CM) {
        throw new ValidationError(
          "Medida corporal inválida.",
          [{ field: key, message: "Medida inválida.", code: "progress.measurement_invalid" }],
          "progress.measurement_invalid",
        );
      }
      return raw;
    };

    return new BodyMeasurements({
      waist: normalize("waist"),
      chest: normalize("chest"),
      hips: normalize("hips"),
      arm: normalize("arm"),
      thigh: normalize("thigh"),
      calf: normalize("calf"),
    });
  }

  /** True when no measurement is present (so an entry can require weight OR a measurement). */
  isEmpty(): boolean {
    return KEYS.every((key) => this.props[key] === null);
  }

  get fields(): MeasurementFields {
    return this.props;
  }
}
