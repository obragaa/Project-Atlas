"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Equipment,
  EQUIPMENT,
  type ExerciseSummaryView,
  type MuscleGroup,
  MUSCLE_GROUPS,
} from "@atlas/contracts";
import { Button, Card, Input, Skeleton } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { SessionGate } from "@/features/auth/session-gate";
import { exercisesService } from "@/services/exercises.service";
import { EQUIPMENT_LABELS, MUSCLE_LABELS } from "./labels";

/** Catalogue screen (blueprint/07 "Exercícios"): search + filters over the API. */
export function ExercisesCatalogue() {
  return (
    <SessionGate title="Biblioteca de exercícios" description="Entre para explorar o catálogo.">
      {(accessToken, signOut) => <Catalogue accessToken={accessToken} onSignOut={signOut} />}
    </SessionGate>
  );
}

function Catalogue({ accessToken, onSignOut }: { accessToken: string; onSignOut: () => void }) {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "">("");
  const [equipment, setEquipment] = useState<Equipment | "">("");

  const [items, setItems] = useState<ExerciseSummaryView[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.problem.status === 401) {
        onSignOut();
        return;
      }
      setError(err instanceof ApiError ? err.problem.detail : "Algo deu errado. Tente novamente.");
    },
    [onSignOut],
  );

  // Re-query whenever a filter changes (debounced for the free-text search).
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setError(null);
      setItems(null);
      try {
        const page = await exercisesService.list(accessToken, {
          search: search.trim() || undefined,
          muscle: muscle || undefined,
          equipment: equipment || undefined,
        });
        if (!controller.signal.aborted) {
          setItems([...page.items]);
          setNextCursor(page.nextCursor);
        }
      } catch (err) {
        if (!controller.signal.aborted) handle(err);
      }
    };
    const timer = setTimeout(() => void run(), 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [accessToken, search, muscle, equipment, handle]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await exercisesService.list(accessToken, {
        search: search.trim() || undefined,
        muscle: muscle || undefined,
        equipment: equipment || undefined,
        cursor: nextCursor,
      });
      setItems((prev) => [...(prev ?? []), ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (err) {
      handle(err);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Exercícios</h1>
          <p className="text-sm text-text-secondary">Pesquise e filtre a biblioteca.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          Sair
        </Button>
      </header>

      <Card padding="md" className="flex flex-col gap-4">
        <Input
          label="Buscar"
          placeholder="Ex.: supino, agachamento…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Grupo muscular"
            value={muscle}
            onChange={(v) => setMuscle(v as MuscleGroup | "")}
            options={MUSCLE_GROUPS.map((m) => ({ value: m, label: MUSCLE_LABELS[m] }))}
          />
          <Select
            label="Equipamento"
            value={equipment}
            onChange={(v) => setEquipment(v as Equipment | "")}
            options={EQUIPMENT.map((e) => ({ value: e, label: EQUIPMENT_LABELS[e] }))}
          />
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
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : items.length === 0 ? (
        <Card padding="lg">
          <p className="text-sm text-text-secondary">
            Nenhum exercício encontrado com esses filtros.
          </p>
        </Card>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((ex) => (
              <li key={ex.id}>
                <Card padding="md" className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-text-primary">{ex.name}</p>
                    <p className="text-xs text-text-tertiary">
                      {MUSCLE_LABELS[ex.primaryMuscle]} · {EQUIPMENT_LABELS[ex.equipment]}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          {nextCursor ? (
            <Button
              variant="secondary"
              onClick={() => void loadMore()}
              isLoading={loadingMore}
              loadingText="Carregando"
            >
              Carregar mais
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
