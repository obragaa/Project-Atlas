import { SetMetadata } from "@nestjs/common";
import { type Role } from "@atlas/contracts";

export const ROLES_KEY = "atlas:roles";

/**
 * Restricts a route to principals holding at least one of the given roles
 * (blueprint/15 RBAC). Authorization is enforced server-side only — never in
 * the frontend (doc 15 anti-pattern: "Authorization no Frontend").
 */
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
