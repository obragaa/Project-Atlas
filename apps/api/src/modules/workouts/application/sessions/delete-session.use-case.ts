import { Inject, Injectable } from "@nestjs/common";
import {
  WORKOUT_SESSION_REPOSITORY,
  type WorkoutSessionRepository,
} from "../../domain/sessions/workout-session.repository.js";
import { WorkoutSessionId } from "../../domain/sessions/session-id.js";
import { loadOwnedSession } from "./load-owned-session.js";

export interface DeleteSessionCommand {
  readonly userId: string;
  readonly sessionId: string;
}

/**
 * Deletes one of the caller's sessions from history (ownership enforced on load,
 * so a foreign or missing id yields the same not-found — no enumeration, doc 16).
 * Children cascade at the database (migration 0005).
 */
@Injectable()
export class DeleteSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY) private readonly sessions: WorkoutSessionRepository,
  ) {}

  async execute(command: DeleteSessionCommand): Promise<void> {
    const session = await loadOwnedSession(this.sessions, command.sessionId, command.userId);
    await this.sessions.delete(WorkoutSessionId.create(session.id.toString()));
  }
}
