/**
 * API route constants. A single source so producer (api) and consumer (web)
 * never drift. Versioned under `/v1` per blueprint/14 - API.md "Versionamento".
 */
export const API_VERSION = "v1" as const;

export const API_ROUTES = {
  health: {
    liveness: "/health/live",
    readiness: "/health/ready",
  },
  auth: {
    register: "/v1/auth/register",
    login: "/v1/auth/login",
    refresh: "/v1/auth/refresh",
    logout: "/v1/auth/logout",
    me: "/v1/auth/me",
  },
  core: {
    summary: "/v1/core/summary",
  },
} as const;
