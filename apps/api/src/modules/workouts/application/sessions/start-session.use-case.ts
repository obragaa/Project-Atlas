import { Inject, Injectable } from "@nestjs/common";
import { type StartSessionRequest, type WorkoutSessionView } from "@atlas/contracts";
import { WORKOUT_REPOSITORY, type WorkoutRepository } from "../../domain/workout.repository.js";
import {
  WORKOUT_SESSION_REPOSITORY,
  type WorkoutSessionRepository,
} from "../../domain/sessions/workout-session.repository.js";
import { WorkoutSession } from "../../domain/sessions/workout-session.js";
import { SessionDate } from "../../domain/sessions/value-objects/session-date.js";
import { loadOwnedWorkout } from "../load-owned-workout.js";
import { toSessionView } from "./session.mapper.js";

export interface StartSessionCommand {
  readonly userId: string;
  readonly workoutId: string;
  readonly request: StartSessionRequest;
  /** Today's civil day in the app timezone (injected by the controller). */
  readonly today: string;
}

/**
 * Starts a performed session from a template ("Treinar agora" — blueprint/02
 * "Menos cliques"). Ownership of the template is enforced; the session is
 * pre-filled with the planned exercises/sets for the user to adjust. The day
 * defaults to today (never forced on the user).
 */
@Injectable()
export class StartSessionUseCase {
  constructor(
    @Inject(WORKOUT_REPOSITORY) private readonly workouts: WorkoutRepository,
    @Inject(WORKOUT_SESSION_REPOSITORY) private readonly sessions: WorkoutSessionRepository,
  ) {}

  async execute(command: StartSessionCommand): Promise<WorkoutSessionView> {
    const workout = await loadOwnedWorkout(this.workouts, command.workoutId, command.userId);

    const performedOn = command.request.performedOn
      ? SessionDate.create(command.request.performedOn, command.today)
      : SessionDate.create(command.today, command.today);

    const session = WorkoutSession.startFromTemplate({ workout, performedOn });
    await this.sessions.save(session);

    return toSessionView(session);
  }
}
