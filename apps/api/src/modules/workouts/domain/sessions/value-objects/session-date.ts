import { ValueObject } from "../../../../../shared/domain/value-object.js";
import { ValidationError } from "../../../../../shared/domain/errors.js";
import { toLocalDay } from "../../../../../shared/domain/local-day.js";

interface SessionDateProps {
  /** Canonical ISO calendar date, AAAA-MM-DD, in the app's civil timezone. */
  readonly value: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The calendar day a workout was performed (blueprint/13 Value Objects; 02
 * "Menos cliques": defaults to today so the user never types it for a workout
 * done now). A civil day, not a timestamp. A session may be backdated (recording
 * a past workout) but never dated in the future.
 */
export class SessionDate extends ValueObject<SessionDateProps> {
  private constructor(props: SessionDateProps) {
    super(props);
  }

  /**
   * Parse an explicit day. `todayLocal` is the app-timezone "today" (AAAA-MM-DD)
   * used to reject future dates; the caller derives it from `SessionDate.today`.
   */
  static create(raw: string, todayLocal: string): SessionDate {
    const value = raw.trim();
    if (!ISO_DATE.test(value) || !isRealDate(value)) {
      throw new ValidationError(
        "Data inválida. Use o formato AAAA-MM-DD.",
        [{ field: "performedOn", message: "Data inválida.", code: "session.date_invalid" }],
        "session.date_invalid",
      );
    }
    if (value > todayLocal) {
      throw new ValidationError(
        "A data do treino não pode estar no futuro.",
        [{ field: "performedOn", message: "Data no futuro.", code: "session.date_in_future" }],
        "session.date_in_future",
      );
    }
    return new SessionDate({ value });
  }

  /** The app-timezone civil day for a JS instant (default "today"). */
  static today(now: Date): SessionDate {
    return new SessionDate({ value: toLocalDay(now) });
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
