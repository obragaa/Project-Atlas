import { ValueObject } from "../../../../shared/domain/value-object.js";
import { ValidationError } from "../../../../shared/domain/errors.js";

interface MeasurementDateProps {
  /** Canonical ISO calendar date, YYYY-MM-DD. */
  readonly value: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A calendar date (not a timestamp) a measurement is for (blueprint/13 Value
 * Objects). Stored as `YYYY-MM-DD`; one measurement per (user, date). Validated
 * so a malformed or impossible date never enters the series.
 */
export class MeasurementDate extends ValueObject<MeasurementDateProps> {
  private constructor(props: MeasurementDateProps) {
    super(props);
  }

  static create(raw: string): MeasurementDate {
    const value = raw.trim();
    if (!ISO_DATE.test(value) || !isRealDate(value)) {
      throw new ValidationError(
        "Data inválida. Use o formato AAAA-MM-DD.",
        [{ field: "recordedOn", message: "Data inválida.", code: "progress.date_invalid" }],
        "progress.date_invalid",
      );
    }
    return new MeasurementDate({ value });
  }

  /** Builds a date from a JS Date's UTC calendar day. */
  static fromDate(date: Date): MeasurementDate {
    const iso = date.toISOString().slice(0, 10);
    return new MeasurementDate({ value: iso });
  }

  get value(): string {
    return this.props.value;
  }

  override toString(): string {
    return this.props.value;
  }
}

function isRealDate(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
