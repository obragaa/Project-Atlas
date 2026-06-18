import { Inject, Injectable } from "@nestjs/common";
import { type AuthSession } from "@atlas/contracts";
import { ConflictError } from "../../../shared/domain/errors.js";
import {
  PASSWORD_HASHER,
  type PasswordHasher,
  TOKEN_SERVICE,
  type TokenService,
  USER_REPOSITORY,
  type UserRepository,
} from "../domain/ports.js";
import { Email } from "../domain/value-objects/email.js";
import { RawPassword } from "../domain/value-objects/password.js";
import { User } from "../domain/user.js";
import { toAuthSession } from "./session.mapper.js";

export interface RegisterUserCommand {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
}

/**
 * Registers a new account and returns an authenticated session.
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
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
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

    return toAuthSession(user, this.tokens);
  }
}
