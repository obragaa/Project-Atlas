"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Spinner, cn } from "@atlas/ui";
import { useAuth } from "@/features/auth/auth-context";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: <IconHome /> },
  { href: "/workouts", label: "Treinos", icon: <IconDumbbell /> },
  { href: "/exercises", label: "Exercícios", icon: <IconLibrary /> },
];

/**
 * Authenticated app shell (blueprint/11 navegação, 03 baixa carga cognitiva):
 * a persistent sidebar + the page content. Guards its subtree — an
 * unauthenticated visitor is redirected to login, so every page below assumes a
 * signed-in user.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, isReady, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" label="Carregando" />
      </div>
    );
  }

  const initial = user?.displayName?.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border-subtle bg-surface-raised/40 px-4 py-6 backdrop-blur md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-on-accent">
            <IconLogo />
          </span>
          <span className="text-lg font-semibold tracking-tight text-text-primary">Atlas</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-subtle text-text-primary"
                    : "text-text-secondary hover:bg-surface-overlay hover:text-text-primary",
                )}
              >
                <span className={cn(active ? "text-accent" : "text-text-tertiary")}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 flex items-center gap-3 border-t border-border-subtle pt-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-overlay text-sm font-semibold text-text-primary">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{user?.displayName}</p>
            <p className="truncate text-xs text-text-tertiary">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="mt-2 justify-start" onClick={signOut}>
          Sair
        </Button>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-on-accent">
              <IconLogo />
            </span>
            <span className="font-semibold text-text-primary">Atlas</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sair
          </Button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border-subtle px-2 py-2 md:hidden">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                  active
                    ? "bg-accent-subtle text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

/* — Inline icons (no extra dependency; stroke uses currentColor) — */
function IconHome() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function IconDumbbell() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="M3 7v10M7 4v16M17 4v16M21 7v10" />
    </svg>
  );
}
function IconLibrary() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h6v16H4zM14 4h6v16h-6z" />
      <path d="M7 8h0M17 8h0" />
    </svg>
  );
}
function IconLogo() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 4 21M12 3l8 18M7 15h10" />
    </svg>
  );
}
