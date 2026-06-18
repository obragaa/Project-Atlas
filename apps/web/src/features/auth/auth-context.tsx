"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type AuthSession, type AuthenticatedUser } from "@atlas/contracts";
import { authService } from "@/services/auth.service";
import { setTokenProvider } from "@/services/api-client";

/**
 * Client-side session (the `features` layer — blueprint/11). Persists the token
 * pair + user in localStorage so a refresh keeps you signed in, and exposes a
 * single `useAuth()` for the whole app. The api-client is wired to read the
 * current access token from here, so every service call is authenticated
 * automatically and a 401 triggers a transparent refresh.
 *
 * Note: localStorage is a pragmatic first step for this app; httpOnly-cookie
 * sessions are a hardening follow-up (a tracked exception).
 */

const STORAGE_KEY = "atlas.session";

interface StoredSession {
  readonly user: AuthenticatedUser;
  readonly accessToken: string;
  readonly refreshToken: string;
}

interface AuthContextValue {
  readonly user: AuthenticatedUser | null;
  readonly isReady: boolean;
  readonly isAuthenticated: boolean;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function read(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function write(session: StoredSession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode): the session simply won't persist.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Hydrate from storage once on mount.
  useEffect(() => {
    setSession(read());
    setIsReady(true);
  }, []);

  const signOut = useCallback(() => {
    setSession((current) => {
      if (current) {
        // Best-effort server revoke; ignore failures (logout is idempotent).
        void authService.logout(current.refreshToken).catch(() => undefined);
      }
      return null;
    });
    write(null);
  }, []);

  const signIn = useCallback((authSession: AuthSession) => {
    const stored: StoredSession = {
      user: authSession.user,
      accessToken: authSession.tokens.accessToken,
      refreshToken: authSession.tokens.refreshToken,
    };
    setSession(stored);
    write(stored);
  }, []);

  // Wire the api-client: it asks for the current access token, and on a 401 it
  // attempts a refresh once, updating the stored pair.
  useEffect(() => {
    setTokenProvider({
      getAccessToken: () => read()?.accessToken ?? null,
      refresh: async () => {
        const current = read();
        if (!current) return null;
        try {
          const tokens = await authService.refresh(current.refreshToken);
          const next: StoredSession = {
            user: current.user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
          write(next);
          setSession(next);
          return tokens.accessToken;
        } catch {
          write(null);
          setSession(null);
          return null;
        }
      },
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isReady,
      isAuthenticated: Boolean(session),
      signIn,
      signOut,
    }),
    [session, isReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return ctx;
}
