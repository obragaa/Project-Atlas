"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type ExerciseView } from "@atlas/contracts";
import { Card, Skeleton, cn } from "@atlas/ui";
import { exercisesService } from "@/services/exercises.service";
import { EQUIPMENT_LABELS, MUSCLE_LABELS } from "./labels";

/**
 * Detail screen (blueprint/07 "Exercícios"): the full view of a single curated
 * exercise — worked muscles, instructions, tips and variations.
 */
export function ExerciseDetail({ slug }: { slug: string }) {
  const [exercise, setExercise] = useState<ExerciseView | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setExercise(null);
    setNotFound(false);
    exercisesService
      .get(slug)
      .then((view) => {
        if (!controller.signal.aborted) setExercise(view);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        // 404 (or any failure to resolve) → the friendly "não encontrado" view.
        // A 401 is handled centrally by the auth context (redirect).
        void err;
        setNotFound(true);
      });
    return () => controller.abort();
  }, [slug]);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/exercises"
        className="inline-flex w-fit items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-secondary"
      >
        ← Exercícios
      </Link>

      {notFound ? <NotFound /> : exercise === null ? <Loading /> : <Loaded exercise={exercise} />}
    </div>
  );
}

function Loaded({ exercise }: { exercise: ExerciseView }) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">{exercise.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Pill accent>{MUSCLE_LABELS[exercise.primaryMuscle]}</Pill>
          <Pill>{EQUIPMENT_LABELS[exercise.equipment]}</Pill>
        </div>
      </header>

      <Section title="Músculos trabalhados">
        <div className="flex flex-wrap gap-2">
          {exercise.muscles.map((m) => (
            <Pill key={m} accent={m === exercise.primaryMuscle}>
              {MUSCLE_LABELS[m]}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Instruções">
        <Card padding="lg">
          <p className="whitespace-pre-line leading-relaxed text-text-secondary">
            {exercise.instructions}
          </p>
        </Card>
      </Section>

      {exercise.tips.length > 0 ? (
        <Section title="Dicas">
          <Card padding="lg">
            <ul className="flex flex-col gap-2">
              {exercise.tips.map((tip) => (
                <li key={tip} className="flex gap-2 text-text-secondary">
                  <span aria-hidden="true" className="mt-1 text-accent">
                    •
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      ) : null}

      {exercise.variations.length > 0 ? (
        <Section title="Variações">
          <div className="flex flex-wrap gap-2">
            {exercise.variations.map((variation) => (
              <Pill key={variation}>{variation}</Pill>
            ))}
          </div>
        </Section>
      ) : null}
    </article>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

function NotFound() {
  return (
    <Card padding="lg" className="flex flex-col items-start gap-3">
      <p className="text-lg font-medium text-text-primary">Exercício não encontrado</p>
      <p className="text-sm text-text-secondary">
        Não conseguimos localizar esse exercício. Ele pode ter sido removido do catálogo.
      </p>
      <Link href="/exercises" className="text-sm font-medium text-accent hover:underline">
        ← Voltar para os exercícios
      </Link>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">{title}</h2>
      {children}
    </section>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        accent ? "bg-accent-subtle text-accent" : "bg-surface-overlay text-text-secondary",
      )}
    >
      {children}
    </span>
  );
}
