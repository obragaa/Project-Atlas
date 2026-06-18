"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";

/**
 * Sends an already-signed-in visitor straight to the app. Mounted on public
 * pages (landing, login, register) so a returning user never has to re-auth —
 * the session was restored from storage by the AuthProvider.
 */
export function RedirectIfAuthenticated() {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isReady, isAuthenticated, router]);

  return null;
}
