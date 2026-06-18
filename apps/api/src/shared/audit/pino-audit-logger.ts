import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, type PinoLogger } from "nestjs-pino";
import { type AuditEvent, type AuditLogger } from "./audit-logger.port.js";

/**
 * Audit logger backed by a dedicated structured-log channel (blueprint/21:
 * audit events are a distinct retention category, not technical logs). Every
 * entry is tagged `channel: "audit"` so it can be routed to immutable storage
 * with its own retention, separate from operational logs. It inherits the
 * request's correlationId from the pino context, satisfying traceability
 * (blueprint/15 "rastreabilidade"). It never throws into the caller.
 */
@Injectable()
export class PinoAuditLogger implements AuditLogger {
  constructor(@InjectPinoLogger("audit") private readonly logger: PinoLogger) {}

  record(event: AuditEvent): void {
    try {
      this.logger.info(
        {
          channel: "audit",
          audit: {
            action: event.action,
            outcome: event.outcome,
            userId: event.userId,
            sessionId: event.sessionId,
            familyId: event.familyId,
            deviceId: event.deviceId,
            reason: event.reason,
          },
        },
        `audit:${event.action}:${event.outcome}`,
      );
    } catch {
      // Auditing must never break the request it records; a dropped entry is
      // preferable to a failed login. (The durable store, when added, will own
      // delivery guarantees — tracked exception.)
    }
  }
}
