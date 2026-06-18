import { type UserRepository } from "../domain/ports.js";
import { type User } from "../domain/user.js";
import { type UserId } from "../domain/user-id.js";
import { type Email } from "../domain/value-objects/email.js";

/**
 * In-memory `UserRepository` fake for UNIT tests of the application layer
 * (blueprint/18: use cases are tested in isolation, no infrastructure). The
 * production adapter is `PostgresUserRepository`; this exists only under test.
 */
export class FakeUserRepository implements UserRepository {
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
