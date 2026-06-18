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
 * blueprint/11). The access token is attached automatically by the api-client.
 */
export const workoutsService = {
  list(cursor?: string): Promise<CursorPage<WorkoutSummaryView>> {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiRequest<CursorPage<WorkoutSummaryView>>(`${API_ROUTES.workouts.collection}${query}`);
  },

  get(id: string): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.byId(id));
  },

  create(request: CreateWorkoutRequest): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.collection, {
      method: "POST",
      body: request,
    });
  },

  update(id: string, request: UpdateWorkoutRequest): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.byId(id), {
      method: "PUT",
      body: request,
    });
  },

  complete(id: string): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.completion(id), { method: "POST" });
  },

  duplicate(id: string): Promise<WorkoutView> {
    return apiRequest<WorkoutView>(API_ROUTES.workouts.duplication(id), { method: "POST" });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(API_ROUTES.workouts.byId(id), { method: "DELETE" });
  },
};
