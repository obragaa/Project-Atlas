"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type LoadUnit,
  RPE_MAX,
  RPE_MIN,
  type SessionExerciseInput,
  type UpdateSessionRequest,
  type WorkoutSessionView,
} from "@atlas/contracts";
import { Button, Card, CardDescription, Input, Skeleton, cn } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { sessionsService } from "@/services/sessions.service";

/** A locally editable performed set (display-friendly strings). */
interface DraftSet {
  readonly key: string;
  reps: string;
  weight: string;
  unit: LoadUnit;
  completed: boolean;
  rpe: string;
  notes: string;
}

interface DraftExercise {
  readonly key: string;
  readonly exerciseName: string;
  sets: DraftSet[];
}

let keySeq = 0;
function nextKey(): string {
  keySeq += 1;
  return `s${keySeq}`;
}

function toDraft(session: WorkoutSessionView): DraftExercise[] {
  return session.exercises.map((ex) => ({
    key: nextKey(),
    exerciseName: ex.exerciseName,
    sets: ex.sets.map((s) => ({
      key: nextKey(),
      reps: String(s.reps),
      weight: s.load ? String(s.load.weight) : "",
      unit: s.load?.unit ?? "kg",
      completed: s.completed,
      rpe: s.rpe === null ? "" : String(s.rpe),
      notes: s.notes ?? "",
    })),
  }));
}

function buildRequest(
  title: string,
  performedOn: string,
  exercises: DraftExercise[],
  notes: string,
): UpdateSessionRequest {
  return {
    title: title.trim(),
    performedOn,
    notes: notes.trim() ? notes.trim() : null,
    exercises: exercises.map(
      (ex): SessionExerciseInput => ({
        exerciseName: ex.exerciseName,
        sets: ex.sets.map((s) => {
          const weight = s.weight.trim();
          const rpe = s.rpe.trim();
          const noteStr = s.notes.trim();
          return {
            reps: Math.max(1, Number(s.reps) || 1),
            load: weight ? { weight: Number(weight), unit: s.unit } : null,
            completed: s.completed,
            rpe: rpe ? Number(rpe) : null,
            notes: noteStr ? noteStr : null,
          };
        }),
      }),
    ),
  };
}

function countCompleted(exercises: DraftExercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0);
}
function countTotal(exercises: DraftExercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

/**
 * Live workout screen (the `features` layer — blueprint/11, ADR-0008). This is
 * *doing* the workout, not filling a form: the user works exercise by exercise,
 * opening a set panel and checking off each set with the real reps/load as they
 * lift. The date is today by default (blueprint/02). Auth is guaranteed by the
 * app shell. The session was already created ("Iniciar treino") — here we record
 * and then finish it.
 */
export function SessionDetail({ id }: { id: string }) {
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSessionView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [performedOn, setPerformedOn] = useState("");
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [notes, setNotes] = useState("");

  const [openExercise, setOpenExercise] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const hydrate = useCallback((s: WorkoutSessionView) => {
    setSession(s);
    setTitle(s.title);
    setPerformedOn(s.performedOn);
    setExercises(toDraft(s));
    setNotes(s.notes ?? "");
  }, []);

  useEffect(() => {
    let active = true;
    sessionsService
      .get(id)
      .then((s) => {
        if (active) hydrate(s);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.problem.status === 404) setNotFound(true);
        else setLoadError(toMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id, hydrate]);

  const finished = session?.status === "completed";
  const done = countCompleted(exercises);
  const total = countTotal(exercises);

  const setExerciseSets = useCallback((exKey: string, sets: DraftSet[]) => {
    setExercises((prev) => prev.map((ex) => (ex.key === exKey ? { ...ex, sets } : ex)));
  }, []);

  /** Persist the current draft silently (autosave as the user records). */
  const persist = useCallback(
    async (draft: DraftExercise[], draftNotes: string) => {
      try {
        await sessionsService.update(id, buildRequest(title, performedOn, draft, draftNotes));
      } catch (err) {
        setActionError(toMessage(err));
      }
    },
    [id, title, performedOn],
  );

  async function onFinish() {
    setFinishing(true);
    setActionError(null);
    try {
      await sessionsService.update(id, buildRequest(title, performedOn, exercises, notes));
      await sessionsService.complete(id);
      router.push("/progress");
    } catch (err) {
      setActionError(toMessage(err));
      setFinishing(false);
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <Card padding="lg" className="flex flex-col items-start gap-2">
          <p className="font-medium text-text-primary">Sessão não encontrada</p>
          <CardDescription>Ela pode ter sido removida.</CardDescription>
          <Link href="/workouts" className="text-sm font-medium text-accent">
            Ver meus treinos →
          </Link>
        </Card>
      </div>
    );
  }

  if (session === null) {
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
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        )}
      </div>
    );
  }

  const active = exercises.find((ex) => ex.key === openExercise) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      {/* Live header: title + progress bar + finish */}
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-accent">
              Treino em andamento
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
          </div>
          {!finished ? (
            <Button
              type="button"
              isLoading={finishing}
              loadingText="Encerrando"
              onClick={() => void onFinish()}
              disabled={done === 0}
            >
              Encerrar treino
            </Button>
          ) : null}
        </div>

        <ProgressBar done={done} total={total} />
      </header>

      {finished ? (
        <Card padding="lg" className="flex flex-col items-start gap-2">
          <p className="font-medium text-success-text">Treino concluído! 💪</p>
          <CardDescription>Ele já está no seu histórico e contou para o seu streak.</CardDescription>
          <Link href="/progress" className="text-sm font-medium text-accent">
            Ver progresso →
          </Link>
        </Card>
      ) : (
        <>
          {/* Exercise list — tap one to open its set panel */}
          <ul className="flex flex-col gap-3">
            {exercises.map((ex, i) => {
              const exDone = ex.sets.filter((s) => s.completed).length;
              const allDone = ex.sets.length > 0 && exDone === ex.sets.length;
              return (
                <li key={ex.key}>
                  <button
                    type="button"
                    onClick={() => setOpenExercise(ex.key)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-4 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
                      allDone
                        ? "border-success-border bg-success-surface"
                        : "border-border-subtle bg-surface-raised hover:border-border hover:bg-surface-overlay",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-semibold",
                          allDone ? "bg-success-solid text-white" : "bg-accent-subtle text-accent",
                        )}
                      >
                        {allDone ? "✓" : i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-primary">{ex.exerciseName}</p>
                        <p className="text-sm text-text-tertiary">
                          {exDone}/{ex.sets.length} séries
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-accent">
                      {exDone === 0 ? "Começar →" : allDone ? "Revisar" : "Continuar →"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <Input
            label="Observações do treino"
            placeholder="Como foi o treino?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => void persist(exercises, notes)}
          />

          {actionError ? (
            <p
              role="alert"
              className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
            >
              {actionError}
            </p>
          ) : null}
        </>
      )}

      {/* Per-exercise set panel (overlay) */}
      {active ? (
        <ExercisePanel
          exercise={active}
          onChange={(sets) => setExerciseSets(active.key, sets)}
          onClose={() => {
            setOpenExercise(null);
            void persist(exercises, notes);
          }}
        />
      ) : null}
    </div>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm text-text-tertiary">
        <span>
          {done} de {total} séries concluídas
        </span>
        <span className="font-medium text-text-secondary">{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do treino"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-base ease-standard"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Overlay panel for a single exercise: check off each set as it's done, with the
 * real reps/load confirmed per set. This is the "I'm training right now" moment —
 * one exercise at a time, sets front and center.
 */
function ExercisePanel({
  exercise,
  onChange,
  onClose,
}: {
  exercise: DraftExercise;
  onChange: (sets: DraftSet[]) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function mutate(setKey: string, patch: Partial<DraftSet>) {
    onChange(exercise.sets.map((s) => (s.key === setKey ? { ...s, ...patch } : s)));
  }

  function addSet() {
    const last = exercise.sets[exercise.sets.length - 1];
    onChange([
      ...exercise.sets,
      {
        key: nextKey(),
        reps: last?.reps ?? "10",
        weight: last?.weight ?? "",
        unit: last?.unit ?? "kg",
        completed: false,
        rpe: "",
        notes: "",
      },
    ]);
  }

  const doneCount = exercise.sets.filter((s) => s.completed).length;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Séries de ${exercise.exerciseName}`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex max-h-[88vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-t-2xl border border-border-subtle bg-surface-base p-5 outline-none sm:rounded-2xl",
          "shadow-[var(--atlas-elevation-lg)]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{exercise.exerciseName}</h2>
            <p className="text-sm text-text-tertiary">
              {doneCount}/{exercise.sets.length} séries concluídas
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Fechar">
            ✕
          </Button>
        </div>

        {exercise.sets.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            Este exercício não tem séries planejadas. Adicione uma para registrar.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {exercise.sets.map((s, i) => (
              <li
                key={s.key}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-3 transition-colors",
                  s.completed
                    ? "border-success-border bg-success-surface"
                    : "border-border-subtle bg-surface-overlay",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-secondary">Série {i + 1}</span>
                  {s.rpe.trim() ? (
                    <span className="text-xs text-text-tertiary">RPE {s.rpe}</span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Input
                    label="Reps"
                    type="number"
                    min={1}
                    max={1000}
                    inputMode="numeric"
                    value={s.reps}
                    onChange={(e) => mutate(s.key, { reps: e.target.value })}
                  />
                  <Input
                    label="Peso"
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    placeholder="corpo"
                    value={s.weight}
                    onChange={(e) => mutate(s.key, { weight: e.target.value })}
                  />
                  <Input
                    label={`RPE ${RPE_MIN}-${RPE_MAX}`}
                    type="number"
                    min={RPE_MIN}
                    max={RPE_MAX}
                    inputMode="numeric"
                    placeholder="—"
                    value={s.rpe}
                    onChange={(e) => mutate(s.key, { rpe: e.target.value })}
                  />
                  <Input
                    label="Nota"
                    placeholder="opcional"
                    value={s.notes}
                    onChange={(e) => mutate(s.key, { notes: e.target.value })}
                  />
                </div>

                <Button
                  type="button"
                  variant={s.completed ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => mutate(s.key, { completed: !s.completed })}
                  className="w-full"
                >
                  {s.completed ? "✓ Série concluída — desfazer" : "Concluir série"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={addSet}>
            + Adicionar série
          </Button>
          <Button type="button" size="sm" onClick={onClose} className="ml-auto">
            Concluir exercício
          </Button>
        </div>
      </div>
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

function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.problem.detail;
  return "Algo deu errado. Tente novamente.";
}
