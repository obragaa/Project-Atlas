import { type ActivityEntry, type ActivityKind } from "./activity.js";

/**
 * Gamification persistence ports (blueprint/12 Dependency Rule, 13 Ownership).
 * The module owns its activity log and achievement unlocks; it reads nothing
 * from other modules' tables (ADR-0006).
 */
export const ACTIVITY_REPOSITORY = Symbol("ACTIVITY_REPOSITORY");
export const ACHIEVEMENT_UNLOCK_REPOSITORY = Symbol("ACHIEVEMENT_UNLOCK_REPOSITORY");

/** Per-user activity counts the streak/mission/achievement logic derives from. */
export interface ActivityCounts {
  readonly workouts: number;
  readonly measurements: number;
}

export interface ActivityRepository {
  /** Append an activity; idempotent on (user, date, kind) — replays are safe. */
  append(entry: ActivityEntry): Promise<void>;
  /** Distinct calendar dates the user was active (any kind), for the streak. */
  activeDates(userId: string): Promise<readonly string[]>;
  /** Total counts per kind for the user (drives achievements). */
  counts(userId: string): Promise<ActivityCounts>;
  /** Count of a kind within an inclusive date range (drives mission progress). */
  countInRange(userId: string, kind: ActivityKind, fromIso: string, toIso: string): Promise<number>;
}

/** A persisted achievement unlock — a dated fact of the journey (doc 09). */
export interface AchievementUnlock {
  readonly achievementKey: string;
  readonly unlockedAt: Date;
}

export interface AchievementUnlockRepository {
  /** Unlock once; idempotent on (user, achievementKey). */
  unlock(userId: string, achievementKey: string, when: Date): Promise<void>;
  /** Every unlock for the user. */
  listForUser(userId: string): Promise<readonly AchievementUnlock[]>;
}
