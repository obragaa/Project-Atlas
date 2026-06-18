import { type MeasurementView } from "@atlas/contracts";
import { type MeasurementEntry } from "../domain/measurement-entry.js";

/** Pure transport mapping (domain → contract), blueprint/12. */
export function toMeasurementView(entry: MeasurementEntry): MeasurementView {
  const m = entry.measurements.fields;
  return {
    id: entry.id.toString(),
    recordedOn: entry.recordedOn.value,
    weightKg: entry.weightKg,
    measurements: {
      waist: m.waist,
      chest: m.chest,
      hips: m.hips,
      arm: m.arm,
      thigh: m.thigh,
      calf: m.calf,
    },
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
  };
}
