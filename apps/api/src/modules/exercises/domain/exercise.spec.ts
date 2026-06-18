import { Exercise } from "./exercise";

const base = {
  slug: "barbell-bench-press",
  name: "Supino reto",
  primaryMuscle: "chest" as const,
  muscles: ["triceps" as const],
  equipment: "barbell" as const,
  instructions: "Empurre a barra.",
  tips: ["Escápulas retraídas"],
  variations: ["Inclinado"],
};

describe("Exercise entity", () => {
  it("creates a valid exercise and folds the primary muscle into the worked set", () => {
    const exercise = Exercise.create(base);
    expect(exercise.slug).toBe("barbell-bench-press");
    expect(exercise.primaryMuscle).toBe("chest");
    // primary muscle is always part of muscles, deduped, no duplicates
    expect(exercise.muscles).toEqual(["chest", "triceps"]);
  });

  it("does not duplicate the primary muscle if already present in muscles", () => {
    const exercise = Exercise.create({ ...base, muscles: ["chest", "triceps"] });
    expect(exercise.muscles).toEqual(["chest", "triceps"]);
  });

  it("rejects an invalid slug", () => {
    expect(() => Exercise.create({ ...base, slug: "Bad Slug!" })).toThrowError(/slug/i);
  });

  it("rejects an empty name", () => {
    expect(() => Exercise.create({ ...base, name: "  " })).toThrowError(/nome/i);
  });

  it("rejects an invalid muscle group", () => {
    expect(() => Exercise.create({ ...base, primaryMuscle: "neck" as never })).toThrowError(
      /inválid/i,
    );
  });

  it("rejects invalid equipment", () => {
    expect(() => Exercise.create({ ...base, equipment: "rock" as never })).toThrowError(/inválid/i);
  });

  it("restore trusts persisted values without re-validation", () => {
    // restore takes an id; it must not throw on already-persisted data.
    const created = Exercise.create(base);
    const restored = Exercise.restore(created.id, {
      slug: created.slug,
      name: created.name,
      primaryMuscle: created.primaryMuscle,
      muscles: created.muscles,
      equipment: created.equipment,
      instructions: created.instructions,
      tips: created.tips,
      variations: created.variations,
    });
    expect(restored.id.equals(created.id)).toBe(true);
    expect(restored.slug).toBe(created.slug);
  });
});
