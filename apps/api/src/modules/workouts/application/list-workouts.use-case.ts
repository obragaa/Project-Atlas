import { Inject, Injectable } from "@nestjs/common";
import { type CursorPage, type WorkoutSummaryView } from "@atlas/contracts";
import { WORKOUT_REPOSITORY, type WorkoutRepository } from "../domain/workout.repository.js";
import { toWorkoutSummaryView } from "./workout.mapper.js";

export interface ListWorkoutsQuery {
  readonly userId: string;
  readonly cursor?: string;
  readonly limit?: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Lists the caller's workouts, newest first, cursor-paginated (blueprint/07
 * "Histórico de treinos", 13/14 Cursor Pagination). The limit is clamped server-
 * side to a safe maximum.
 */
@Injectable()
export class ListWorkoutsUseCase {
  constructor(@Inject(WORKOUT_REPOSITORY) private readonly workouts: WorkoutRepository) {}

  async execute(query: ListWorkoutsQuery): Promise<CursorPage<WorkoutSummaryView>> {
    const limit = clampLimit(query.limit);
    const page = await this.workouts.list({
      userId: query.userId,
      cursor: query.cursor,
      limit,
    });

    return {
      items: page.items.map(toWorkoutSummaryView),
      nextCursor: page.nextCursor,
      // First page has no previous cursor; backward paging is a later addition.
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
