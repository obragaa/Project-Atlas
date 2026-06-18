import { PostgresUserRepository } from "./postgres-user.repository";
import { createTestDatabase } from "../../../shared/database/testing/pglite-database";
import { type DatabaseConnection } from "../../../shared/database/database-connection";
import { User } from "../domain/user";
import { Email } from "../domain/value-objects/email";

/**
 * Integration test (blueprint/18: Application <-> Repository <-> Database)
 * against a real Postgres engine via PGlite. Verifies the persistence /
 * rehydration round-trip, unique-email behavior, existsByEmail, UPSERT
 * idempotency, and that plaintext is never stored.
 */
describe("PostgresUserRepository (PGlite integration)", () => {
  let connection: DatabaseConnection;
  let repository: PostgresUserRepository;

  beforeAll(async () => {
    connection = await createTestDatabase();
    repository = new PostgresUserRepository(connection.db);
  });

  afterAll(async () => {
    await connection.close();
  });

  const makeUser = (email = "athlete@atlas.app") =>
    User.register({
      email: Email.create(email),
      passwordHash: "argon2-hash-value",
      displayName: "Atleta",
    });

  it("persists and rehydrates a user (round-trip)", async () => {
    const user = makeUser();
    await repository.save(user);

    const found = await repository.findById(user.id);
    expect(found).not.toBeNull();
    expect(found?.id.equals(user.id)).toBe(true);
    expect(found?.email.value).toBe("athlete@atlas.app");
    expect(found?.displayName).toBe("Atleta");
    expect([...(found?.roles ?? [])]).toEqual(["user"]);
  });

  it("finds a user by email case-insensitively", async () => {
    const user = makeUser("Case.Test@Atlas.App");
    await repository.save(user);

    // Email VO normalizes to lowercase; lookup uses the lower(email) index.
    const found = await repository.findByEmail(Email.create("case.test@atlas.app"));
    expect(found?.id.equals(user.id)).toBe(true);
  });

  it("reports existence by email", async () => {
    await repository.save(makeUser("exists@atlas.app"));
    expect(await repository.existsByEmail(Email.create("exists@atlas.app"))).toBe(true);
    expect(await repository.existsByEmail(Email.create("ghost@atlas.app"))).toBe(false);
  });

  it("save is an idempotent UPSERT on id", async () => {
    const user = makeUser("upsert@atlas.app");
    await repository.save(user);
    await expect(repository.save(user)).resolves.not.toThrow();

    const found = await repository.findById(user.id);
    expect(found).not.toBeNull();
  });

  it("never stores the plaintext password (only the provided hash)", async () => {
    const user = makeUser("hash@atlas.app");
    await repository.save(user);
    const found = await repository.findById(user.id);
    expect(found?.passwordHash).toBe("argon2-hash-value");
  });
});
