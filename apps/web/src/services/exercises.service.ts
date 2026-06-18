import {
  API_ROUTES,
  type CursorPage,
  type Equipment,
  type ExerciseSummaryView,
  type ExerciseView,
  type MuscleGroup,
} from "@atlas/contracts";
import { apiRequest } from "./api-client";

export interface ExerciseListParams {
  readonly search?: string;
  readonly muscle?: MuscleGroup;
  readonly equipment?: Equipment;
  readonly cursor?: string;
}

/**
 * Typed Exercises catalogue operations (the `services` layer — blueprint/11).
 * The access token is attached automatically by the api-client.
 */
export const exercisesService = {
  list(params: ExerciseListParams = {}): Promise<CursorPage<ExerciseSummaryView>> {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.muscle) qs.set("muscle", params.muscle);
    if (params.equipment) qs.set("equipment", params.equipment);
    if (params.cursor) qs.set("cursor", params.cursor);
    const query = qs.toString();
    return apiRequest<CursorPage<ExerciseSummaryView>>(
      `${API_ROUTES.exercises.collection}${query ? `?${query}` : ""}`,
    );
  },

  get(slug: string): Promise<ExerciseView> {
    return apiRequest<ExerciseView>(API_ROUTES.exercises.bySlug(slug));
  },
};
