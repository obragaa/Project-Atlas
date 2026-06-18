import { RegisterUserUseCase } from "./register-user.use-case";
import { FakeUserRepository } from "../testing/fake-user.repository";
import { type PasswordHasher, type TokenService } from "../domain/ports";
import { Email } from "../domain/value-objects/email";

// A reversible-free fake: the "hash" is an opaque token, not the plaintext, so
// the "never store plaintext" assertion is meaningful. A side map records the
// mapping for verify().
const hashRegistry = new Map<string, string>();
const fakeHasher: PasswordHasher = {
  hash: (plaintext) => {
    const token = `argon2-fake-${hashRegistry.size}`;
    hashRegistry.set(token, plaintext);
    return Promise.resolve(token);
  },
  verify: (hash, plaintext) => Promise.resolve(hashRegistry.get(hash) === plaintext),
};

const fakeTokens: TokenService = {
  accessTokenTtl: 900,
  issueAccessToken: () => Promise.resolve("access-token"),
  issueRefreshToken: () => Promise.resolve("refresh-token"),
  verifyAccessToken: () => Promise.resolve({ sub: "u", roles: ["user"] }),
  verifyRefreshToken: () => Promise.resolve({ sub: "u" }),
};

describe("RegisterUserUseCase", () => {
  const buildUseCase = () =>
    new RegisterUserUseCase(new FakeUserRepository(), fakeHasher, fakeTokens);

  const validCommand = {
    email: "athlete@atlas.app",
    password: "a-strong-passphrase",
    displayName: "Atleta",
  };

  it("registers a new user with least privilege and returns a session", async () => {
    const session = await buildUseCase().execute(validCommand);

    expect(session.user.email).toBe("athlete@atlas.app");
    expect(session.user.roles).toEqual(["user"]);
    expect(session.tokens.tokenType).toBe("Bearer");
    expect(session.tokens.accessToken).toBe("access-token");
    expect(session.tokens.expiresIn).toBe(900);
  });

  it("rejects a duplicate email with a conflict", async () => {
    const useCase = buildUseCase();
    const repo = new FakeUserRepository();
    const sharedUseCase = new RegisterUserUseCase(repo, fakeHasher, fakeTokens);

    await sharedUseCase.execute(validCommand);
    await expect(sharedUseCase.execute(validCommand)).rejects.toMatchObject({
      category: "conflict",
    });
    // The first use case instance is independent and unaffected.
    await expect(useCase.execute(validCommand)).resolves.toBeDefined();
  });

  it("rejects a weak password before persisting", async () => {
    await expect(
      buildUseCase().execute({ ...validCommand, password: "short" }),
    ).rejects.toMatchObject({ category: "validation" });
  });

  it("never stores the plaintext password", async () => {
    const repo = new FakeUserRepository();
    const useCase = new RegisterUserUseCase(repo, fakeHasher, fakeTokens);
    await useCase.execute(validCommand);

    const stored = await repo.findByEmail(Email.create(validCommand.email));
    expect(stored?.passwordHash).toBeTruthy();
    expect(stored?.passwordHash).not.toContain(validCommand.password);
  });
});
