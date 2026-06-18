import { type AuthSession, type AuthenticatedUser, type TokenPair } from "@atlas/contracts";
import { type TokenService } from "../domain/ports.js";
import { type User } from "../domain/user.js";

/** Maps a User aggregate to the public, non-sensitive transport view. */
export function toAuthenticatedUser(user: User): AuthenticatedUser {
  return {
    id: user.id.toString(),
    email: user.email.value,
    displayName: user.displayName,
    roles: [...user.roles],
  };
}

/** Issues a token pair for a user. */
export async function issueTokens(user: User, tokens: TokenService): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    tokens.issueAccessToken({ sub: user.id.toString(), roles: [...user.roles] }),
    tokens.issueRefreshToken(user.id.toString()),
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: tokens.accessTokenTtl,
    tokenType: "Bearer",
  };
}

/** Builds the full authenticated session response. */
export async function toAuthSession(user: User, tokens: TokenService): Promise<AuthSession> {
  return {
    user: toAuthenticatedUser(user),
    tokens: await issueTokens(user, tokens),
  };
}
