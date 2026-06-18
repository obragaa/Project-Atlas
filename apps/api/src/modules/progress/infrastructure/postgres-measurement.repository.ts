import { Inject, Injectable } from "@nestjs/common";
import { and, asc, desc, eq, lt, or } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../shared/database/database-connection.js";
import { DRIZZLE } from "../../../shared/database/database.tokens.js";
import { measurements } from "../../../shared/database/schema/index.js";
import {
  type ListMeasurementsParams,
  type MeasurementPage,
  type MeasurementRepository,
} from "../domain/measurement.repository.js";
import { type MeasurementEntry } from "../domain/measurement-entry.js";
import { type MeasurementId } from "../domain/measurement-id.js";
import { measurementToDomain, measurementToPersistence } from "./persistence/measurement.mapper.js";
import { decodeCursor, encodeCursor } from "./measurement-cursor.js";

/**
 * PostgreSQL `MeasurementRepository` (blueprint/12, 13). Drizzle is confined
 * here. `save` UPSERTs on (user_id, recorded_on) so there is one snapshot per
 * day. History uses keyset (cursor) pagination on (recorded_on desc, id desc).
 */
@Injectable()
export class PostgresMeasurementRepository implements MeasurementRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async save(entry: MeasurementEntry): Promise<void> {
    const row = measurementToPersistence(entry);
    await this.db
      .insert(measurements)
      .values(row)
      .onConflictDoUpdate({
        target: [measurements.userId, measurements.recordedOn],
        set: {
          weightKg: row.weightKg,
          waistCm: row.waistCm,
          chestCm: row.chestCm,
          hipsCm: row.hipsCm,
          armCm: row.armCm,
          thighCm: row.thighCm,
          calfCm: row.calfCm,
          note: row.note,
        },
      });
  }

  async findById(id: MeasurementId): Promise<MeasurementEntry | null> {
    const rows = await this.db
      .select()
      .from(measurements)
      .where(eq(measurements.id, id.toString()))
      .limit(1);
    const row = rows.at(0);
    return row ? measurementToDomain(row) : null;
  }

  async list(params: ListMeasurementsParams): Promise<MeasurementPage> {
    const cursor = params.cursor ? decodeCursor(params.cursor) : null;
    const keyset = cursor
      ? or(
          lt(measurements.recordedOn, cursor.recordedOn),
          and(eq(measurements.recordedOn, cursor.recordedOn), lt(measurements.id, cursor.id)),
        )
      : undefined;

    const rows = await this.db
      .select()
      .from(measurements)
      .where(and(eq(measurements.userId, params.userId), keyset))
      .orderBy(desc(measurements.recordedOn), desc(measurements.id))
      .limit(params.limit + 1);

    const hasNext = rows.length > params.limit;
    const pageRows = hasNext ? rows.slice(0, params.limit) : rows;
    const items = pageRows.map(measurementToDomain);

    const last = pageRows.at(-1);
    const nextCursor =
      hasNext && last ? encodeCursor({ recordedOn: last.recordedOn, id: last.id }) : null;

    return { items, nextCursor, hasNext };
  }

  async listAllForUser(userId: string): Promise<readonly MeasurementEntry[]> {
    const rows = await this.db
      .select()
      .from(measurements)
      .where(eq(measurements.userId, userId))
      .orderBy(asc(measurements.recordedOn), asc(measurements.id));
    return rows.map(measurementToDomain);
  }

  async delete(id: MeasurementId): Promise<void> {
    await this.db.delete(measurements).where(eq(measurements.id, id.toString()));
  }
}
