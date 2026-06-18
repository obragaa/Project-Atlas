import { Inject, Injectable } from "@nestjs/common";
import { type AuthSession } from "@atlas/contracts";
import { AuthenticationError } from "../../../shared/domain/errors.js";
import {
  PASSWORD_HASHER,
  type PasswordHasher,
  TOKEN_SERVICE,
  type TokenService,
  USER_REPOSITORY,
  type UserRepository,
} from "../domain/ports.js";
import { Email } from "../domain/value-objects/email.js";
import { toAuthSession } from "./session.mapper.js";

export interface LoginUserCommand {
  readonly email: string;
  readonly password: string;
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
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(command: LoginUserCommand): Promise<AuthSession> {
    const email = Email.create(command.email);
    const user = await this.users.findByEmail(email);

    const hashToCheck = user?.passwordHash ?? LoginUserUseCase.DUMMY_HASH;
    const passwordValid = await this.hasher.verify(hashToCheck, command.password);

    if (!user || !passwordValid) {
      throw new AuthenticationError("E-mail ou senha inválidos.", "auth.invalid_credentials");
    }

    return toAuthSession(user, this.tokens);
  }
}
