import { type ProblemDetails } from "@atlas/contracts";

/**
 * Thin, typed API client (the `services` layer — blueprint/11). It speaks the
 * shared contract, attaches the access token when present, and turns RFC 7807
 * responses into a typed `ApiError` so the UI can render user-safe messages
 * (blueprint/01, 02: never show raw technical errors).
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

export class ApiError extends Error {
  constructor(readonly problem: ProblemDetails) {
    super(problem.detail);
    this.name = "ApiError";
  }
}

export interface RequestOptions {
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly body?: unknown;
  readonly accessToken?: string;
  readonly signal?: AbortSignal;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = "GET", body, accessToken, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(asProblem(payload, response.status));
  }

  return payload as TResponse;
}

function asProblem(payload: unknown, status: number): ProblemDetails {
  if (isProblem(payload)) {
    return payload;
  }
  return {
    type: "https://atlas.app/problems/unexpected",
    title: "Erro inesperado",
    status,
    detail: "Não foi possível concluir essa ação agora. Tente novamente em alguns instantes.",
    category: "unexpected",
    traceId: "unknown",
  };
}

function isProblem(value: unknown): value is ProblemDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    "detail" in value &&
    "status" in value
  );
}
