"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type Equipment,
  EQUIPMENT,
  type ExerciseSummaryView,
  type MuscleGroup,
  MUSCLE_GROUPS,
} from "@atlas/contracts";
import { Button, Card, Input, Skeleton, cn } from "@atlas/ui";
import { exerciseImage } from "@/features/media/fitness-images";
import { ApiError } from "@/services/api-client";
import { exercisesService } from "@/services/exercises.service";
import { EQUIPMENT_LABELS, MUSCLE_LABELS } from "./labels";

/**
 * Catalogue screen (blueprint/07 "Exercícios"): a searchable, filterable view of
 * the curated library. Auth is guaranteed by the app shell, so the service is
 * called directly — the api-client attaches the token automatically.
 */
export function ExercisesCatalogue() {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "">("");
  const [equipment, setEquipment] = useState<Equipment | "">("");

  const [items, setItems] = useState<ExerciseSummaryView[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Re-query whenever a filter changes (debounced for the free-text search).
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setError(null);
      setItems(null);
      setNextCursor(null);
      try {
        const page = await exercisesService.list({
          search: search.trim() || undefined,
          muscle: muscle || undefined,
          equipment: equipment || undefined,
        });
        if (!controller.signal.aborted) {
          setItems([...page.items]);
          setNextCursor(page.nextCursor);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(toMessage(err));
        }
      }
    };
    const timer = setTimeout(() => void run(), 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [search, muscle, equipment]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await exercisesService.list({
        search: search.trim() || undefined,
        muscle: muscle || undefined,
        equipment: equipment || undefined,
        cursor: nextCursor,
      });
      setItems((prev) => [...(prev ?? []), ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Exercícios</h1>
        <p className="text-text-secondary">
          Explore a biblioteca: busque pelo nome ou filtre por músculo e equipamento.
        </p>
      </header>

      <Card padding="lg" className="flex flex-col gap-6">
        <Input
          label="Buscar"
          placeholder="Ex.: supino, agachamento…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Grupo muscular
          </p>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((m) => (
              <Chip
                key={m}
                label={MUSCLE_LABELS[m]}
                active={muscle === m}
                onClick={() => setMuscle((prev) => (prev === m ? "" : m))}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Equipamento
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((eq) => (
              <Chip
                key={eq}
                label={EQUIPMENT_LABELS[eq]}
                active={equipment === eq}
                onClick={() => setEquipment((prev) => (prev === eq ? "" : eq))}
              />
            ))}
          </div>
        </div>
      </Card>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
        >
          {error}
        </p>
      ) : null}

      {items === null ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <CardSkeleton />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <Card padding="lg" className="flex flex-col items-start gap-1">
          <p className="font-medium text-text-primary">Nenhum exercício encontrado</p>
          <p className="text-sm text-text-secondary">
            Tente ajustar a busca ou remover alguns filtros.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((ex) => (
              <li key={ex.id}>
                <ExerciseCard exercise={ex} />
              </li>
            ))}
          </ul>
          {nextCursor ? (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => void loadMore()}
                isLoading={loadingMore}
                loadingText="Carregando"
              >
                Carregar mais
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: ExerciseSummaryView }) {
  return (
    <Link
      href={`/exercises/${exercise.slug}`}
      className={cn(
        "group block h-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised",
        "transition-[transform,box-shadow,border-color] duration-base ease-emphasized",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-lg",
        "motion-reduce:hover:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={exerciseImage(exercise.primaryMuscle)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-slow ease-emphasized group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
        {/* Gradient overlay — mandatory for readability of the name below. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/40 to-transparent"
        />
        <h3 className="absolute inset-x-0 bottom-0 p-4 text-lg font-medium leading-snug text-text-primary">
          {exercise.name}
        </h3>
      </div>
      <div className="flex flex-wrap items-center gap-2 p-4">
        <Pill accent>{MUSCLE_LABELS[exercise.primaryMuscle]}</Pill>
        <Pill>{EQUIPMENT_LABELS[exercise.equipment]}</Pill>
        <span className="ml-auto text-sm font-medium text-accent transition-colors group-hover:text-accent-hover">
          Ver detalhes →
        </span>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-wrap gap-2 p-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
        active
          ? "bg-accent text-on-accent"
          : "bg-surface-overlay text-text-secondary hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        accent ? "bg-accent-subtle text-accent" : "bg-surface-overlay text-text-secondary",
      )}
    >
      {children}
    </span>
  );
}

function toMessage(err: unknown): string {
  // A 401 is handled centrally by the auth context (redirect); we still show a
  // user-safe message here in case the user lingers on the page.
  if (err instanceof ApiError) {
    return err.problem.detail;
  }
  return "Algo deu errado. Tente novamente.";
}
