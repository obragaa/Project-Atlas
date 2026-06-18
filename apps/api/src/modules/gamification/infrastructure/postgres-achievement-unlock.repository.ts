import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../shared/database/database-connection.js";
import { DRIZZLE } from "../../../shared/database/database.tokens.js";
import { achievementUnlocks } from "../../../shared/database/schema/index.js";
import {
  type AchievementUnlock,
  type AchievementUnlockRepository,
} from "../domain/gamification.repository.js";

/**
 * PostgreSQL achievement-unlock store (blueprint/12, 13). Drizzle is confined
 * here. `unlock` is idempotent on (user, key) so re-evaluating after an event
 * never duplicates a milestone.
 */
@Injectable()
export class PostgresAchievementUnlockRepository implements AchievementUnlockRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async unlock(userId: string, achievementKey: string, when: Date): Promise<void> {
    await this.db
      .insert(achievementUnlocks)
      .values({ userId, achievementKey, unlockedAt: when })
      .onConflictDoNothing({
        target: [achievementUnlocks.userId, achievementUnlocks.achievementKey],
      });
  }

  async listForUser(userId: string): Promise<readonly AchievementUnlock[]> {
    const rows = await this.db
      .select()
      .from(achievementUnlocks)
      .where(eq(achievementUnlocks.userId, userId));
    return rows.map((r) => ({ achievementKey: r.achievementKey, unlockedAt: r.unlockedAt }));
  }
}
