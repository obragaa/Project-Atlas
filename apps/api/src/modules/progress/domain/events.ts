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
  ) {
    this.occurredAt = new Date();
  }
}
