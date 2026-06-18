import { type Role } from "@atlas/contracts";
import { type UserInsert, type UserRow } from "../../../../shared/database/schema/index.js";
import { User } from "../../domain/user.js";
import { UserId } from "../../domain/user-id.js";
import { Email } from "../../domain/value-objects/email.js";

/**
 * Translates between the `users` row and the `User` aggregate. The only place
 * that knows column names; Drizzle/row types never escape Infrastructure
 * (blueprint/12). `toDomain` rehydrates via `User.restore` (no events emitted).
 */
export const userMapper = {
  toDomain(row: UserRow): User {
    return User.restore(UserId.create(row.id), {
      email: Email.create(row.email),
      passwordHash: row.passwordHash,
      displayName: row.displayName,
      roles: [...row.roles] as Role[],
      createdAt: row.createdAt,
    });
  },

  toPersistence(user: User): UserInsert {
    return {
      id: user.id.toString(),
      email: user.email.value,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      roles: [...user.roles],
      createdAt: user.createdAt,
    };
  },
};
