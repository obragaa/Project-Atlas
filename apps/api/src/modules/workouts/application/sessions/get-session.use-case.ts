import { Inject, Injectable } from "@nestjs/common";
import { type WorkoutSessionView } from "@atlas/contracts";
import {
  WORKOUT_SESSION_REPOSITORY,
  type WorkoutSessionRepository,
} from "../../domain/sessions/workout-session.repository.js";
import { loadOwnedSession } from "./load-owned-session.js";
import { toSessionView } from "./session.mapper.js";

export interface GetSessionQuery {
  readonly userId: string;
  readonly sessionId: string;
}

/** Loads one of the caller's sessions (ownership enforced — blueprint/13, 15). */
@Injectable()
export class GetSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY) private readonly sessions: WorkoutSessionRepository,
  ) {}

  async execute(query: GetSessionQuery): Promise<WorkoutSessionView> {
    const session = await loadOwnedSession(this.sessions, query.sessionId, query.userId);
    return toSessionView(session);
  }
}
