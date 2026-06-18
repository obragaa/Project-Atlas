import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@atlas/ui";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Shared frame for auth screens — keeps onboarding calm and consistent
 * (blueprint/01 "Onboarding", 03 low cognitive load). One purpose per screen.
 */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <RedirectIfAuthenticated />
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 self-start text-sm text-text-tertiary transition-colors hover:text-text-secondary"
      >
        ← Atlas
      </Link>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {children}
      </Card>

      <p className="mt-6 text-center text-sm text-text-tertiary">{footer}</p>
    </main>
  );
}
