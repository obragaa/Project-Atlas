import {
  API_ROUTES,
  type CreateWorkoutRequest,
  type CursorPage,
  type UpdateWorkoutRequest,
  type WorkoutSummaryView,
  type WorkoutView,
} from "@atlas/contracts";
import { apiRequest } from "./api-client";

/**
 * Typed Workouts operations against the Atlas API (the `services` layer —
 * blueprint/11). Every call speaks the shared contract and carries the access
 * token; the UI never builds URLs or shapes by hand.
 */
export const workoutsService = {
  list(accessToken: string, cursor?: string): Promise<CursorPage<WorkoutSummaryView>> {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiRequest<CursorPage<WorkoutSummaryView>>(`${API_ROUTES.workouts.collection}${query}`, {
      accessToken,
    });
  },

  get(accessToken: string, id: string): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.byId(id), { accessToken });
  },

  create(accessToken: string, request: CreateWorkoutRequest): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.collection, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  update(accessToken: string, id: string, request: UpdateWorkoutRequest): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.byId(id), {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  complete(accessToken: string, id: string): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.completion(id), {
      method: "POST",
      accessToken,
    });
  },

  duplicate(accessToken: string, id: string): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.duplication(id), {
      method: "POST",
      accessToken,
    });
  },

  remove(accessToken: string, id: string): Promise<void> {
    return apiRequest<void>(API_ROUTES.workouts.byId(id), {
      method: "DELETE",
      accessToken,
    });
  },
};
