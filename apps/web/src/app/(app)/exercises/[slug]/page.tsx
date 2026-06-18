import type { Metadata } from "next";
import { ExerciseDetail } from "@/features/exercises/exercise-detail";

export const metadata: Metadata = { title: "Exercício" };

/**
 * Exercise detail route. A Server Component shell (blueprint/11, 17: RSC-first)
 * that frames the interactive detail view. Auth is guaranteed by the (app)
 * layout. In Next 15, dynamic route params are async.
 */
export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ExerciseDetail slug={slug} />;
}
