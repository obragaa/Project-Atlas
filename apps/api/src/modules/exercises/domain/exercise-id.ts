import { Identifier } from "../../../shared/domain/identifier.js";

/** Opaque identity of a catalogue exercise (blueprint/13 "Chaves Primárias"). */
export class ExerciseId extends Identifier<"ExerciseId"> {
  static create(value: string): ExerciseId {
    return new ExerciseId(value);
  }

  static generate(): ExerciseId {
    return new ExerciseId(Identifier.newId());
  }
}
