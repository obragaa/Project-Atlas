import { Inject, Injectable } from "@nestjs/common";
import {
  type AchievementView,
  type GamificationOverview,
  type MissionView,
} from "@atlas/contracts";
import {
  ACHIEVEMENT_UNLOCK_REPOSITORY,
  ACTIVITY_REPOSITORY,
  type AchievementUnlockRepository,
  type ActivityRepository,
} from "../domain/gamification.repository.js";
import { computeStreak } from "../domain/streak.js";
import { MISSION_DEFINITIONS } from "../domain/mission-definitions.js";
import { ACHIEVEMENT_DEFINITIONS } from "../domain/achievement-definitions.js";
import { dayRange, weekRange } from "../domain/period-range.js";

export interface GetOverviewQuery {
  readonly userId: string;
  /** Today's calendar date (injected by the controller for testability). */
  readonly today: Date;
}

/**
 * Builds the combined gamification snapshot (blueprint/09, ADR-0006): streak,
 * mission progress in the current periods, and achievement unlock state. All
 * derived on read from this module's own activity log + unlock store.
 */
@Injectable()
export class GetOverviewUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY) private readonly activities: ActivityRepository,
    @Inject(ACHIEVEMENT_UNLOCK_REPOSITORY)
    private readonly unlocks: AchievementUnlockRepository,
  ) {}

  async execute(query: GetOverviewQuery): Promise<GamificationOverview> {
    const todayIso = query.today.toISOString().slice(0, 10);

    const dates = await this.activities.activeDates(query.userId);
    const streak = computeStreak(dates, todayIso);

    const missions = await this.buildMissions(query.userId, todayIso);
    const achievements = await this.buildAchievements(query.userId);
    const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;

    return {
      streak,
      missions,
      achievements,
      unlockedCount,
      totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
    };
  }

  private async buildMissions(userId: string, todayIso: string): Promise<MissionView[]> {
    const day = dayRange(todayIso);
    const week = weekRange(todayIso);

    return Promise.all(
      MISSION_DEFINITIONS.map(async (def): Promise<MissionView> => {
        const range = def.period === "daily" ? day : week;
        const raw = await this.activities.countInRange(
          userId,
          def.kind,
          range.fromIso,
          range.toIso,
        );
        const progress = Math.min(raw, def.target);
        return {
          key: def.key,
          period: def.period,
          title: def.title,
          description: def.description,
          progress,
          target: def.target,
          completed: progress >= def.target,
        };
      }),
    );
  }

  private async buildAchievements(userId: string): Promise<AchievementView[]> {
    const unlocked = await this.unlocks.listForUser(userId);
    const byKey = new Map(unlocked.map((u) => [u.achievementKey, u.unlockedAt]));

    return ACHIEVEMENT_DEFINITIONS.map((def): AchievementView => {
      const at = byKey.get(def.key);
      return {
        key: def.key,
        title: def.title,
        description: def.description,
        unlockedAt: at ? at.toISOString() : null,
      };
    });
  }
}
