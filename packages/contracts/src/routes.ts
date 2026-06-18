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
  workouts: {
    /** Collection: POST creates, GET lists (cursor-paginated). */
    collection: "/v1/workouts",
    /** Item: GET / PUT / DELETE a single workout by id. */
    byId: (id: string) => `/v1/workouts/${id}`,
    /** Mark a workout completed (emits WorkoutCompleted). */
    completion: (id: string) => `/v1/workouts/${id}/completion`,
    /** Duplicate a workout into a fresh draft. */
    duplication: (id: string) => `/v1/workouts/${id}/duplication`,
  },
  exercises: {
    /** Collection: GET lists/searches the catalogue (cursor-paginated). */
    collection: "/v1/exercises",
    /** Item: GET a single exercise by its stable slug. */
    bySlug: (slug: string) => `/v1/exercises/${slug}`,
  },
  progress: {
    /** Collection: POST records a measurement, GET lists history (cursor). */
    measurements: "/v1/progress/measurements",
    /** Item: DELETE a measurement by id. */
    measurementById: (id: string) => `/v1/progress/measurements/${id}`,
    /** Derived records, stats, and the weight chart series. */
    summary: "/v1/progress/summary",
  },
  gamification: {
    /** Combined streak + missions + achievements snapshot. */
    overview: "/v1/gamification/overview",
  },
} as const;
