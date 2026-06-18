import { Injectable } from "@nestjs/common";
import { type UserRepository } from "../domain/ports.js";
import { type User } from "../domain/user.js";
import { type UserId } from "../domain/user-id.js";
import { type Email } from "../domain/value-objects/email.js";

/**
 * In-memory `UserRepository` adapter.
 *
 * TEMPORARY (tracked exception — blueprint/23 Governance): the Blueprint
 * mandates PostgreSQL (ADR-0001). Because the Domain and Application layers
 * depend only on the `UserRepository` port, swapping this for a Drizzle/Postgres
 * adapter is a pure Infrastructure change with no impact on business rules
 * (blueprint/12 Dependency Rule). This keeps the phase runnable end to end.
 *
 * Owner: backend. Removal condition: when the persistence layer (doc 13) lands.
 */
@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();
  private readonly idByEmail = new Map<string, string>();

  findById(id: UserId): Promise<User | null> {
    return Promise.resolve(this.byId.get(id.toString()) ?? null);
  }

  findByEmail(email: Email): Promise<User | null> {
    const id = this.idByEmail.get(email.value);
    return Promise.resolve(id ? (this.byId.get(id) ?? null) : null);
  }

  existsByEmail(email: Email): Promise<boolean> {
    return Promise.resolve(this.idByEmail.has(email.value));
  }

  save(user: User): Promise<void> {
    this.byId.set(user.id.toString(), user);
    this.idByEmail.set(user.email.value, user.id.toString());
    return Promise.resolve();
  }
}
