import {
  type MeasurementInsert,
  type MeasurementRow,
} from "../../../../shared/database/schema/index.js";
import { MeasurementEntry } from "../../domain/measurement-entry.js";
import { MeasurementId } from "../../domain/measurement-id.js";
import { MeasurementDate } from "../../domain/value-objects/measurement-date.js";
import { BodyMeasurements } from "../../domain/value-objects/body-measurements.js";

/**
 * Translates between the `measurements` row and the `MeasurementEntry`. The only
 * place that knows column names; row types never escape Infrastructure
 * (blueprint/12). `toDomain` rehydrates via `restore` (no events).
 */
export function measurementToDomain(row: MeasurementRow): MeasurementEntry {
  return MeasurementEntry.restore(MeasurementId.create(row.id), {
    userId: row.userId,
    recordedOn: MeasurementDate.create(row.recordedOn),
    weightKg: row.weightKg,
    measurements: BodyMeasurements.create({
      waist: row.waistCm,
      chest: row.chestCm,
      hips: row.hipsCm,
      arm: row.armCm,
      thigh: row.thighCm,
      calf: row.calfCm,
    }),
    note: row.note,
    createdAt: row.createdAt,
  });
}

export function measurementToPersistence(entry: MeasurementEntry): MeasurementInsert {
  const m = entry.measurements.fields;
  return {
    id: entry.id.toString(),
    userId: entry.userId,
    recordedOn: entry.recordedOn.value,
    weightKg: entry.weightKg,
    waistCm: m.waist,
    chestCm: m.chest,
    hipsCm: m.hips,
    armCm: m.arm,
    thighCm: m.thigh,
    calfCm: m.calf,
    note: entry.note,
    createdAt: entry.createdAt,
  };
}
