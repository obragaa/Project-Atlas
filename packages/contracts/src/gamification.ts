/**
 * Gamification transport contract (blueprint/09 - Gamification.md, 07, 14).
 * Streak, missions (daily/weekly), and achievements (milestones). Everything is
 * read-only over the wire — it derives from real actions (ADR-0006). No
 * ranking, no comparison (doc 09 ethics).
 */

/** Consecutive-days streak, based on relevant actions (doc 09 "Streak"). */
export interface StreakView {
  readonly current: number;
  readonly longest: number;
  /** Whether the user has already been active today. */
  readonly activeToday: boolean;
}

export const MISSION_PERIODS = ["daily", "weekly"] as const;
export type MissionPeriod = (typeof MISSION_PERIODS)[number];

/** A mission with the user's progress in the current period. */
export interface MissionView {
  readonly key: string;
  readonly period: MissionPeriod;
  readonly title: string;
  readonly description: string;
  /** Current count toward the target, in the active period. */
  readonly progress: number;
  readonly target: number;
  readonly completed: boolean;
}

/** A milestone achievement and whether the user has unlocked it. */
export interface AchievementView {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  /** ISO timestamp of when it was unlocked, or null if still locked. */
  readonly unlockedAt: string | null;
}

/** The combined gamification snapshot for the journey screen / dashboard. */
export interface GamificationOverview {
  readonly streak: StreakView;
  readonly missions: readonly MissionView[];
  readonly achievements: readonly AchievementView[];
  /** Convenience counts for compact displays. */
  readonly unlockedCount: number;
  readonly totalAchievements: number;
}
