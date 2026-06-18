import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, type PinoLogger } from "nestjs-pino";
import { type AggregateRoot } from "../domain/aggregate-root.js";
import { type DomainEvent } from "../domain/domain-event.js";
import {
  type DomainEventHandler,
  type DomainEventPublisher,
} from "../domain/domain-event-publisher.js";
import { type Identifier } from "../domain/identifier.js";

/**
 * In-process synchronous event dispatcher (blueprint/12 & 13). Handlers register
 * by event name and run after the aggregate has been persisted. A handler is a
 * side effect, never part of the business transaction: a thrown handler is
 * isolated and logged at WARN so audit/notification failures never roll back a
 * successful login or registration. Replacing this with a durable transactional
 * outbox is a tracked exception (docs/architecture.md).
 */
@Injectable()
export class InProcessEventDispatcher implements DomainEventPublisher {
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  constructor(
    @InjectPinoLogger(InProcessEventDispatcher.name) private readonly logger: PinoLogger,
  ) {}

  /** Register a side effect for every event with the given name. */
  on<TEvent extends DomainEvent>(eventName: string, handler: DomainEventHandler<TEvent>): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler as DomainEventHandler);
    this.handlers.set(eventName, existing);
  }

  async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      const handlers = this.handlers.get(event.name) ?? [];
      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (error) {
          // A side effect must never break the business flow (fail-open here is
          // correct: the fact already happened and was persisted).
          this.logger.warn(
            { event: event.name, aggregateId: event.aggregateId, err: error },
            "domain event handler failed",
          );
        }
      }
    }
  }

  async publishFor(aggregate: AggregateRoot<Identifier<string>>): Promise<void> {
    await this.publish(aggregate.pullDomainEvents());
  }
}
