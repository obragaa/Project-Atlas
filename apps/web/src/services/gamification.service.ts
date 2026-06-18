import { API_ROUTES, type GamificationOverview } from "@atlas/contracts";
import { apiRequest } from "./api-client";

/**
 * Typed Gamification operations (the `services` layer — blueprint/11). The
 * access token is attached automatically by the api-client.
 */
export const gamificationService = {
  overview(): Promise<GamificationOverview> {
    return apiRequest<GamificationOverview>(API_ROUTES.gamification.overview);
  },
};
