import { Inject, Injectable } from "@nestjs/common";
import { type CursorPage, type MeasurementView } from "@atlas/contracts";
import {
  MEASUREMENT_REPOSITORY,
  type MeasurementRepository,
} from "../domain/measurement.repository.js";
import { toMeasurementView } from "./measurement.mapper.js";

export interface ListMeasurementsQuery {
  readonly userId: string;
  readonly cursor?: string;
  readonly limit?: number;
}

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

/** Lists the user's measurement history, newest first, cursor-paginated. */
@Injectable()
export class ListMeasurementsUseCase {
  constructor(
    @Inject(MEASUREMENT_REPOSITORY) private readonly measurements: MeasurementRepository,
  ) {}

  async execute(query: ListMeasurementsQuery): Promise<CursorPage<MeasurementView>> {
    const page = await this.measurements.list({
      userId: query.userId,
      cursor: query.cursor,
      limit: clampLimit(query.limit),
    });

    return {
      items: page.items.map(toMeasurementView),
      nextCursor: page.nextCursor,
      previousCursor: null,
      hasNext: page.hasNext,
    };
  }
}

function clampLimit(requested?: number): number {
  if (requested === undefined || !Number.isFinite(requested) || requested < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(requested), MAX_LIMIT);
}
