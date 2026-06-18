import {
  API_ROUTES,
  type CursorPage,
  type MeasurementView,
  type ProgressSummary,
  type RecordMeasurementRequest,
} from "@atlas/contracts";
import { apiRequest } from "./api-client";

/**
 * Typed Progress operations (the `services` layer — blueprint/11). The access
 * token is attached automatically by the api-client.
 */
export const progressService = {
  history(cursor?: string): Promise<CursorPage<MeasurementView>> {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiRequest<CursorPage<MeasurementView>>(`${API_ROUTES.progress.measurements}${query}`);
  },

  record(request: RecordMeasurementRequest): Promise<MeasurementView> {
    return apiRequest<MeasurementView>(API_ROUTES.progress.measurements, {
      method: "POST",
      body: request,
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(API_ROUTES.progress.measurementById(id), { method: "DELETE" });
  },

  summary(): Promise<ProgressSummary> {
    return apiRequest<ProgressSummary>(API_ROUTES.progress.summary);
  },
};
