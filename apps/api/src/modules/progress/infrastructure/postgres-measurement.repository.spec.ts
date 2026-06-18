import { PostgresMeasurementRepository } from "./postgres-measurement.repository";
import { createTestDatabase } from "../../../shared/database/testing/pglite-database";
import { type DatabaseConnection } from "../../../shared/database/database-connection";
import { MeasurementEntry } from "../domain/measurement-entry";
import { MeasurementDate } from "../domain/value-objects/measurement-date";
import { BodyMeasurements } from "../domain/value-objects/body-measurements";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

const entry = (userId: string, iso: string, weightKg: number | null, measures = {}) =>
  MeasurementEntry.record({
    userId,
    recordedOn: MeasurementDate.create(iso),
    weightKg,
    measurements: BodyMeasurements.create(measures),
  });

describe("PostgresMeasurementRepository (PGlite integration)", () => {
  let connection: DatabaseConnection;
  let repository: PostgresMeasurementRepository;

  beforeAll(async () => {
    connection = await createTestDatabase();
    repository = new PostgresMeasurementRepository(connection.db);
  });

  afterAll(async () => {
    await connection.close();
  });

  it("persists and rehydrates a measurement (round-trip)", async () => {
    const m = entry(USER_A, "2026-06-01", 81.2, { waist: 84, arm: 38 });
    await repository.save(m);

    const found = await repository.findById(m.id);
    expect(found).not.toBeNull();
    expect(found?.weightKg).toBe(81.2);
    expect(found?.recordedOn.value).toBe("2026-06-01");
    expect(found?.measurements.fields.waist).toBe(84);
    expect(found?.measurements.fields.arm).toBe(38);
    expect(found?.measurements.fields.chest).toBeNull();
  });

  it("UPSERTs on (user, date) — one snapshot per day", async () => {
    const first = entry(USER_A, "2026-06-02", 80);
    await repository.save(first);
    const second = entry(USER_A, "2026-06-02", 79.5); // same date, new weight
    await repository.save(second);

    const all = await repository.listAllForUser(USER_A);
    const onDate = all.filter((e) => e.recordedOn.value === "2026-06-02");
    expect(onDate).toHaveLength(1);
    expect(onDate[0]?.weightKg).toBe(79.5);
  });

  it("lists history newest-first with a working cursor", async () => {
    const owner = "33333333-3333-4333-8333-333333333333";
    for (const d of ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05"]) {
      await repository.save(entry(owner, d, 80));
    }

    const first = await repository.list({ userId: owner, limit: 2 });
    expect(first.items).toHaveLength(2);
    expect(first.items[0]?.recordedOn.value).toBe("2026-05-05"); // newest first
    expect(first.hasNext).toBe(true);

    const second = await repository.list({ userId: owner, limit: 2, cursor: first.nextCursor! });
    const firstDates = first.items.map((e) => e.recordedOn.value);
    const secondDates = second.items.map((e) => e.recordedOn.value);
    expect(firstDates.some((d) => secondDates.includes(d))).toBe(false);
  });

  it("listAllForUser returns oldest-first and only that user's entries", async () => {
    const owner = "44444444-4444-4444-8444-444444444444";
    await repository.save(entry(owner, "2026-04-02", 80));
    await repository.save(entry(owner, "2026-04-01", 81));
    await repository.save(entry(USER_B, "2026-04-01", 99));

    const all = await repository.listAllForUser(owner);
    expect(all.map((e) => e.recordedOn.value)).toEqual(["2026-04-01", "2026-04-02"]);
    expect(all.every((e) => e.isOwnedBy(owner))).toBe(true);
  });

  it("deletes a measurement", async () => {
    const m = entry(USER_A, "2026-03-01", 80);
    await repository.save(m);
    await repository.delete(m.id);
    expect(await repository.findById(m.id)).toBeNull();
  });
});
