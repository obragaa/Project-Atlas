"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type WorkoutStatus, type WorkoutSummaryView } from "@atlas/contracts";
import { Button, Card, CardDescription, Input, Skeleton, cn } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { workoutsService } from "@/services/workouts.service";

/**
 * Workouts board (the `features` layer — blueprint/11): a rich, information-dense
 * list of the user's workouts with inline create and per-card actions. Auth is
 * guaranteed by the app shell, so the service is called directly — the api-client
 * attaches the token automatically.
 */
export function WorkoutsBoard() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutSummaryView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const page = await workoutsService.list();
      setWorkouts([...page.items]);
    } catch (err) {
      setError(toMessage(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created = await workoutsService.create({ name });
      setNewName("");
      router.push(`/workouts/${created.id}`);
    } catch (err) {
      setError(toMessage(err));
      setCreating(false);
    }
  }

  async function act(id: string, fn: () => Promise<unknown>) {
    setPendingId(id);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Treinos</h1>
        <p className="text-text-secondary">Crie, organize, conclua e duplique seus treinos.</p>
      </header>

      <Card padding="lg">
        <form
          onSubmit={(e) => void onCreate(e)}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <Input
            label="Novo treino"
            placeholder="Ex.: Push Day"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            isLoading={creating}
            loadingText="Criando"
            disabled={!newName.trim()}
          >
            Adicionar
          </Button>
        </form>
      </Card>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
        >
          {error}
        </p>
      ) : null}

      {workouts === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <Card padding="lg" className="flex flex-col items-start gap-1">
          <p className="font-medium text-text-primary">Você ainda não tem treinos</p>
          <CardDescription>Crie o primeiro acima para começar a montar sua rotina.</CardDescription>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {workouts.map((w) => (
            <li key={w.id}>
              <WorkoutCard
                workout={w}
                pending={pendingId === w.id}
                onComplete={() => void act(w.id, () => workoutsService.complete(w.id))}
                onDuplicate={() => void act(w.id, () => workoutsService.duplicate(w.id))}
                onRemove={() => void act(w.id, () => workoutsService.remove(w.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WorkoutCard({
  workout,
  pending,
  onComplete,
  onDuplicate,
  onRemove,
}: {
  workout: WorkoutSummaryView;
  pending: boolean;
  onComplete: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const { id, name, status, itemCount } = workout;
  return (
    <Card padding="lg" className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/workouts/${id}`}
          className={cn(
            "min-w-0 text-lg font-medium text-text-primary transition-colors hover:text-accent",
            "focus-visible:outline-none focus-visible:underline",
          )}
        >
          <span className="line-clamp-2 break-words">{name}</span>
        </Link>
        <StatusBadge status={status} />
      </div>

      <p className="text-sm text-text-tertiary">
        {itemCount} {itemCount === 1 ? "exercício" : "exercícios"}
      </p>

      <div className="mt-auto flex flex-wrap gap-2">
        <Link href={`/workouts/${id}`}>
          <Button variant="primary" size="sm">
            Abrir
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          isLoading={pending}
          disabled={status === "completed"}
          onClick={onComplete}
        >
          Concluir
        </Button>
        <Button variant="ghost" size="sm" isLoading={pending} onClick={onDuplicate}>
          Duplicar
        </Button>
        <Button variant="ghost" size="sm" isLoading={pending} onClick={onRemove}>
          Excluir
        </Button>
      </div>
    </Card>
  );
}

const STATUS_LABELS: Record<WorkoutStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  completed: "Concluído",
};

export function StatusBadge({ status }: { status: WorkoutStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        status === "completed"
          ? "border-success-border bg-success-surface text-success-text"
          : status === "active"
            ? "border-transparent bg-accent-subtle text-accent"
            : "border-border bg-surface-overlay text-text-secondary",
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.problem.detail;
  }
  return "Algo deu errado. Tente novamente.";
}
