import type { Metadata } from "next";
import { WorkoutDetail } from "@/features/workouts/workout-detail";

export const metadata: Metadata = { title: "Treino" };

/**
 * Workout detail/builder route. A Server Component shell (blueprint/11, 17) that
 * resolves the async route param (Next 15) and frames the interactive builder.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkoutDetail id={id} />;
}
