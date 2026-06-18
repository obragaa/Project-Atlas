import { Inject, Injectable } from "@nestjs/common";
import { type TokenPair } from "@atlas/contracts";
import { AuthenticationError } from "../../../shared/domain/errors.js";
import {
  TOKEN_SERVICE,
  type TokenService,
  USER_REPOSITORY,
  type UserRepository,
} from "../domain/ports.js";
import { UserId } from "../domain/user-id.js";
import { issueTokens } from "./session.mapper.js";

export interface RefreshSessionCommand {
  readonly refreshToken: string;
}

/**
 * Rotates a refresh token and issues a fresh token pair (blueprint/15 "Token
 * Rotation"). A future persistent-session adapter will additionally revoke the
 * presented token to prevent reuse (doc 15 anti-pattern: reusable refresh
 * tokens). Issuing a new refresh token here already supersedes the old one.
 */
@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(command: RefreshSessionCommand): Promise<TokenPair> {
    let subject: string;
    try {
      const payload = await this.tokens.verifyRefreshToken(command.refreshToken);
      subject = payload.sub;
    } catch {
      throw new AuthenticationError("Sessão inválida ou expirada.", "auth.invalid_refresh");
    }

    const user = await this.users.findById(UserId.create(subject));
    if (!user) {
      throw new AuthenticationError("Sessão inválida ou expirada.", "auth.invalid_refresh");
    }

    return issueTokens(user, this.tokens);
  }
}
