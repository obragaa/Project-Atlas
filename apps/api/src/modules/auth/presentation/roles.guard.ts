import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type Role } from "@atlas/contracts";
import { AuthorizationError } from "../../../shared/domain/errors.js";
import { type AuthenticatedRequest } from "./authenticated-request.js";
import { ROLES_KEY } from "./roles.decorator.js";

/**
 * RBAC guard (blueprint/15). Runs after authentication; denies the request when
 * the principal lacks every required role. Routes with no `@Roles()` metadata
 * pass through (authentication alone suffices).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const principal = request.principal;
    if (!principal || !required.some((role) => principal.roles.includes(role))) {
      throw new AuthorizationError();
    }
    return true;
  }
}
