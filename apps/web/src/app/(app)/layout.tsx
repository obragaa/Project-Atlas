import { type ReactNode } from "react";
import { AppShell } from "@/features/app-shell/app-shell";

/**
 * Layout for the authenticated app area. The AppShell provides the persistent
 * sidebar/navigation and guards the subtree (redirects to /login when signed
 * out), so every page in this group assumes an authenticated user.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
