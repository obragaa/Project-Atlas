"use client";

import { type ComponentType, type SVGProps, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type WorkoutSummaryView } from "@atlas/contracts";
import { Button, Card, Skeleton, cn } from "@atlas/ui";
import { useAuth } from "@/features/auth/auth-context";
import { workoutsService } from "@/services/workouts.service";
import { exercisesService } from "@/services/exercises.service";
import { HERO_IMAGES, MUSCLE_IMAGES } from "@/features/media/fitness-images";

/** The Core dashboard (blueprint/07 "Core", 03): greeting, summary, shortcuts. */
export function Dashboard() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSummaryView[] | null>(null);
  const [exerciseCount, setExerciseCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    workoutsService
      .list()
      .then((page) => active && setWorkouts([...page.items]))
      .catch(() => active && setWorkouts([]));
    exercisesService
      .list({})
      .then((page) => active && setExerciseCount(page.items.length))
      .catch(() => active && setExerciseCount(0));
    return () => {
      active = false;
    };
  }, []);

  const total = workouts?.length ?? 0;
  const completed = workouts?.filter((w) => w.status === "completed").length ?? 0;
  const open = total - completed;
  const next = workouts?.find((w) => w.status !== "completed") ?? null;
  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? "atleta";

  return (
    <div className="flex flex-col gap-8" style={{ animation: "atlas-fade-in 0.5s ease-out both" }}>
      {/* 1 — Welcome banner */}
      <section className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-border-subtle sm:h-[260px]">
        <Image
          src={HERO_IMAGES.dashboard}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark gradient overlay for readable text. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(6,8,12,0.92) 0%, rgba(6,8,12,0.78) 38%, rgba(6,8,12,0.32) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-center gap-3 p-6 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">{greeting()}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Olá, {firstName} 👋
          </h1>
          <p className="max-w-md text-text-secondary">
            Cada repetição conta. Bora transformar esforço em progresso hoje.
          </p>
          <div className="mt-2">
            <Link href="/workouts">
              <Button size="lg">Montar treino</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2 — Stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={DumbbellIcon}
          label="Total de treinos"
          value={workouts === null ? null : total}
          accent
        />
        <Stat icon={ClockIcon} label="Em aberto" value={workouts === null ? null : open} />
        <Stat icon={CheckIcon} label="Concluídos" value={workouts === null ? null : completed} />
        <Stat icon={LibraryIcon} label="Exercícios no catálogo" value={exerciseCount} />
      </section>

      {/* 3 — Next workout */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Próximo treino
        </h2>
        {workouts === null ? (
          <Skeleton className="h-28 w-full rounded-2xl" />
        ) : next ? (
          <div className="relative">
            {/* Decorative pulsing glow behind the card (not the content). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-2xl bg-accent/40 blur-md motion-reduce:hidden"
              style={{ animation: "atlas-pulse-glow 4s ease-in-out infinite" }}
            />
            <Card
              padding="lg"
              className="relative flex flex-col gap-5 rounded-2xl border-accent/40 bg-accent-subtle sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-on-accent">
                  <DumbbellIcon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">
                    Continuar de onde parou
                  </p>
                  <p className="text-xl font-semibold text-text-primary">{next.name}</p>
                  <p className="text-sm text-text-tertiary">
                    {next.itemCount} {next.itemCount === 1 ? "exercício" : "exercícios"}
                    {next.status === "active" ? " · em andamento" : " · rascunho"}
                  </p>
                </div>
              </div>
              <Link href={`/workouts/${next.id}`} className="sm:shrink-0">
                <Button size="lg" fullWidth>
                  Abrir
                </Button>
              </Link>
            </Card>
          </div>
        ) : (
          <Card padding="lg" className="flex flex-col items-start gap-3 rounded-2xl border-dashed">
            <p className="text-lg font-medium text-text-primary">Nenhum treino em aberto 💪</p>
            <p className="text-text-secondary">
              Comece a sua jornada montando o primeiro treino agora mesmo.
            </p>
            <Link href="/workouts" className="mt-1">
              <Button size="lg">Criar treino</Button>
            </Link>
          </Card>
        )}
      </section>

      {/* 4 — Quick actions */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Atalhos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickAction
            href="/workouts"
            title="Meus treinos"
            description="Crie, organize e conclua seus treinos."
            image={MUSCLE_IMAGES.fullBody}
            icon={DumbbellIcon}
          />
          <QuickAction
            href="/exercises"
            title="Biblioteca de exercícios"
            description="Explore o catálogo com busca e filtros."
            image={MUSCLE_IMAGES.chest}
            icon={LibraryIcon}
          />
          <QuickAction
            href="/progress"
            title="Meu progresso"
            description="Registre peso e medidas e veja sua evolução."
            image={MUSCLE_IMAGES.core}
            icon={TrendingIcon}
          />
        </div>
      </section>
    </div>
  );
}

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: IconType;
  label: string;
  value: number | null;
  accent?: boolean;
}) {
  return (
    <Card padding="md" className="flex flex-col gap-3 rounded-2xl">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          accent ? "bg-accent text-on-accent" : "bg-accent-subtle text-accent",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-text-tertiary">{label}</span>
        {value === null ? (
          <Skeleton className="h-9 w-12" />
        ) : (
          <span
            className={cn(
              "text-3xl font-semibold sm:text-4xl",
              accent ? "text-accent" : "text-text-primary",
            )}
          >
            {value}
          </span>
        )}
      </div>
    </Card>
  );
}

function QuickAction({
  href,
  title,
  description,
  image,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  image: string;
  icon: IconType;
}) {
  return (
    <Link href={href} className="group block">
      <Card
        interactive
        padding="none"
        className="flex h-full items-stretch overflow-hidden rounded-2xl"
      >
        <div className="relative w-24 shrink-0 overflow-hidden sm:w-28">
          <Image
            src={image}
            alt=""
            fill
            sizes="112px"
            className="object-cover transition-transform duration-base group-hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(6,8,12,0.15) 0%, rgba(6,8,12,0.55) 60%, var(--atlas-surface-raised) 100%)",
            }}
          />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 p-5">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-accent" />
            <p className="font-semibold text-text-primary">{title}</p>
          </div>
          <p className="text-sm text-text-secondary">{description}</p>
          <span className="mt-2 inline-block text-sm font-medium text-accent">Abrir →</span>
        </div>
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

// ── Inline icons (stroke=currentColor, blueprint/05 iconography) ──────────────

function DumbbellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  );
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21.5 12a9.5 9.5 0 1 1-5.2-8.46" />
      <path d="m8.5 11.5 3 3 8-8.5" />
    </svg>
  );
}

function LibraryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 4v16" />
      <path d="M8 4v16" />
      <path d="m12.5 4.5 3.5-.8 3 14.6-3.5.8z" />
      <path d="M8 19H4" />
      <path d="M8 5H4" />
    </svg>
  );
}

function TrendingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M17 7h4v4" />
    </svg>
  );
}
