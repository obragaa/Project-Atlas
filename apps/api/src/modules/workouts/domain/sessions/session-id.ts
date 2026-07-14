import { Identifier } from "../../../../shared/domain/identifier.js";

/** Opaque identity of a workout-session aggregate (blueprint/13 "Chaves Primárias"). */
export class WorkoutSessionId extends Identifier<"WorkoutSessionId"> {
  static create(value: string): WorkoutSessionId {
    return new WorkoutSessionId(value);
  }

  static generate(): WorkoutSessionId {
    return new WorkoutSessionId(Identifier.newId());
  }
}

/** Opaque identity of a performed exercise within a session. */
export class SessionExerciseId extends Identifier<"SessionExerciseId"> {
  static create(value: string): SessionExerciseId {
    return new SessionExerciseId(value);
  }

  static generate(): SessionExerciseId {
    return new SessionExerciseId(Identifier.newId());
  }
}

/** Opaque identity of a performed set within a session exercise. */
export class PerformedSetId extends Identifier<"PerformedSetId"> {
  static create(value: string): PerformedSetId {
    return new PerformedSetId(value);
  }

  static generate(): PerformedSetId {
    return new PerformedSetId(Identifier.newId());
  }
}
