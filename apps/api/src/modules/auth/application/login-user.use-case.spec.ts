import { LoginUserUseCase } from "./login-user.use-case";
import { RegisterUserUseCase } from "./register-user.use-case";
import { FakeUserRepository } from "../testing/fake-user.repository";
import { buildFakeSessionFactory } from "../testing/build-session-factory";
import { type PasswordHasher } from "../domain/ports";

const hashRegistry = new Map<string, string>();
const fakeHasher: PasswordHasher = {
  hash: (plaintext) => {
    const token = `argon2-fake-${hashRegistry.size}`;
    hashRegistry.set(token, plaintext);
    return Promise.resolve(token);
  },
  verify: (hash, plaintext) => Promise.resolve(hashRegistry.get(hash) === plaintext),
};

const session = { deviceId: "device-1", riskLevel: "low" as const };

describe("LoginUserUseCase", () => {
  const repo = new FakeUserRepository();
  const sessionFactory = buildFakeSessionFactory();
  const login = new LoginUserUseCase(repo, fakeHasher, sessionFactory);

  beforeAll(async () => {
    await new RegisterUserUseCase(repo, fakeHasher, sessionFactory).execute({
      email: "athlete@atlas.app",
      password: "a-strong-passphrase",
      displayName: "Atleta",
      session,
    });
  });

  it("authenticates with correct credentials", async () => {
    const authSession = await login.execute({
      email: "athlete@atlas.app",
      password: "a-strong-passphrase",
      session,
    });
    expect(authSession.user.email).toBe("athlete@atlas.app");
    expect(authSession.tokens.accessToken).toBe("access-token");
  });

  it("rejects a wrong password with a generic authentication error", async () => {
    await expect(
      login.execute({ email: "athlete@atlas.app", password: "wrong-passphrase", session }),
    ).rejects.toMatchObject({ category: "authentication", code: "auth.invalid_credentials" });
  });

  it("returns the same generic error for an unknown email (no enumeration)", async () => {
    await expect(
      login.execute({ email: "ghost@atlas.app", password: "a-strong-passphrase", session }),
    ).rejects.toMatchObject({ category: "authentication", code: "auth.invalid_credentials" });
  });
});
