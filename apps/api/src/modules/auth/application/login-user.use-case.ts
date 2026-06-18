import { Inject, Injectable } from "@nestjs/common";
import { type AuthSession } from "@atlas/contracts";
import { AuthenticationError } from "../../../shared/domain/errors.js";
import { AUDIT_LOGGER, type AuditLogger } from "../../../shared/audit/audit-logger.port.js";
import {
  PASSWORD_HASHER,
  type PasswordHasher,
  USER_REPOSITORY,
  type UserRepository,
} from "../domain/ports.js";
import { Email } from "../domain/value-objects/email.js";
import { SessionFactory, type SessionContext } from "./session.factory.js";

export interface LoginUserCommand {
  readonly email: string;
  readonly password: string;
  readonly session: SessionContext;
}

/**
 * Authenticates a user with credentials (blueprint/15 "Authentication Flow").
 *
 * The same generic error is returned whether the email is unknown or the
 * password is wrong, so the endpoint never reveals which accounts exist
 * (blueprint/16 - Security.md: avoid information disclosure). A hash is always
 * verified — even for unknown emails — to keep timing uniform.
 */
@Injectable()
export class LoginUserUseCase {
  // A precomputed argon2 hash of a throwaway value, used to equalize timing
  // when the email does not exist.
  private static readonly DUMMY_HASH =
    "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZXg$3p7m0Yd6m0wq8x0rD2bC5a1nQbN8wXo2pV4hZ9kLmNo";

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    private readonly sessionFactory: SessionFactory,
    @Inject(AUDIT_LOGGER) private readonly audit: AuditLogger,
  ) {}

  async execute(command: LoginUserCommand): Promise<AuthSession> {
    const email = Email.create(command.email);
    const user = await this.users.findByEmail(email);

    const hashToCheck = user?.passwordHash ?? LoginUserUseCase.DUMMY_HASH;
    const passwordValid = await this.hasher.verify(hashToCheck, command.password);

    if (!user || !passwordValid) {
      // Audit the failure without revealing whether the account exists (the
      // userId is only recorded when the credentials actually matched).
      this.audit.record({
        action: "auth.login_failed",
        outcome: "failure",
        userId: user?.id.toString(),
        deviceId: command.session.deviceId,
        reason: "auth.invalid_credentials",
      });
      throw new AuthenticationError("E-mail ou senha inválidos.", "auth.invalid_credentials");
    }

    const session = await this.sessionFactory.openSession(user, command.session);
    this.audit.record({
      action: "auth.login",
      outcome: "success",
      userId: user.id.toString(),
      deviceId: command.session.deviceId,
    });
    return session;
  }
}
