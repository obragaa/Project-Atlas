import { Inject, Injectable } from "@nestjs/common";
import {
  type CursorPage,
  type Equipment,
  type ExerciseSummaryView,
  type MuscleGroup,
} from "@atlas/contracts";
import { EXERCISE_REPOSITORY, type ExerciseRepository } from "../domain/exercise.repository.js";
import { toExerciseSummaryView } from "./exercise.mapper.js";

export interface ListExercisesQuery {
  readonly search?: string;
  readonly muscle?: MuscleGroup;
  readonly equipment?: Equipment;
  readonly cursor?: string;
  readonly limit?: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Lists/searches the exercise catalogue (blueprint/07 "Pesquisa inteligente",
 * "Filtros"; 14 Filtering). Filters are combinable; results are cursor-paginated
 * alphabetically. The limit is clamped server-side.
 */
@Injectable()
export class ListExercisesUseCase {
  constructor(@Inject(EXERCISE_REPOSITORY) private readonly exercises: ExerciseRepository) {}

  async execute(query: ListExercisesQuery): Promise<CursorPage<ExerciseSummaryView>> {
    const page = await this.exercises.search({
      search: query.search?.trim() || undefined,
      muscle: query.muscle,
      equipment: query.equipment,
      cursor: query.cursor,
      limit: clampLimit(query.limit),
    });

    return {
      items: page.items.map(toExerciseSummaryView),
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
