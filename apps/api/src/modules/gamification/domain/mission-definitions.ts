import { type MissionPeriod } from "@atlas/contracts";
import { type ActivityKind } from "./activity.js";

/**
 * Static mission definitions (blueprint/09 "Sistema de Missões", ADR-0006).
 * Daily/weekly objectives that reward consistency. Progress is the count of the
 * given activity kind within the current period; there is no stored state — a
 * new period simply recounts (implicit reset). Definitions live in code,
 * versioned with it (doc 23).
 *
 * Ethics (doc 09): every mission rewards a healthy, real action; copy is
 * encouraging, never guilt-based.
 */
export interface MissionDefinition {
  readonly key: string;
  readonly period: MissionPeriod;
  readonly title: string;
  readonly description: string;
  /** The activity that counts toward this mission. */
  readonly kind: ActivityKind;
  /** How many of that activity (in the period) completes the mission. */
  readonly target: number;
}

export const MISSION_DEFINITIONS: readonly MissionDefinition[] = [
  {
    key: "daily_workout",
    period: "daily",
    title: "Treino do dia",
    description: "Conclua um treino hoje.",
    kind: "workout_completed",
    target: 1,
  },
  {
    key: "daily_progress",
    period: "daily",
    title: "Acompanhe sua evolução",
    description: "Registre seu peso ou medidas hoje.",
    kind: "measurement_recorded",
    target: 1,
  },
  {
    key: "weekly_three_workouts",
    period: "weekly",
    title: "Constância da semana",
    description: "Conclua três treinos nesta semana.",
    kind: "workout_completed",
    target: 3,
  },
  {
    key: "weekly_progress",
    period: "weekly",
    title: "Evolução registrada",
    description: "Registre seu progresso ao menos uma vez nesta semana.",
    kind: "measurement_recorded",
    target: 1,
  },
];
