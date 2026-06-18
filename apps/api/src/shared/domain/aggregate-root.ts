import { Entity } from "./entity.js";
import { type DomainEvent } from "./domain-event.js";
import { type Identifier } from "./identifier.js";

/**
 * Aggregate Root — the consistency boundary for a cluster of entities
 * (blueprint/13 - Database.md "Aggregate Roots"). It is the only object other
 * modules reference, and it accumulates domain events to be dispatched after
 * the transaction commits.
 */
export abstract class AggregateRoot<TId extends Identifier<string>> extends Entity<TId> {
  private readonly _domainEvents: DomainEvent[] = [];

  get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /** Clears recorded events; called by infrastructure after dispatch. */
  pullDomainEvents(): readonly DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
