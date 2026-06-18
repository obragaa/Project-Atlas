import type { Metadata } from "next";
import { ExercisesCatalogue } from "@/features/exercises/exercises-catalogue";

export const metadata: Metadata = { title: "Exercícios" };

/**
 * Exercises route. A Server Component shell (blueprint/11, 17: RSC-first) that
 * frames the interactive catalogue. Auth is guaranteed by the (app) layout.
 */
export default function ExercisesPage() {
  return <ExercisesCatalogue />;
}
