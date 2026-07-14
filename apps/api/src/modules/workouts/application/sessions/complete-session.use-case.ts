import { Inject, Injectable } from "@nestjs/common";
import { type WorkoutSessionView } from "@atlas/contracts";
import {
  DOMAIN_EVENT_PUBLISHER,
  type DomainEventPublisher,
} from "../../../../shared/domain/domain-event-publisher.js";
import {
  WORKOUT_SESSION_REPOSITORY,
  type WorkoutSessionRepository,
} from "../../domain/sessions/workout-session.repository.js";
import { loadOwnedSession } from "./load-owned-session.js";
import { toSessionView } from "./session.mapper.js";

export interface CompleteSessionCommand {
  readonly userId: string;
  readonly sessionId: string;
}

/**
 * Finalizes a session and publishes WorkoutSessionCompleted, which gamification
 * consumes to count the workout and evaluate streak/achievements (blueprint/09).
 * The aggregate rejects an empty session (no completed set). Ownership enforced.
 */
@Injectable()
export class CompleteSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY) private readonly sessions: WorkoutSessionRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: CompleteSessionCommand): Promise<WorkoutSessionView> {
    const session = await loadOwnedSession(this.sessions, command.sessionId, command.userId);

    session.complete();

    await this.sessions.save(session);
    await this.events.publishFor(session);

    return toSessionView(session);
  }
}
