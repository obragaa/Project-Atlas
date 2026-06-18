import { type MeasurementEntry } from "./measurement-entry.js";
import { type MeasurementId } from "./measurement-id.js";

/**
 * Measurement repository port (blueprint/12 Dependency Rule, 13 Domain
 * Ownership). The Application layer depends on this; Drizzle is invisible here.
 */
export const MEASUREMENT_REPOSITORY = Symbol("MEASUREMENT_REPOSITORY");

export interface MeasurementPage {
  readonly items: readonly MeasurementEntry[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

export interface ListMeasurementsParams {
  readonly userId: string;
  readonly cursor?: string;
  readonly limit: number;
}

export interface MeasurementRepository {
  /**
   * Persist a measurement, replacing any existing entry for the same
   * (user, date) — one snapshot per day (ADR-0005, UPSERT semantics).
   */
  save(entry: MeasurementEntry): Promise<void>;
  /** Load one entry by id, or null. */
  findById(id: MeasurementId): Promise<MeasurementEntry | null>;
  /** A cursor page of the user's history (newest first). */
  list(params: ListMeasurementsParams): Promise<MeasurementPage>;
  /** Every entry for a user, oldest first — drives the chart and derived stats. */
  listAllForUser(userId: string): Promise<readonly MeasurementEntry[]>;
  /** Physically delete an entry. */
  delete(id: MeasurementId): Promise<void>;
}
