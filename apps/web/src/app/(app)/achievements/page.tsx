import type { Metadata } from "next";
import { AchievementsScreen } from "@/features/gamification/achievements-screen";

export const metadata: Metadata = { title: "Conquistas" };

export default function AchievementsPage() {
  return <AchievementsScreen />;
}
