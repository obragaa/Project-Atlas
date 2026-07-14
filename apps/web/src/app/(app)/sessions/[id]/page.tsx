import type { Metadata } from "next";
import { SessionDetail } from "@/features/workouts/session-detail";

export const metadata: Metadata = { title: "Treino de hoje" };

/**
 * Session recording route. A Server Component shell (blueprint/11, 17) that
 * resolves the async route param (Next 15) and frames the interactive recorder.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionDetail id={id} />;
}
