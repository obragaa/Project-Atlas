/**
 * Progress transport contract (blueprint/07 - Features.md "Progresso", 13, 14).
 * A per-user time series of body measurements with a derived chart and personal
 * records (ADR-0005). Weight is in kilograms, measurements in centimetres.
 */

/** Optional body measurements, all in centimetres. */
export interface BodyMeasurements {
  readonly waist?: number | null;
  readonly chest?: number | null;
  readonly hips?: number | null;
  readonly arm?: number | null;
  readonly thigh?: number | null;
  readonly calf?: number | null;
}

/** A recorded measurement snapshot for one date. */
export interface MeasurementView {
  readonly id: string;
  /** ISO date (YYYY-MM-DD) the measurement is for. */
  readonly recordedOn: string;
  readonly weightKg: number | null;
  readonly measurements: BodyMeasurements;
  readonly note: string | null;
  readonly createdAt: string;
}

/** Create/replace a measurement for a date (UPSERT on user+date). */
export interface RecordMeasurementRequest {
  /** ISO date (YYYY-MM-DD). Defaults to today if omitted. */
  readonly recordedOn?: string;
  readonly weightKg?: number | null;
  readonly measurements?: BodyMeasurements;
  readonly note?: string | null;
}

/** One point on the weight chart (ascending by date). */
export interface WeightPoint {
  readonly recordedOn: string;
  readonly weightKg: number;
}

/** Derived personal records & stats over the series (computed on read). */
export interface ProgressSummary {
  readonly entryCount: number;
  readonly latestWeightKg: number | null;
  readonly lowestWeightKg: number | null;
  readonly highestWeightKg: number | null;
  /** latest − first weight (kg); negative means weight lost. Null if <2 points. */
  readonly totalChangeKg: number | null;
  /** Ascending weight series for charting. */
  readonly weightSeries: readonly WeightPoint[];
}
