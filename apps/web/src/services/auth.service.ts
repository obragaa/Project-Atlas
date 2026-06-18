import {
  API_ROUTES,
  type AuthenticatedUser,
  type AuthSession,
  type LoginRequest,
  type RegisterRequest,
  type TokenPair,
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

  me(accessToken: string): Promise<AuthenticatedUser> {
    return apiRequest<AuthenticatedUser>(API_ROUTES.auth.me, { accessToken });
  },

  refresh(refreshToken: string): Promise<TokenPair> {
    return apiRequest<TokenPair>(API_ROUTES.auth.refresh, {
      method: "POST",
      body: { refreshToken },
    });
  },

  logout(refreshToken: string): Promise<void> {
    return apiRequest<void>(API_ROUTES.auth.logout, {
      method: "POST",
      body: { refreshToken },
    });
  },
};
