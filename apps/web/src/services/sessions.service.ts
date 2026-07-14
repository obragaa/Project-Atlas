import {
  API_ROUTES,
  type CursorPage,
  type StartSessionRequest,
  type UpdateSessionRequest,
  type WorkoutSessionSummaryView,
  type WorkoutSessionView,
} from "@atlas/contracts";
import { apiRequest } from "./api-client";

/**
 * Typed Workout Sessions operations against the Atlas API (the `services` layer —
 * blueprint/11). A session is a *performed* workout (see ADR-0008); the access
 * token is attached automatically by the api-client.
 */
export const sessionsService = {
  /** History of performed workouts, newest first (cursor-paginated). */
  list(cursor?: string): Promise<CursorPage<WorkoutSessionSummaryView>> {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiRequest<CursorPage<WorkoutSessionSummaryView>>(
      `${API_ROUTES.sessions.collection}${query}`,
    );
  },

  get(id: string): Promise<WorkoutSessionView> {
    return apiRequest<WorkoutSessionView>(API_ROUTES.sessions.byId(id));
  },

  /** "Treinar agora": start a session from a template (defaults to today). */
  startFromWorkout(
    workoutId: string,
    request: StartSessionRequest = {},
  ): Promise<WorkoutSessionView> {
    return apiRequest<WorkoutSessionView>(API_ROUTES.workouts.sessions(workoutId), {
      method: "POST",
      body: request,
    });
  },

  update(id: string, request: UpdateSessionRequest): Promise<WorkoutSessionView> {
    return apiRequest<WorkoutSessionView>(API_ROUTES.sessions.byId(id), {
      method: "PUT",
      body: request,
    });
  },

  complete(id: string): Promise<WorkoutSessionView> {
    return apiRequest<WorkoutSessionView>(API_ROUTES.sessions.completion(id), { method: "POST" });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(API_ROUTES.sessions.byId(id), { method: "DELETE" });
  },
};
