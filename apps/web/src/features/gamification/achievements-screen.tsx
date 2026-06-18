"use client";

import { type SVGProps, useEffect, useState } from "react";
import {
  type AchievementView,
  type GamificationOverview,
  type MissionPeriod,
  type MissionView,
} from "@atlas/contracts";
import { Card, Skeleton, cn } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { gamificationService } from "@/services/gamification.service";

/**
 * Conquistas — the gamification journey screen (blueprint/09): streak, missions
 * (daily/weekly) and achievement milestones. Tone celebrates progress and never
 * guilts (doc 09 ethics): no streak ever produces pressure, only encouragement.
 */
export function AchievementsScreen() {
  const [overview, setOverview] = useState<GamificationOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    gamificationService
      .overview()
      .then((data) => active && setOverview(data))
      .catch((err: unknown) => active && setError(toMessage(err)));
    return () => {
      active = false;
    };
  }, []);

  const daily = overview?.missions.filter((m) => m.period === "daily") ?? [];
  const weekly = overview?.missions.filter((m) => m.period === "weekly") ?? [];

  return (
    <div className="flex flex-col gap-8" style={{ animation: "atlas-fade-in 0.5s ease-out both" }}>
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Conquistas</h1>
        <p className="text-text-secondary">Sua jornada de consistência.</p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
        >
          {error}
        </p>
      ) : null}

      {/* 1 — Streak hero */}
      {overview === null ? (
        <Skeleton className="h-44 w-full rounded-2xl" />
      ) : (
        <StreakHero
          current={overview.streak.current}
          longest={overview.streak.longest}
          activeToday={overview.streak.activeToday}
        />
      )}

      {/* 2 — Missions */}
      <section className="flex flex-col gap-6">
        <MissionGroup
          title="Missões diárias"
          period="daily"
          missions={overview === null ? null : daily}
        />
        <MissionGroup
          title="Missões semanais"
          period="weekly"
          missions={overview === null ? null : weekly}
        />
      </section>

      {/* 3 — Achievements */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            Conquistas
          </h2>
          {overview === null ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <span className="text-sm font-medium text-accent">
              {overview.unlockedCount}/{overview.totalAchievements} conquistas
            </span>
          )}
        </div>
        {overview === null ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : overview.achievements.length === 0 ? (
          <Card padding="lg" className="rounded-2xl border-dashed">
            <p className="text-sm text-text-secondary">
              As conquistas vão aparecer aqui conforme você treina. Bora começar! 💪
            </p>
          </Card>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {overview.achievements.map((achievement) => (
              <AchievementTile key={achievement.key} achievement={achievement} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ── Streak ────────────────────────────────────────────────────────────────────

function StreakHero({
  current,
  longest,
  activeToday,
}: {
  current: number;
  longest: number;
  activeToday: boolean;
}) {
  const started = current > 0;
  return (
    <section className="relative">
      {/* Decorative pulsing glow behind the card (not the content). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl bg-accent/30 blur-md motion-reduce:hidden"
        style={{ animation: "atlas-pulse-glow 4s ease-in-out infinite" }}
      />
      <Card
        padding="lg"
        className="relative flex flex-col items-center gap-4 rounded-2xl border-accent/40 bg-accent-subtle text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left"
      >
        <span className="text-6xl leading-none sm:text-7xl" role="img" aria-label="Sequência">
          🔥
        </span>
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tabular-nums text-accent">{current}</span>
            <span className="text-lg font-medium text-text-secondary">
              {current === 1 ? "dia seguido" : "dias seguidos"}
            </span>
          </div>
          {started ? (
            <p className="text-sm text-text-tertiary">
              Recorde: {longest} {longest === 1 ? "dia" : "dias"}
            </p>
          ) : (
            <p className="text-sm text-text-secondary">Comece hoje a sua sequência! ✨</p>
          )}
          <div className="mt-1">
            {activeToday ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-surface px-3 py-1 text-xs font-medium text-success-text">
                Ativo hoje ✓
              </span>
            ) : started ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-overlay px-3 py-1 text-xs font-medium text-text-secondary">
                Treine hoje para manter o ritmo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-surface-overlay px-3 py-1 text-xs font-medium text-accent">
                Cada dia conta 💪
              </span>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}

// ── Missions ────────────────────────────────────────────────────────────────────

function MissionGroup({
  title,
  period,
  missions,
}: {
  title: string;
  period: MissionPeriod;
  missions: MissionView[] | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">{title}</h2>
      {missions === null ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : missions.length === 0 ? (
        <Card padding="md" className="rounded-2xl border-dashed">
          <p className="text-sm text-text-secondary">
            {period === "daily"
              ? "Nenhuma missão diária por agora. Volte amanhã!"
              : "Nenhuma missão semanal por agora."}
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {missions.map((mission) => (
            <li key={mission.key}>
              <MissionRow mission={mission} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MissionRow({ mission }: { mission: MissionView }) {
  const pct =
    mission.target > 0
      ? Math.min(100, Math.round((mission.progress / mission.target) * 100))
      : mission.completed
        ? 100
        : 0;
  return (
    <Card
      padding="md"
      className={cn(
        "flex flex-col gap-3 rounded-2xl",
        mission.completed && "border-success-border bg-success-surface",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "font-semibold text-text-primary",
              mission.completed && "text-success-text",
            )}
          >
            {mission.title}
          </p>
          <p className="text-sm text-text-tertiary">{mission.description}</p>
        </div>
        {mission.completed ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success-border bg-success-surface px-2.5 py-1 text-xs font-medium text-success-text">
            <CheckIcon className="h-3.5 w-3.5" /> Concluída
          </span>
        ) : (
          <span className="shrink-0 text-sm font-medium tabular-nums text-text-secondary">
            {mission.progress}/{mission.target}
          </span>
        )}
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso da missão ${mission.title}`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-base",
            mission.completed ? "bg-success-text" : "bg-accent",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}

// ── Achievements ────────────────────────────────────────────────────────────────

function AchievementTile({ achievement }: { achievement: AchievementView }) {
  const unlocked = achievement.unlockedAt !== null;
  return (
    <li
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-colors",
        unlocked
          ? "border-accent/40 bg-accent-subtle"
          : "border-border-subtle bg-surface-raised opacity-60",
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          unlocked ? "bg-accent text-on-accent" : "bg-surface-overlay text-text-tertiary",
        )}
      >
        {unlocked ? <MedalIcon className="h-7 w-7" /> : <LockIcon className="h-6 w-6" />}
      </span>
      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "text-sm font-semibold",
            unlocked ? "text-text-primary" : "text-text-tertiary",
          )}
        >
          {achievement.title}
        </p>
        <p className="text-xs text-text-tertiary">{achievement.description}</p>
      </div>
      {unlocked ? (
        <span className="mt-auto inline-flex items-center gap-1 rounded-full border border-accent/40 bg-surface-overlay px-2.5 py-1 text-xs font-medium text-accent">
          Conquistado · {formatDate(achievement.unlockedAt)}
        </span>
      ) : (
        <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-text-tertiary">
          <LockIcon className="h-3 w-3" /> A conquistar
        </span>
      )}
    </li>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

function toMessage(err: unknown): string {
  return err instanceof ApiError ? err.problem.detail : "Algo deu errado. Tente novamente.";
}

// ── Inline icons (stroke=currentColor, blueprint/05 iconography) ──────────────

function MedalIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M7.5 2h9l-3 6h-3z" />
      <circle cx="12" cy="15" r="6" />
      <path d="m12 12 1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 18l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z" />
    </svg>
  );
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
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
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}
