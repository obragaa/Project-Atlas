import { Inject, Injectable } from "@nestjs/common";
import { type AuthSession } from "@atlas/contracts";
import { ConflictError } from "../../../shared/domain/errors.js";
import {
  DOMAIN_EVENT_PUBLISHER,
  type DomainEventPublisher,
} from "../../../shared/domain/domain-event-publisher.js";
import {
  PASSWORD_HASHER,
  type PasswordHasher,
  USER_REPOSITORY,
  type UserRepository,
} from "../domain/ports.js";
import { Email } from "../domain/value-objects/email.js";
import { RawPassword } from "../domain/value-objects/password.js";
import { User } from "../domain/user.js";
import { SessionFactory, type SessionContext } from "./session.factory.js";

export interface RegisterUserCommand {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
  readonly session: SessionContext;
}

/**
 * Registers a new account and opens a tracked session.
 *
 * Business rules (blueprint/15): email must be unique (conflict otherwise);
 * password must satisfy policy; password is stored only as a hash; a new user
 * receives least privilege. The use case owns the rule — controllers never do
 * (blueprint/12 "Casos de Uso").
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    private readonly sessionFactory: SessionFactory,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthSession> {
    const email = Email.create(command.email);
    const password = RawPassword.create(command.password);

    if (await this.users.existsByEmail(email)) {
      throw new ConflictError("Este e-mail já está em uso.", "auth.email_taken");
    }

    const passwordHash = await this.hasher.hash(password.reveal());
    const user = User.register({
      email,
      passwordHash,
      displayName: command.displayName,
    });

    await this.users.save(user);

    // The account is persisted; now its facts (UserRegistered -> audit) fire.
    await this.events.publishFor(user);

    return this.sessionFactory.openSession(user, command.session);
  }
}
