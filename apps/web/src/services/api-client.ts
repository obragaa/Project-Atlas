import { type ProblemDetails } from "@atlas/contracts";

/**
 * Thin, typed API client (the `services` layer — blueprint/11). It speaks the
 * shared contract, attaches the current access token (provided by the auth
 * context), transparently refreshes once on a 401, and turns RFC 7807 responses
 * into a typed `ApiError` so the UI can render user-safe messages (blueprint/01,
 * 02: never show raw technical errors).
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

export class ApiError extends Error {
  constructor(readonly problem: ProblemDetails) {
    super(problem.detail);
    this.name = "ApiError";
  }
}

/** Bridges the client to the session, set once by the AuthProvider. */
export interface TokenProvider {
  getAccessToken: () => string | null;
  /** Attempts to refresh; returns the new access token or null on failure. */
  refresh: () => Promise<string | null>;
}

let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

export interface RequestOptions {
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly body?: unknown;
  /** Overrides the ambient token (rarely needed; the provider is the default). */
  readonly accessToken?: string;
  readonly signal?: AbortSignal;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const token = options.accessToken ?? tokenProvider?.getAccessToken() ?? undefined;
  const first = await rawRequest(path, options, token);

  // Transparent single refresh-and-retry on an expired/invalid token.
  if (first.status === 401 && options.accessToken === undefined && tokenProvider) {
    const refreshed = await tokenProvider.refresh();
    if (refreshed) {
      const retry = await rawRequest(path, options, refreshed);
      return handle<TResponse>(retry);
    }
  }

  return handle<TResponse>(first);
}

async function rawRequest(
  path: string,
  options: RequestOptions,
  token: string | undefined,
): Promise<Response> {
  const { method = "GET", body, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
}

async function handle<TResponse>(response: Response): Promise<TResponse> {
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
