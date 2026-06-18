import { Identifier } from "../../../shared/domain/identifier.js";

/** Opaque identity of a workout aggregate (blueprint/13 "Chaves Primárias"). */
export class WorkoutId extends Identifier<"WorkoutId"> {
  static create(value: string): WorkoutId {
    return new WorkoutId(value);
  }

  static generate(): WorkoutId {
    return new WorkoutId(Identifier.newId());
  }
}

/** Opaque identity of an exercise item within a workout. */
export class WorkoutItemId extends Identifier<"WorkoutItemId"> {
  static create(value: string): WorkoutItemId {
    return new WorkoutItemId(value);
  }

  static generate(): WorkoutItemId {
    return new WorkoutItemId(Identifier.newId());
  }
}

/** Opaque identity of a recorded set within an item. */
export class SetId extends Identifier<"SetId"> {
  static create(value: string): SetId {
    return new SetId(value);
  }

  static generate(): SetId {
    return new SetId(Identifier.newId());
  }
}
