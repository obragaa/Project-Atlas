import { Inject, Injectable } from "@nestjs/common";
import { type ExerciseView } from "@atlas/contracts";
import { NotFoundError } from "../../../shared/domain/errors.js";
import { EXERCISE_REPOSITORY, type ExerciseRepository } from "../domain/exercise.repository.js";
import { toExerciseView } from "./exercise.mapper.js";

export interface GetExerciseQuery {
  readonly slug: string;
}

/** Returns one catalogue exercise by its stable slug (blueprint/07, 14). */
@Injectable()
export class GetExerciseUseCase {
  constructor(@Inject(EXERCISE_REPOSITORY) private readonly exercises: ExerciseRepository) {}

  async execute(query: GetExerciseQuery): Promise<ExerciseView> {
    const exercise = await this.exercises.findBySlug(query.slug);
    if (!exercise) {
      throw new NotFoundError("Exercício não encontrado.", "exercise.not_found");
    }
    return toExerciseView(exercise);
  }
}
