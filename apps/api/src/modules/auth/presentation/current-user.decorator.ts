import { type ExecutionContext, createParamDecorator } from "@nestjs/common";
import { type AuthenticatedRequest, type RequestPrincipal } from "./authenticated-request.js";

/**
 * Injects the authenticated principal into a handler parameter. Available only
 * on guarded routes (the guard populates `request.principal`).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestPrincipal => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.principal) {
      throw new Error("CurrentUser used on an unguarded route.");
    }
    return request.principal;
  },
);
