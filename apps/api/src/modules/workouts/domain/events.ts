import { type DomainEvent } from "../../../shared/domain/domain-event.js";

/** Emitted when a workout is created (blueprint/13 "Eventos" — facts). */
export class WorkoutCreated implements DomainEvent {
  readonly name = "WorkoutCreated";
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
  ) {
    this.occurredAt = new Date();
  }
}

/**
 * Emitted when a workout is marked completed (blueprint/13 "WorkoutCompleted").
 * Consumed later by Streak/Core; today it is recorded on the audit channel.
 */
export class WorkoutCompleted implements DomainEvent {
  readonly name = "WorkoutCompleted";
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
  ) {
    this.occurredAt = new Date();
  }
}
