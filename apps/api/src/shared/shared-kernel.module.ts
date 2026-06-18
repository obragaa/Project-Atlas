import { Global, Inject, Module, type OnModuleInit } from "@nestjs/common";
import { DOMAIN_EVENT_PUBLISHER } from "./domain/domain-event-publisher.js";
import { InProcessEventDispatcher } from "./events/in-process-event-dispatcher.js";
import { AUDIT_LOGGER, type AuditLogger } from "./audit/audit-logger.port.js";
import { PinoAuditLogger } from "./audit/pino-audit-logger.js";
import { UserRegistered } from "../modules/auth/domain/events.js";
import { WorkoutCompleted } from "../modules/workouts/domain/events.js";
import { MeasurementRecorded } from "../modules/progress/domain/events.js";

/**
 * Shared kernel infrastructure (blueprint/12). Owns the cross-cutting, framework-
 * bound primitives every domain module reuses: the in-process domain-event
 * dispatcher and the audit channel. Global so modules inject the ports
 * (`DOMAIN_EVENT_PUBLISHER`, `AUDIT_LOGGER`) without importing this module.
 *
 * Audit handlers for shared facts (e.g. `UserRegistered`) are registered here so
 * the dispatch wiring lives in one place; the use cases that emit them stay
 * unaware of the audit sink (Dependency Rule).
 */
@Global()
@Module({
  providers: [
    InProcessEventDispatcher,
    { provide: DOMAIN_EVENT_PUBLISHER, useExisting: InProcessEventDispatcher },
    PinoAuditLogger,
    { provide: AUDIT_LOGGER, useExisting: PinoAuditLogger },
  ],
  exports: [DOMAIN_EVENT_PUBLISHER, AUDIT_LOGGER],
})
export class SharedKernelModule implements OnModuleInit {
  constructor(
    private readonly dispatcher: InProcessEventDispatcher,
    @Inject(AUDIT_LOGGER) private readonly audit: AuditLogger,
  ) {}

  onModuleInit(): void {
    // A new account is an auditable fact (blueprint/15 "Audit Trail").
    this.dispatcher.on<UserRegistered>(UserRegistered.name, (event) => {
      this.audit.record({
        action: "auth.register",
        outcome: "success",
        userId: event.aggregateId,
      });
    });

    // Completing a workout is an auditable fact (blueprint/13 "Auditoria":
    // "Conclusão de treino").
    this.dispatcher.on<WorkoutCompleted>(WorkoutCompleted.name, (event) => {
      this.audit.record({
        action: "workout.completed",
        outcome: "success",
        userId: event.userId,
      });
    });

    // Recording a measurement is an auditable progress fact (blueprint/13).
    this.dispatcher.on<MeasurementRecorded>(MeasurementRecorded.name, (event) => {
      this.audit.record({
        action: "progress.measurement_recorded",
        outcome: "success",
        userId: event.userId,
      });
    });
  }
}
