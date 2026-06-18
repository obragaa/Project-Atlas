import { Identifier } from "../../../shared/domain/identifier.js";

/** Opaque identity of a measurement entry (blueprint/13 "Chaves Primárias"). */
export class MeasurementId extends Identifier<"MeasurementId"> {
  static create(value: string): MeasurementId {
    return new MeasurementId(value);
  }

  static generate(): MeasurementId {
    return new MeasurementId(Identifier.newId());
  }
}
