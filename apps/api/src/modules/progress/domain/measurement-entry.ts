import { AggregateRoot } from "../../../shared/domain/aggregate-root.js";
import { ValidationError } from "../../../shared/domain/errors.js";
import { MeasurementId } from "./measurement-id.js";
import { type MeasurementDate } from "./value-objects/measurement-date.js";
import { type BodyMeasurements } from "./value-objects/body-measurements.js";
import { MeasurementRecorded } from "./events.js";

interface MeasurementProps {
  readonly userId: string;
  readonly recordedOn: MeasurementDate;
  readonly weightKg: number | null;
  readonly measurements: BodyMeasurements;
  readonly note: string | null;
  readonly createdAt: Date;
}

const MAX_WEIGHT_KG = 1000;
const MAX_NOTE = 280;

/**
 * A measurement snapshot for a date (blueprint/07 "Progresso", ADR-0005). An
 * immutable per-user record; it is an aggregate root only so it can carry the
 * `MeasurementRecorded` event. Must contain weight OR at least one body
 * measurement — an empty snapshot is meaningless.
 */
export class MeasurementEntry extends AggregateRoot<MeasurementId> {
  private readonly props: MeasurementProps;

  private constructor(id: MeasurementId, props: MeasurementProps) {
    super(id);
    this.props = props;
  }

  static record(input: {
    userId: string;
    recordedOn: MeasurementDate;
    weightKg?: number | null;
    measurements: BodyMeasurements;
    note?: string | null;
  }): MeasurementEntry {
    const weightKg = normalizeWeight(input.weightKg ?? null);
    if (weightKg === null && input.measurements.isEmpty()) {
      throw new ValidationError(
        "Informe o peso ou ao menos uma medida corporal.",
        [{ field: "weightKg", message: "Registro vazio.", code: "progress.empty_entry" }],
        "progress.empty_entry",
      );
    }
    const note = normalizeNote(input.note ?? null);

    const entry = new MeasurementEntry(MeasurementId.generate(), {
      userId: input.userId,
      recordedOn: input.recordedOn,
      weightKg,
      measurements: input.measurements,
      note,
      createdAt: new Date(),
    });
    entry.addDomainEvent(new MeasurementRecorded(entry.id.toString(), input.userId));
    return entry;
  }

  /** Rehydrate from persistence (no events). */
  static restore(id: MeasurementId, props: MeasurementProps): MeasurementEntry {
    return new MeasurementEntry(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }

  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  get recordedOn(): MeasurementDate {
    return this.props.recordedOn;
  }

  get weightKg(): number | null {
    return this.props.weightKg;
  }

  get measurements(): BodyMeasurements {
    return this.props.measurements;
  }

  get note(): string | null {
    return this.props.note;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}

function normalizeWeight(weight: number | null): number | null {
  if (weight === null) {
    return null;
  }
  if (!Number.isFinite(weight) || weight <= 0 || weight > MAX_WEIGHT_KG) {
    throw new ValidationError(
      "Peso inválido.",
      [{ field: "weightKg", message: "Peso inválido.", code: "progress.weight_invalid" }],
      "progress.weight_invalid",
    );
  }
  // Round to one decimal (grams precision is noise for body weight).
  return Math.round(weight * 10) / 10;
}

function normalizeNote(note: string | null): string | null {
  if (note === null) {
    return null;
  }
  const trimmed = note.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > MAX_NOTE) {
    throw new ValidationError(
      `A observação deve ter até ${MAX_NOTE} caracteres.`,
      [{ field: "note", message: "Observação muito longa.", code: "progress.note_too_long" }],
      "progress.note_too_long",
    );
  }
  return trimmed;
}
