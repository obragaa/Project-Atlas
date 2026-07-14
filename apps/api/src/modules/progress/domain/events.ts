import { type DomainEvent } from "../../../shared/domain/domain-event.js";

/**
 * Emitted when a user records (or updates) a measurement (blueprint/13 "Eventos"
 * — facts). Audited; future Missions/streaks can consume it.
 */
export class MeasurementRecorded implements DomainEvent {
  readonly name = "MeasurementRecorded";
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    /** Civil day the measurement is for (AAAA-MM-DD) — the day it counts toward. */
    readonly recordedOn: string,
  ) {
    this.occurredAt = new Date();
  }
}
