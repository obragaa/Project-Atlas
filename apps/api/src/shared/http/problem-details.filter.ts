import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import { type ProblemDetails, type ErrorCategory } from "@atlas/contracts";
import { type Request, type Response } from "express";
import { DomainError, ValidationError } from "../domain/errors.js";
import { getCorrelationId } from "./correlation-id.middleware.js";

const TYPE_BASE = "https://atlas.app/problems";

/** Maps an error category to its HTTP status. Exhaustive switch — index-safe. */
function statusForCategory(category: ErrorCategory): number {
  switch (category) {
    case "validation":
      return 422;
    case "authentication":
      return 401;
    case "authorization":
      return 403;
    case "business_rule":
    case "conflict":
      return 409;
    case "not_found":
      return 404;
    case "rate_limit":
      return 429;
    case "infrastructure":
      return 503;
    case "unexpected":
      return 500;
  }
}

/** Maps an error category to a stable, user-safe title. */
function titleForCategory(category: ErrorCategory): string {
  switch (category) {
    case "validation":
      return "Validation Failed";
    case "authentication":
      return "Authentication Required";
    case "authorization":
      return "Forbidden";
    case "business_rule":
      return "Business Rule Violation";
    case "conflict":
      return "Conflict";
    case "not_found":
      return "Not Found";
    case "rate_limit":
      return "Too Many Requests";
    case "infrastructure":
      return "Service Unavailable";
    case "unexpected":
      return "Internal Server Error";
  }
}

/**
 * Global exception filter — the single place that turns any thrown error into
 * an RFC 7807 response (blueprint/14 - API.md ADR-003). It maps domain errors
 * by category, preserves HttpExceptions, and renders everything else as a
 * generic 500 WITHOUT leaking internals (blueprint/16 - Security.md "Error
 * Handling": never expose stack traces, SQL, framework, or paths).
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = getCorrelationId(request);

    const problem = this.toProblem(exception, request, traceId);

    if (problem.status >= 500) {
      // Full detail stays in internal logs only.
      this.logger.error(
        { traceId, err: exception, path: request.url },
        "Unhandled error producing 5xx response",
      );
    }

    response
      .status(problem.status)
      .setHeader("Content-Type", "application/problem+json")
      .json(problem);
  }

  private toProblem(exception: unknown, request: Request, traceId: string): ProblemDetails {
    const instance = request.url;

    if (exception instanceof DomainError) {
      return {
        type: `${TYPE_BASE}/${exception.code}`,
        title: titleForCategory(exception.category),
        status: statusForCategory(exception.category),
        detail: exception.message,
        instance,
        category: exception.category,
        traceId,
        ...(exception instanceof ValidationError ? { issues: exception.issues } : {}),
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const category = categoryForStatus(status);
      return {
        type: `${TYPE_BASE}/http_${status}`,
        title: exception.name,
        status,
        detail: exception.message,
        instance,
        category,
        traceId,
      };
    }

    return {
      type: `${TYPE_BASE}/unexpected`,
      title: "Internal Server Error",
      status: 500,
      detail: "Não foi possível concluir essa ação agora. Tente novamente em alguns instantes.",
      instance,
      category: "unexpected",
      traceId,
    };
  }
}

/** Maps an arbitrary HTTP status to the closest error category. */
function categoryForStatus(status: number): ErrorCategory {
  switch (status) {
    case 401:
      return "authentication";
    case 403:
      return "authorization";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "validation";
    case 429:
      return "rate_limit";
    default:
      return status >= 500 ? "infrastructure" : "validation";
  }
}
