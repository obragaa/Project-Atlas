import { Module } from "@nestjs/common";
import { MEASUREMENT_REPOSITORY } from "./domain/measurement.repository.js";
import { PostgresMeasurementRepository } from "./infrastructure/postgres-measurement.repository.js";
import { RecordMeasurementUseCase } from "./application/record-measurement.use-case.js";
import { ListMeasurementsUseCase } from "./application/list-measurements.use-case.js";
import { DeleteMeasurementUseCase } from "./application/delete-measurement.use-case.js";
import { GetProgressSummaryUseCase } from "./application/get-progress-summary.use-case.js";
import { ProgressController } from "./presentation/progress.controller.js";

/**
 * Progress module composition (blueprint/12). Binds the domain port to its
 * Postgres adapter and registers the use cases. The Drizzle handle, the
 * domain-event publisher, and the global auth guard come from global modules.
 */
@Module({
  controllers: [ProgressController],
  providers: [
    RecordMeasurementUseCase,
    ListMeasurementsUseCase,
    DeleteMeasurementUseCase,
    GetProgressSummaryUseCase,
    { provide: MEASUREMENT_REPOSITORY, useClass: PostgresMeasurementRepository },
  ],
})
export class ProgressModule {}
