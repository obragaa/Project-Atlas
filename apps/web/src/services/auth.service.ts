import {
  API_ROUTES,
  type AuthSession,
  type LoginRequest,
  type RegisterRequest,
} from "@atlas/contracts";
import { apiRequest } from "./api-client";

/** Typed auth operations against the Atlas API (contract-driven). */
export const authService = {
  register(request: RegisterRequest): Promise<AuthSession> {
    return apiRequest<AuthSession>(API_ROUTES.auth.register, {
      method: "POST",
      body: request,
    });
  },

  login(request: LoginRequest): Promise<AuthSession> {
    return apiRequest<AuthSession>(API_ROUTES.auth.login, {
      method: "POST",
      body: request,
    });
  },
};
