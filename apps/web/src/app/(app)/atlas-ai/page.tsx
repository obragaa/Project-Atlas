import type { Metadata } from "next";
import { AtlasChat } from "@/features/ai/atlas-chat";

export const metadata: Metadata = { title: "Atlas AI" };

export default function AtlasAiPage() {
  return <AtlasChat />;
}
