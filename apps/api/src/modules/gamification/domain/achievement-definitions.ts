/**
 * Static achievement (milestone) definitions (blueprint/09 "Marcos", ADR-0006).
 * Each milestone unlocks once when its condition is met; the unlock is a dated
 * fact of the journey and is persisted. Definitions live in code (doc 23);
 * adding more is additive — past unlocks remain valid.
 *
 * A condition is expressed over derived counts the engine already computes:
 * total completed workouts, total measurement days, and the longest streak.
 */
export type AchievementMetric = "workouts" | "measurements" | "longestStreak";

export interface AchievementDefinition {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly metric: AchievementMetric;
  /** Unlocks when the metric reaches (>=) this threshold. */
  readonly threshold: number;
}

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  {
    key: "first_workout",
    title: "Primeiro passo",
    description: "Conclua seu primeiro treino.",
    metric: "workouts",
    threshold: 1,
  },
  {
    key: "ten_workouts",
    title: "Pegando ritmo",
    description: "Conclua 10 treinos.",
    metric: "workouts",
    threshold: 10,
  },
  {
    key: "fifty_workouts",
    title: "Disciplina de ferro",
    description: "Conclua 50 treinos.",
    metric: "workouts",
    threshold: 50,
  },
  {
    key: "hundred_workouts",
    title: "Centurião",
    description: "Conclua 100 treinos.",
    metric: "workouts",
    threshold: 100,
  },
  {
    key: "first_measurement",
    title: "Linha de base",
    description: "Registre seu progresso pela primeira vez.",
    metric: "measurements",
    threshold: 1,
  },
  {
    key: "streak_7",
    title: "Uma semana firme",
    description: "Mantenha uma sequência de 7 dias ativos.",
    metric: "longestStreak",
    threshold: 7,
  },
  {
    key: "streak_30",
    title: "Hábito construído",
    description: "Mantenha uma sequência de 30 dias ativos.",
    metric: "longestStreak",
    threshold: 30,
  },
];
