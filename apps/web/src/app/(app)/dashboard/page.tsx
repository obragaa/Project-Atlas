import type { Metadata } from "next";
import { Dashboard } from "@/features/dashboard/dashboard";

export const metadata: Metadata = { title: "Início" };

export default function DashboardPage() {
  return <Dashboard />;
}
