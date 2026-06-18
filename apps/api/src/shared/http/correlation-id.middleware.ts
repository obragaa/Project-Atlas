import { Injectable, type NestMiddleware } from "@nestjs/common";
import { type NextFunction, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Assigns a correlation id to every request and echoes it on the response
 * (blueprint/14 - API.md "Correlation ID", 21 - Observability.md). The id flows
 * through logs and traces so a request can be reconstructed end to end. An
 * inbound id is honored if present; otherwise one is generated.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[CORRELATION_ID_HEADER];
    const correlationId = typeof incoming === "string" && incoming.length > 0 ? incoming : uuidv4();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}

/** Reads the correlation id assigned by the middleware. */
export function getCorrelationId(req: Request): string {
  const value = req.headers[CORRELATION_ID_HEADER];
  return typeof value === "string" ? value : "unknown";
}
