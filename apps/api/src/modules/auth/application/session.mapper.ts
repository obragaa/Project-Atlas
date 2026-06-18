import { type AuthenticatedUser } from "@atlas/contracts";
import { type User } from "../domain/user.js";

/**
 * Pure transport mapping. The orchestration of session creation and token
 * issuance lives in `SessionFactory`, not here (single responsibility — a mapper
 * stays a mapper, blueprint/12).
 */
export function toAuthenticatedUser(user: User): AuthenticatedUser {
  return {
    id: user.id.toString(),
    email: user.email.value,
    displayName: user.displayName,
    roles: [...user.roles],
  };
}
