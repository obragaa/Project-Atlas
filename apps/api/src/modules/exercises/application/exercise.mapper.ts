import { type ExerciseSummaryView, type ExerciseView } from "@atlas/contracts";
import { type Exercise } from "../domain/exercise.js";

/** Pure transport mapping (domain → contract), blueprint/12. */
export function toExerciseView(exercise: Exercise): ExerciseView {
  return {
    id: exercise.id.toString(),
    slug: exercise.slug,
    name: exercise.name,
    primaryMuscle: exercise.primaryMuscle,
    muscles: [...exercise.muscles],
    equipment: exercise.equipment,
    instructions: exercise.instructions,
    tips: [...exercise.tips],
    variations: [...exercise.variations],
  };
}

export function toExerciseSummaryView(exercise: Exercise): ExerciseSummaryView {
  return {
    id: exercise.id.toString(),
    slug: exercise.slug,
    name: exercise.name,
    primaryMuscle: exercise.primaryMuscle,
    equipment: exercise.equipment,
  };
}
