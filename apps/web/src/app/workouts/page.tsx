import type { Metadata } from "next";
import Link from "next/link";
import { WorkoutsBoard } from "@/features/workouts/workouts-board";

export const metadata: Metadata = { title: "Treinos" };

/**
 * Workouts route. A Server Component shell (blueprint/11, 17: RSC-first) that
 * frames the interactive board. The board itself is a client component because
 * it manages session token state and mutations.
 */
export default function WorkoutsPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-secondary"
      >
        ← Atlas
      </Link>
      <WorkoutsBoard />
    </main>
  );
}
