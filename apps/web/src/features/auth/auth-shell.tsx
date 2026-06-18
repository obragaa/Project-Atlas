import Link from "next/link";
import Image from "next/image";
import { CardDescription, CardTitle } from "@atlas/ui";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";
import { HERO_IMAGES } from "@/features/media/fitness-images";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Shared frame for auth screens — a premium split layout: a cinematic gym image
 * on one side, the focused form on the other (blueprint/01 "Onboarding", 03 low
 * cognitive load). One purpose per screen.
 */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh">
      <RedirectIfAuthenticated />

      {/* Visual side — hidden on small screens. */}
      <aside className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image src={HERO_IMAGES.auth} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-canvas via-surface-canvas/70 to-accent/20" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-on-accent">
              <Logo />
            </span>
            <span className="text-xl font-semibold tracking-tight text-text-primary">Atlas</span>
          </Link>
          <div className="max-w-sm">
            <p className="text-2xl font-semibold leading-snug tracking-tight text-text-primary">
              Cada treino é um passo. Cada série, uma evolução.
            </p>
            <p className="mt-3 text-text-secondary">
              Monte seus treinos, explore a biblioteca de exercícios e acompanhe seu progresso.
            </p>
          </div>
        </div>
      </aside>

      {/* Form side. */}
      <section className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-secondary lg:hidden"
          >
            ← Atlas
          </Link>

          <div className="mb-8">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="mt-1.5 text-base">{description}</CardDescription>
          </div>

          {children}

          <p className="mt-8 text-center text-sm text-text-tertiary">{footer}</p>
        </div>
      </section>
    </main>
  );
}

function Logo() {
  return (
    <svg
      width="18"
      height="18"
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
