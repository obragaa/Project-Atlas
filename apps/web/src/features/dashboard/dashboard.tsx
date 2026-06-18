"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type WorkoutSummaryView } from "@atlas/contracts";
import { Button, Card, Skeleton, cn } from "@atlas/ui";
import { useAuth } from "@/features/auth/auth-context";
import { workoutsService } from "@/services/workouts.service";

/** The Core dashboard (blueprint/07 "Core", 03): greeting, summary, shortcuts. */
export function Dashboard() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSummaryView[] | null>(null);

  useEffect(() => {
    workoutsService
      .list()
      .then((page) => setWorkouts([...page.items]))
      .catch(() => setWorkouts([]));
  }, []);

  const total = workouts?.length ?? 0;
  const completed = workouts?.filter((w) => w.status === "completed").length ?? 0;
  const active = total - completed;
  const next = workouts?.find((w) => w.status !== "completed") ?? null;
  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? "atleta";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-text-tertiary">{greeting()}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Olá, {firstName} 👋
        </h1>
        <p className="text-text-secondary">Pronto para evoluir hoje? Aqui está o seu resumo.</p>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Treinos" value={workouts === null ? null : total} accent />
        <Stat label="Em aberto" value={workouts === null ? null : active} />
        <Stat label="Concluídos" value={workouts === null ? null : completed} />
      </section>

      {/* Next workout */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Próximo treino
        </h2>
        {workouts === null ? (
          <Skeleton className="h-24 w-full" />
        ) : next ? (
          <Card padding="lg" className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-medium text-text-primary">{next.name}</p>
              <p className="text-sm text-text-tertiary">
                {next.itemCount} {next.itemCount === 1 ? "exercício" : "exercícios"}
              </p>
            </div>
            <Link href="/workouts">
              <Button>Abrir treinos</Button>
            </Link>
          </Card>
        ) : (
          <Card padding="lg" className="flex flex-col items-start gap-3">
            <p className="text-text-secondary">
              Você ainda não tem treinos em aberto. Que tal montar o primeiro?
            </p>
            <Link href="/workouts">
              <Button>Criar treino</Button>
            </Link>
          </Card>
        )}
      </section>

      {/* Shortcuts */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Atalhos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ShortcutCard
            href="/workouts"
            title="Meus treinos"
            description="Crie, organize e conclua seus treinos."
          />
          <ShortcutCard
            href="/exercises"
            title="Biblioteca de exercícios"
            description="Explore o catálogo com busca e filtros."
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | null; accent?: boolean }) {
  return (
    <Card padding="md" className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-text-tertiary">{label}</span>
      {value === null ? (
        <Skeleton className="h-9 w-12" />
      ) : (
        <span
          className={cn("text-3xl font-semibold", accent ? "text-accent" : "text-text-primary")}
        >
          {value}
        </span>
      )}
    </Card>
  );
}

function ShortcutCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card interactive padding="lg" className="h-full">
        <p className="font-medium text-text-primary">{title}</p>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
        <span className="mt-3 inline-block text-sm font-medium text-accent">Abrir →</span>
      </Card>
    </Link>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
