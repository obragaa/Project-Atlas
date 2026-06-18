import { SessionFactory } from "../application/session.factory.js";
import { InMemorySessionStore } from "../infrastructure/in-memory-session.store.js";
import { type RefreshTokenHasher, type TokenService } from "../domain/ports.js";

/**
 * Test fakes for the session subsystem. Builds a real `SessionFactory` over an
 * in-memory session store, so application-layer unit tests exercise the actual
 * orchestration without Redis or JWT signing.
 */
export const fakeTokenService: TokenService = {
  accessTokenTtl: 900,
  refreshTokenTtl: 2_592_000,
  issueAccessToken: () => Promise.resolve("access-token"),
  issueRefreshToken: () => Promise.resolve("refresh-token"),
  verifyAccessToken: () => Promise.resolve({ sub: "u", roles: ["user"] }),
  verifyRefreshToken: () => Promise.resolve({ sub: "u", sid: "s", fid: "f", jti: "j" }),
};

export const fakeRefreshHasher: RefreshTokenHasher = {
  hash: (raw) => `hash:${raw}`,
  matches: (a, b) => a === b,
};

export function buildFakeSessionFactory(): SessionFactory {
  return new SessionFactory(fakeTokenService, new InMemorySessionStore(), fakeRefreshHasher);
}
