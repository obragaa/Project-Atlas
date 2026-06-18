import { type Role } from "@atlas/contracts";
import { type Request } from "express";

/** The authenticated principal attached to a request by the auth guard. */
export interface RequestPrincipal {
  readonly id: string;
  readonly roles: readonly Role[];
}

export interface AuthenticatedRequest extends Request {
  principal?: RequestPrincipal;
}
