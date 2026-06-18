import type { Metadata } from "next";
import { WorkoutsBoard } from "@/features/workouts/workouts-board";

export const metadata: Metadata = { title: "Treinos" };

/**
 * Workouts route. A Server Component shell (blueprint/11, 17: RSC-first) that
 * frames the interactive board. Auth is guaranteed by the (app) layout's shell,
 * so the board calls the service directly — the api-client attaches the token.
 */
export default function WorkoutsPage() {
  return <WorkoutsBoard />;
}
