import { LoginUserUseCase } from "./login-user.use-case";
import { RegisterUserUseCase } from "./register-user.use-case";
import { InMemoryUserRepository } from "../infrastructure/in-memory-user.repository";
import { type PasswordHasher, type TokenService } from "../domain/ports";

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

describe("LoginUserUseCase", () => {
  const repo = new InMemoryUserRepository();
  const login = new LoginUserUseCase(repo, fakeHasher, fakeTokens);

  beforeAll(async () => {
    await new RegisterUserUseCase(repo, fakeHasher, fakeTokens).execute({
      email: "athlete@atlas.app",
      password: "a-strong-passphrase",
      displayName: "Atleta",
    });
  });

  it("authenticates with correct credentials", async () => {
    const session = await login.execute({
      email: "athlete@atlas.app",
      password: "a-strong-passphrase",
    });
    expect(session.user.email).toBe("athlete@atlas.app");
    expect(session.tokens.accessToken).toBe("access-token");
  });

  it("rejects a wrong password with a generic authentication error", async () => {
    await expect(
      login.execute({ email: "athlete@atlas.app", password: "wrong-passphrase" }),
    ).rejects.toMatchObject({ category: "authentication", code: "auth.invalid_credentials" });
  });

  it("returns the same generic error for an unknown email (no enumeration)", async () => {
    await expect(
      login.execute({ email: "ghost@atlas.app", password: "a-strong-passphrase" }),
    ).rejects.toMatchObject({ category: "authentication", code: "auth.invalid_credentials" });
  });
});
