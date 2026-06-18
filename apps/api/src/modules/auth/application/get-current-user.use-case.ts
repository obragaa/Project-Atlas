import { Inject, Injectable } from "@nestjs/common";
import { type AuthenticatedUser } from "@atlas/contracts";
import { NotFoundError } from "../../../shared/domain/errors.js";
import { USER_REPOSITORY, type UserRepository } from "../domain/ports.js";
import { UserId } from "../domain/user-id.js";
import { toAuthenticatedUser } from "./session.mapper.js";

/** Returns the public view of the currently authenticated user. */
@Injectable()
export class GetCurrentUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(userId: string): Promise<AuthenticatedUser> {
    const user = await this.users.findById(UserId.create(userId));
    if (!user) {
      throw new NotFoundError("Usuário não encontrado.", "user.not_found");
    }
    return toAuthenticatedUser(user);
  }
}
