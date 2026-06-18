import { Inject, Injectable } from "@nestjs/common";
import { type ProgressSummary, type WeightPoint } from "@atlas/contracts";
import {
  MEASUREMENT_REPOSITORY,
  type MeasurementRepository,
} from "../domain/measurement.repository.js";
import { type MeasurementEntry } from "../domain/measurement-entry.js";

export interface GetProgressSummaryQuery {
  readonly userId: string;
}

/**
 * Computes derived progress records & stats on read (blueprint/13 "Dados
 * Derivados": calculate on read; never persist). Latest/lowest/highest weight,
 * total change vs. the first weighed entry, entry count, and the ascending
 * weight series for charting.
 */
@Injectable()
export class GetProgressSummaryUseCase {
  constructor(
    @Inject(MEASUREMENT_REPOSITORY) private readonly measurements: MeasurementRepository,
  ) {}

  async execute(query: GetProgressSummaryQuery): Promise<ProgressSummary> {
    // Oldest first.
    const entries = await this.measurements.listAllForUser(query.userId);

    const weighed: WeightPoint[] = entries
      .filter((e: MeasurementEntry) => e.weightKg !== null)
      .map((e) => ({ recordedOn: e.recordedOn.value, weightKg: e.weightKg as number }));

    const weights = weighed.map((p) => p.weightKg);
    const latest = weighed.length > 0 ? weighed[weighed.length - 1]!.weightKg : null;
    const first = weighed.length > 0 ? weighed[0]!.weightKg : null;

    return {
      entryCount: entries.length,
      latestWeightKg: latest,
      lowestWeightKg: weights.length > 0 ? Math.min(...weights) : null,
      highestWeightKg: weights.length > 0 ? Math.max(...weights) : null,
      totalChangeKg:
        weighed.length >= 2 && latest !== null && first !== null
          ? Math.round((latest - first) * 10) / 10
          : null,
      weightSeries: weighed,
    };
  }
}
