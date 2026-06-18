import { PostgresExerciseRepository } from "./postgres-exercise.repository";
import { seedExercises } from "./seed/seed-exercises";
import { EXERCISE_CATALOGUE } from "./seed/exercise-catalogue";
import { createTestDatabase } from "../../../shared/database/testing/pglite-database";
import { type DatabaseConnection } from "../../../shared/database/database-connection";

/**
 * Integration test (blueprint/18) against a real Postgres engine via PGlite.
 * Seeds the catalogue, then verifies search filters, slug lookup, alphabetical
 * cursor pagination, and seed idempotency.
 */
describe("PostgresExerciseRepository (PGlite integration)", () => {
  let connection: DatabaseConnection;
  let repository: PostgresExerciseRepository;

  beforeAll(async () => {
    connection = await createTestDatabase();
    repository = new PostgresExerciseRepository(connection.db);
    await seedExercises(connection.db);
  });

  afterAll(async () => {
    await connection.close();
  });

  it("seeds the full catalogue", async () => {
    expect(await repository.count()).toBe(EXERCISE_CATALOGUE.length);
  });

  it("seed is idempotent (re-running inserts nothing new)", async () => {
    const inserted = await seedExercises(connection.db);
    expect(inserted).toBe(0);
    expect(await repository.count()).toBe(EXERCISE_CATALOGUE.length);
  });

  it("finds an exercise by slug", async () => {
    const found = await repository.findBySlug("barbell-bench-press");
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Supino reto com barra");
    expect(found?.primaryMuscle).toBe("chest");
    expect(found?.muscles).toContain("chest");
  });

  it("returns null for an unknown slug", async () => {
    expect(await repository.findBySlug("does-not-exist")).toBeNull();
  });

  it("filters by equipment", async () => {
    const page = await repository.search({ equipment: "bodyweight", limit: 50 });
    expect(page.items.length).toBeGreaterThanOrEqual(1);
    expect(page.items.every((e) => e.equipment === "bodyweight")).toBe(true);
  });

  it("filters by muscle (primary or worked)", async () => {
    const page = await repository.search({ muscle: "triceps", limit: 50 });
    expect(page.items.length).toBeGreaterThanOrEqual(1);
    expect(
      page.items.every((e) => e.primaryMuscle === "triceps" || e.muscles.includes("triceps")),
    ).toBe(true);
  });

  it("searches by name (case-insensitive contains)", async () => {
    const page = await repository.search({ search: "AGACHAMENTO", limit: 50 });
    expect(page.items.length).toBeGreaterThanOrEqual(1);
    expect(page.items.every((e) => e.name.toLowerCase().includes("agachamento"))).toBe(true);
  });

  it("paginates alphabetically with a working cursor and no overlap", async () => {
    const first = await repository.search({ limit: 5 });
    expect(first.items).toHaveLength(5);
    expect(first.hasNext).toBe(true);
    expect(first.nextCursor).not.toBeNull();

    const second = await repository.search({ limit: 5, cursor: first.nextCursor! });
    const firstIds = first.items.map((e) => e.id.toString());
    const secondIds = second.items.map((e) => e.id.toString());
    expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);

    // Names are non-decreasing across the page boundary (alphabetical order).
    const firstNames = first.items.map((e) => e.name.toLowerCase());
    const lastOfFirst = firstNames[firstNames.length - 1]!;
    const firstOfSecond = second.items[0]!.name.toLowerCase();
    expect(firstOfSecond >= lastOfFirst).toBe(true);
  });
});
