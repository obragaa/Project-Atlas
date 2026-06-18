import { Inject, Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../shared/database/database-connection.js";
import { DRIZZLE } from "../../../shared/database/database.tokens.js";
import { users } from "../../../shared/database/schema/index.js";
import { type UserRepository } from "../domain/ports.js";
import { type User } from "../domain/user.js";
import { type UserId } from "../domain/user-id.js";
import { type Email } from "../domain/value-objects/email.js";
import { userMapper } from "./persistence/user.mapper.js";

/**
 * PostgreSQL `UserRepository` (blueprint/12, 13). Drizzle is confined here.
 *
 * - Email lookups hit the unique `lower(email)` index (the Email VO already
 *   lowercases, so a direct equality on the normalized value uses the index).
 * - `save` is an idempotent UPSERT on the opaque id (doc 13 idempotency);
 *   uniqueness of email is additionally guarded at the use-case level.
 * - No `SELECT *`: Drizzle selects the table's declared columns; the mapper
 *   never leaks `passwordHash` into transport (session.mapper excludes it).
 */
@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async findById(id: UserId): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id.toString())).limit(1);
    const row = rows.at(0);
    return row ? userMapper.toDomain(row) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(sql`lower(${users.email})`, email.value))
      .limit(1);
    const row = rows.at(0);
    return row ? userMapper.toDomain(row) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(sql`lower(${users.email})`, email.value))
      .limit(1);
    return rows.length > 0;
  }

  async save(user: User): Promise<void> {
    const row = userMapper.toPersistence(user);
    await this.db
      .insert(users)
      .values(row)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: row.email,
          passwordHash: row.passwordHash,
          displayName: row.displayName,
          roles: row.roles,
          updatedAt: new Date(),
        },
      });
  }
}
