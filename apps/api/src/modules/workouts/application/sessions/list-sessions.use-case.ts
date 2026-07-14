import { Inject, Injectable } from "@nestjs/common";
import { type CursorPage, type WorkoutSessionSummaryView } from "@atlas/contracts";
import {
  WORKOUT_SESSION_REPOSITORY,
  type WorkoutSessionRepository,
} from "../../domain/sessions/workout-session.repository.js";
import { toSessionSummaryView } from "./session.mapper.js";

export interface ListSessionsQuery {
  readonly userId: string;
  readonly cursor?: string;
  readonly limit?: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Lists the caller's workout history, most recently performed first, cursor-
 * paginated (blueprint/07 "Histórico de treinos", 13/14 Cursor Pagination). The
 * limit is clamped server-side to a safe maximum.
 */
@Injectable()
export class ListSessionsUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY) private readonly sessions: WorkoutSessionRepository,
  ) {}

  async execute(query: ListSessionsQuery): Promise<CursorPage<WorkoutSessionSummaryView>> {
    const limit = clampLimit(query.limit);
    const page = await this.sessions.list({
      userId: query.userId,
      cursor: query.cursor,
      limit,
    });

    return {
      items: page.items.map(toSessionSummaryView),
      nextCursor: page.nextCursor,
      previousCursor: null,
      hasNext: page.hasNext,
    };
  }
}

function clampLimit(requested?: number): number {
  if (requested === undefined || !Number.isFinite(requested) || requested < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(requested), MAX_LIMIT);
}
