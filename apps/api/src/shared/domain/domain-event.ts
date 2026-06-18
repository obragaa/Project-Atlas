/**
 * Domain events represent facts that have happened (blueprint/12 & 13:
 * "Eventos representam fatos. Nunca comandos."). They decouple modules.
 */
export interface DomainEvent {
  /** Stable event name, e.g. "UserRegistered", "WorkoutCompleted". */
  readonly name: string;
  /** When the fact occurred. */
  readonly occurredAt: Date;
  /** Identifier of the aggregate that emitted the event. */
  readonly aggregateId: string;
}
