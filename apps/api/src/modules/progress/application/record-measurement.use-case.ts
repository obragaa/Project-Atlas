import { Inject, Injectable } from "@nestjs/common";
import { type MeasurementView, type RecordMeasurementRequest } from "@atlas/contracts";
import {
  DOMAIN_EVENT_PUBLISHER,
  type DomainEventPublisher,
} from "../../../shared/domain/domain-event-publisher.js";
import {
  MEASUREMENT_REPOSITORY,
  type MeasurementRepository,
} from "../domain/measurement.repository.js";
import { MeasurementEntry } from "../domain/measurement-entry.js";
import { MeasurementDate } from "../domain/value-objects/measurement-date.js";
import { BodyMeasurements } from "../domain/value-objects/body-measurements.js";
import { toMeasurementView } from "./measurement.mapper.js";

export interface RecordMeasurementCommand {
  readonly userId: string;
  readonly request: RecordMeasurementRequest;
  /** Today's calendar date (injected by the controller for testability). */
  readonly today: Date;
}

/**
 * Records (or replaces) a measurement for a date (blueprint/07 "Progresso").
 * One snapshot per (user, date) — the repository UPSERTs on user+date. The use
 * case owns the rule; the controller only delegates.
 */
@Injectable()
export class RecordMeasurementUseCase {
  constructor(
    @Inject(MEASUREMENT_REPOSITORY) private readonly measurements: MeasurementRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: RecordMeasurementCommand): Promise<MeasurementView> {
    const { request } = command;
    const recordedOn = request.recordedOn
      ? MeasurementDate.create(request.recordedOn)
      : MeasurementDate.fromDate(command.today);

    const entry = MeasurementEntry.record({
      userId: command.userId,
      recordedOn,
      weightKg: request.weightKg ?? null,
      measurements: BodyMeasurements.create(request.measurements ?? {}),
      note: request.note ?? null,
    });

    await this.measurements.save(entry);
    await this.events.publishFor(entry);

    return toMeasurementView(entry);
  }
}
