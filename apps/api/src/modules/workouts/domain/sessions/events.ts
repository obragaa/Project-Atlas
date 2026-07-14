import { type DomainEvent } from "../../../../shared/domain/domain-event.js";

/**
 * Emitted when a workout session is finalized (blueprint/13 "Eventos" — facts;
 * 09 Gamification). Unlike the retired template-level WorkoutCompleted, this
 * carries the civil day the workout was performed and the total volume done, so
 * gamification counts *sessions* (not distinct days) and future strength/volume
 * achievements have the data they need.
 */
export class WorkoutSessionCompleted implements DomainEvent {
  readonly name = "WorkoutSessionCompleted";
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    /** Civil day the workout was performed (AAAA-MM-DD, app timezone). */
    readonly performedOn: string,
    /** Sum of reps × load across completed sets (bodyweight sets contribute reps). */
    readonly totalVolume: number,
  ) {
    this.occurredAt = new Date();
  }
}
