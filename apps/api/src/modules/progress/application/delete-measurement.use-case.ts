import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/domain/errors.js";
import {
  MEASUREMENT_REPOSITORY,
  type MeasurementRepository,
} from "../domain/measurement.repository.js";
import { MeasurementId } from "../domain/measurement-id.js";

export interface DeleteMeasurementCommand {
  readonly userId: string;
  readonly measurementId: string;
}

/**
 * Deletes a measurement the caller owns (blueprint/07). A missing or foreign
 * entry yields the same not-found (no enumeration — doc 15/16).
 */
@Injectable()
export class DeleteMeasurementUseCase {
  constructor(
    @Inject(MEASUREMENT_REPOSITORY) private readonly measurements: MeasurementRepository,
  ) {}

  async execute(command: DeleteMeasurementCommand): Promise<void> {
    const id = parseId(command.measurementId);
    const entry = id ? await this.measurements.findById(id) : null;
    if (!entry || !entry.isOwnedBy(command.userId)) {
      throw new NotFoundError("Registro não encontrado.", "progress.not_found");
    }
    await this.measurements.delete(entry.id);
  }
}

function parseId(raw: string): MeasurementId | null {
  try {
    return MeasurementId.create(raw);
  } catch {
    return null;
  }
}
