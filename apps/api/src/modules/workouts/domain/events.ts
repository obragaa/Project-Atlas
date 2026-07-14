import { type DomainEvent } from "../../../shared/domain/domain-event.js";

/** Emitted when a workout template is created (blueprint/13 "Eventos" — facts). */
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

// WorkoutCompleted was retired in ADR-0008: "completing" a workout is now
// recording a WorkoutSession (see domain/sessions/events.ts), which carries the
// day performed and the volume done. The template itself has no completion.
