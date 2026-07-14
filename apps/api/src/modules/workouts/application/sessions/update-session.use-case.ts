import { Inject, Injectable } from "@nestjs/common";
import { type UpdateSessionRequest, type WorkoutSessionView } from "@atlas/contracts";
import {
  WORKOUT_SESSION_REPOSITORY,
  type WorkoutSessionRepository,
} from "../../domain/sessions/workout-session.repository.js";
import { WorkoutName } from "../../domain/value-objects/workout-name.js";
import { SessionDate } from "../../domain/sessions/value-objects/session-date.js";
import { loadOwnedSession } from "./load-owned-session.js";
import { assembleSessionExercises } from "./session-assembler.js";
import { toSessionView } from "./session.mapper.js";

export interface UpdateSessionCommand {
  readonly userId: string;
  readonly sessionId: string;
  readonly request: UpdateSessionRequest;
  /** Today's civil day in the app timezone (injected by the controller). */
  readonly today: string;
}

/**
 * Records the real values performed in a session — PUT semantics (doc 14). Only
 * an in-progress session can be edited (the aggregate enforces this). Ownership
 * is enforced on load (blueprint/13, 15).
 */
@Injectable()
export class UpdateSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY) private readonly sessions: WorkoutSessionRepository,
  ) {}

  async execute(command: UpdateSessionCommand): Promise<WorkoutSessionView> {
    const session = await loadOwnedSession(this.sessions, command.sessionId, command.userId);

    session.updateExecution({
      title: WorkoutName.create(command.request.title),
      performedOn: SessionDate.create(command.request.performedOn, command.today),
      exercises: assembleSessionExercises(command.request.exercises),
      notes: command.request.notes ?? null,
    });

    await this.sessions.save(session);
    return toSessionView(session);
  }
}
