"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  type ExerciseSummaryView,
  LOAD_UNITS,
  type LoadUnit,
  type SetInput,
  type UpdateWorkoutRequest,
  type WorkoutStatus,
  type WorkoutView,
} from "@atlas/contracts";
import { Button, Card, CardDescription, Input, Skeleton, Spinner, cn } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { exercisesService } from "@/services/exercises.service";
import { workoutsService } from "@/services/workouts.service";
import { MUSCLE_LABELS } from "@/features/exercises/labels";
import { StatusBadge } from "./workouts-board";

/** A locally editable set. Mirrors SetInput but with display-friendly strings. */
interface DraftSet {
  readonly key: string;
  reps: number;
  /** Empty string means bodyweight (no load). */
  weight: string;
  unit: LoadUnit;
  notes: string;
}

/** A locally editable exercise item. */
interface DraftItem {
  readonly key: string;
  readonly exerciseName: string;
  sets: DraftSet[];
}

let keySeq = 0;
function nextKey(): string {
  keySeq += 1;
  return `k${keySeq}`;
}

function toDraft(workout: WorkoutView): DraftItem[] {
  return workout.items.map((item) => ({
    key: nextKey(),
    exerciseName: item.exerciseName,
    sets: item.sets.map((s) => ({
      key: nextKey(),
      reps: s.reps,
      weight: s.load ? String(s.load.weight) : "",
      unit: s.load?.unit ?? "kg",
      notes: s.notes ?? "",
    })),
  }));
}

function buildRequest(name: string, items: DraftItem[]): UpdateWorkoutRequest {
  return {
    name: name.trim(),
    items: items.map((item) => ({
      exerciseName: item.exerciseName,
      sets: item.sets.map((s): SetInput => {
        const weight = s.weight.trim();
        const notes = s.notes.trim();
        return {
          reps: s.reps,
          load: weight ? { weight: Number(weight), unit: s.unit } : null,
          notes: notes ? notes : null,
        };
      }),
    })),
  };
}

/**
 * Workout detail/builder (the `features` layer — blueprint/11): edit a workout's
 * name, add exercises from the catalogue, attach sets, then save (PUT) or
 * complete. Completed workouts are read-only (the API returns 409 — we reflect it
 * by disabling the edit controls). Auth is guaranteed by the app shell.
 */
export function WorkoutDetail({ id }: { id: string }) {
  const [workout, setWorkout] = useState<WorkoutView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [status, setStatus] = useState<WorkoutStatus>("draft");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const hydrate = useCallback((w: WorkoutView) => {
    setWorkout(w);
    setName(w.name);
    setItems(toDraft(w));
    setStatus(w.status);
  }, []);

  useEffect(() => {
    let active = true;
    setNotFound(false);
    setLoadError(null);
    workoutsService
      .get(id)
      .then((w) => {
        if (active) hydrate(w);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.problem.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(toMessage(err));
        }
      });
    return () => {
      active = false;
    };
  }, [id, hydrate]);

  const readOnly = status === "completed";

  function addExercise(exercise: ExerciseSummaryView) {
    setItems((prev) => [...prev, { key: nextKey(), exerciseName: exercise.name, sets: [] }]);
    setSaved(false);
    setPickerOpen(false);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
    setSaved(false);
  }

  function addSet(itemKey: string, set: DraftSet) {
    setItems((prev) =>
      prev.map((it) => (it.key === itemKey ? { ...it, sets: [...it.sets, set] } : it)),
    );
    setSaved(false);
  }

  function removeSet(itemKey: string, setKey: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.key === itemKey ? { ...it, sets: it.sets.filter((s) => s.key !== setKey) } : it,
      ),
    );
    setSaved(false);
  }

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly || !name.trim()) return;
    setSaving(true);
    setActionError(null);
    setSaved(false);
    try {
      const updated = await workoutsService.update(id, buildRequest(name, items));
      hydrate(updated);
      setSaved(true);
    } catch (err) {
      setActionError(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function onComplete() {
    if (readOnly) return;
    setCompleting(true);
    setActionError(null);
    setSaved(false);
    try {
      const completed = await workoutsService.complete(id);
      hydrate(completed);
    } catch (err) {
      setActionError(toMessage(err));
    } finally {
      setCompleting(false);
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <Card padding="lg" className="flex flex-col items-start gap-2">
          <p className="font-medium text-text-primary">Treino não encontrado</p>
          <CardDescription>
            Ele pode ter sido removido. Volte para a lista e escolha outro.
          </CardDescription>
          <Link href="/workouts" className="text-sm font-medium text-accent">
            Ver meus treinos →
          </Link>
        </Card>
      </div>
    );
  }

  if (workout === null) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        {loadError ? (
          <p
            role="alert"
            className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
          >
            {loadError}
          </p>
        ) : (
          <>
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <BackLink />

      <form onSubmit={(e) => void onSave(e)} className="flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            {readOnly ? (
              <span className="text-xs text-text-tertiary">
                Treinos concluídos não podem ser editados.
              </span>
            ) : null}
          </div>
          <Input
            label="Nome do treino"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            disabled={readOnly}
            requiredField
          />
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
              Exercícios
            </h2>
            {!readOnly ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPickerOpen((o) => !o)}
              >
                {pickerOpen ? "Fechar" : "Adicionar exercício"}
              </Button>
            ) : null}
          </div>

          {pickerOpen && !readOnly ? (
            <ExercisePicker onPick={addExercise} onClose={() => setPickerOpen(false)} />
          ) : null}

          {items.length === 0 ? (
            <Card padding="lg" className="flex flex-col items-start gap-1">
              <p className="font-medium text-text-primary">Nenhum exercício ainda</p>
              <CardDescription>
                {readOnly
                  ? "Este treino não tem exercícios."
                  : 'Use "Adicionar exercício" para escolher do catálogo.'}
              </CardDescription>
            </Card>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item, index) => (
                <li key={item.key}>
                  <ItemCard
                    item={item}
                    index={index}
                    readOnly={readOnly}
                    onRemoveItem={() => removeItem(item.key)}
                    onAddSet={(set) => addSet(item.key, set)}
                    onRemoveSet={(setKey) => removeSet(item.key, setKey)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {actionError ? (
          <p
            role="alert"
            className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
          >
            {actionError}
          </p>
        ) : null}

        {saved ? (
          <p
            role="status"
            className="rounded-md border border-success-border bg-success-surface px-3 py-2 text-sm text-success-text"
          >
            Treino salvo com sucesso.
          </p>
        ) : null}

        {!readOnly ? (
          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={saving} loadingText="Salvando" disabled={!name.trim()}>
              Salvar
            </Button>
            <Button
              type="button"
              variant="secondary"
              isLoading={completing}
              loadingText="Concluindo"
              onClick={() => void onComplete()}
            >
              Concluir treino
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/workouts"
      className="inline-flex w-fit items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-secondary"
    >
      ← Treinos
    </Link>
  );
}

function ItemCard({
  item,
  index,
  readOnly,
  onRemoveItem,
  onAddSet,
  onRemoveSet,
}: {
  item: DraftItem;
  index: number;
  readOnly: boolean;
  onRemoveItem: () => void;
  onAddSet: (set: DraftSet) => void;
  onRemoveSet: (setKey: string) => void;
}) {
  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-text-tertiary">{index + 1}.</span>
          <p className="font-medium text-text-primary">{item.exerciseName}</p>
        </div>
        {!readOnly ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemoveItem}>
            Remover
          </Button>
        ) : null}
      </div>

      {item.sets.length === 0 ? (
        <p className="text-sm text-text-tertiary">Nenhuma série adicionada.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {item.sets.map((s, i) => (
            <li
              key={s.key}
              className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-overlay px-3 py-2"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <span className="font-medium text-text-secondary">Série {i + 1}</span>
                <span className="text-text-primary">{s.reps} reps</span>
                <span className="text-text-secondary">
                  {s.weight.trim() ? `${s.weight.trim()} ${s.unit}` : "Peso do corpo"}
                </span>
                {s.notes.trim() ? (
                  <span className="text-text-tertiary">— {s.notes.trim()}</span>
                ) : null}
              </div>
              {!readOnly ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveSet(s.key)}
                  aria-label={`Remover série ${i + 1}`}
                >
                  ✕
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {!readOnly ? <AddSetForm onAdd={onAddSet} /> : null}
    </Card>
  );
}

function AddSetForm({ onAdd }: { onAdd: (set: DraftSet) => void }) {
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<LoadUnit>("kg");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const repsNum = Number(reps);
    if (!Number.isInteger(repsNum) || repsNum < 1 || repsNum > 1000) {
      setError("As repetições devem ser um número entre 1 e 1000.");
      return;
    }
    const w = weight.trim();
    if (w && (!Number.isFinite(Number(w)) || Number(w) <= 0)) {
      setError("Informe um peso válido ou deixe em branco para peso do corpo.");
      return;
    }
    onAdd({ key: nextKey(), reps: repsNum, weight: w, unit, notes });
    setReps("10");
    setWeight("");
    setUnit("kg");
    setNotes("");
    setError(null);
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-border-subtle p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Input
          label="Reps"
          type="number"
          min={1}
          max={1000}
          inputMode="numeric"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <Input
          label="Peso"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder="opcional"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="set-unit" className="text-sm font-medium text-text-secondary">
            Unidade
          </label>
          <select
            id="set-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as LoadUnit)}
            className={cn(
              "h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary",
              "outline-none transition-[border-color,box-shadow] duration-fast ease-standard",
              "focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-focus",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
            )}
          >
            {LOAD_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Notas"
          placeholder="opcional"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {error ? (
        <p role="alert" className="text-xs text-danger-text">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="button" variant="secondary" size="sm" onClick={submit}>
          Adicionar série
        </Button>
      </div>
    </div>
  );
}

function ExercisePicker({
  onPick,
  onClose,
}: {
  onPick: (exercise: ExerciseSummaryView) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ExerciseSummaryView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setError(null);
      setResults(null);
      try {
        const page = await exercisesService.list({ search: search.trim() || undefined });
        if (!controller.signal.aborted) {
          setResults([...page.items]);
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
  }, [search]);

  return (
    <Card padding="lg" className="flex flex-col gap-4 bg-surface-overlay">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-text-primary">Escolher exercício</p>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>
      <Input
        label="Buscar no catálogo"
        placeholder="Ex.: supino, agachamento…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error ? (
        <p role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      ) : results === null ? (
        <div className="flex items-center gap-2 text-sm text-text-tertiary">
          <Spinner size="sm" label="Carregando exercícios" /> Carregando…
        </div>
      ) : results.length === 0 ? (
        <p className="text-sm text-text-secondary">Nenhum exercício encontrado.</p>
      ) : (
        <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {results.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => onPick(ex)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-left",
                  "transition-colors hover:border-border hover:bg-surface-overlay",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
                )}
              >
                <span className="font-medium text-text-primary">{ex.name}</span>
                <span className="shrink-0 rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs font-medium text-accent">
                  {MUSCLE_LABELS[ex.primaryMuscle]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.problem.detail;
  }
  return "Algo deu errado. Tente novamente.";
}
