import { type AggregateRoot } from "./aggregate-root.js";
import { type DomainEvent } from "./domain-event.js";
import { type Identifier } from "./identifier.js";

/**
 * Publishes domain events after the work that produced them has been persisted
 * (blueprint/12 & 13: "events are dispatched after the transaction commits").
 * The Application layer depends on this port; the concrete dispatcher lives in
 * the shared kernel's infrastructure side. Handlers are invoked in-process for
 * now (a durable outbox is a tracked exception — see docs/architecture.md).
 */
export const DOMAIN_EVENT_PUBLISHER = Symbol("DOMAIN_EVENT_PUBLISHER");

/** A side effect to run when an event of a given name is published. */
export type DomainEventHandler<TEvent extends DomainEvent = DomainEvent> = (
  event: TEvent,
) => void | Promise<void>;

export interface DomainEventPublisher {
  /** Publish a batch of already-recorded events (e.g. pulled from an aggregate). */
  publish(events: readonly DomainEvent[]): Promise<void>;
  /**
   * Pull every recorded event off an aggregate and publish it. The aggregate is
   * left with an empty event buffer, so a re-save never double-dispatches.
   */
  publishFor(aggregate: AggregateRoot<Identifier<string>>): Promise<void>;
}
