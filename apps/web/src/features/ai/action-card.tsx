import Link from "next/link";
import { type AiAction } from "@atlas/contracts";
import { Card } from "@atlas/ui";
import { DumbbellIcon } from "@/features/ai/icons";

/**
 * ActionCard — a grounded action the AI took, surfaced as a tappable card in the
 * transcript (blueprint/22: the assistant acts on the domain, e.g. builds a real
 * workout, then links the user straight to it).
 */
export function ActionCard({ action }: { action: AiAction }) {
  return (
    <Link href={action.href}>
      <Card
        interactive
        padding="md"
        className="flex items-center gap-3 border-accent/40 bg-accent-subtle"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-on-accent">
          <DumbbellIcon />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Treino criado</p>
          <p className="truncate font-medium text-text-primary">{action.label}</p>
        </div>
        <span className="ml-auto text-sm font-medium text-accent">Abrir →</span>
      </Card>
    </Link>
  );
}
