import { type DomainEvent } from "../../../shared/domain/domain-event.js";

/** Emitted when a new account is created (blueprint/12 & 13 Domain Events). */
export class UserRegistered implements DomainEvent {
  readonly name = "UserRegistered";
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly email: string,
  ) {
    this.occurredAt = new Date();
  }
}
