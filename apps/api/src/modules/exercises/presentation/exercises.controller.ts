import { Controller, Get, Param, Query } from "@nestjs/common";
import { type CursorPage, type ExerciseSummaryView, type ExerciseView } from "@atlas/contracts";
import { ListExercisesUseCase } from "../application/list-exercises.use-case.js";
import { GetExerciseUseCase } from "../application/get-exercise.use-case.js";
import { ListExercisesQueryDto } from "./list-query.dto.js";

/**
 * Exercises controller (Presentation layer). Read-only catalogue: list/search
 * and get-by-slug. Validates input, delegates to a use case, shapes the
 * response — never business logic (blueprint/12). Guarded by the global
 * JwtAuthGuard (secure by default); the catalogue is shared, not per-user.
 */
@Controller({ path: "exercises", version: "1" })
export class ExercisesController {
  constructor(
    private readonly listExercises: ListExercisesUseCase,
    private readonly getExercise: GetExerciseUseCase,
  ) {}

  @Get()
  list(@Query() query: ListExercisesQueryDto): Promise<CursorPage<ExerciseSummaryView>> {
    return this.listExercises.execute({
      search: query.search,
      muscle: query.muscle,
      equipment: query.equipment,
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  @Get(":slug")
  get(@Param("slug") slug: string): Promise<ExerciseView> {
    return this.getExercise.execute({ slug });
  }
}
