import type { Metadata } from "next";
import Link from "next/link";
import { ExercisesCatalogue } from "@/features/exercises/exercises-catalogue";

export const metadata: Metadata = { title: "Exercícios" };

/**
 * Exercises route. A Server Component shell (blueprint/11, 17: RSC-first) that
 * frames the interactive catalogue (client component — it manages session token
 * and query state).
 */
export default function ExercisesPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-secondary"
      >
        ← Atlas
      </Link>
      <ExercisesCatalogue />
    </main>
  );
}
