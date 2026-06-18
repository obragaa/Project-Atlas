import Link from "next/link";
import { buttonVariants, cn } from "@atlas/ui";

/**
 * Landing hero — the first five seconds (blueprint/03 "Primeira Sessão", 00 §6
 * "o sentimento que queremos provocar"). Minimal, premium, one clear primary
 * action. No clutter, generous whitespace (doc 03 "Carga Cognitiva").
 *
 * The CTAs are links styled with the shared button variants, so navigation and
 * the design system stay consistent without duplicating styles.
 */
export function Hero() {
  return (
    <section className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-raised/60 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        Inteligência a serviço da sua evolução
      </span>

      <h1 className="text-balance text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
        Mais que uma plataforma fitness.
        <br />
        Um parceiro para a sua evolução.
      </h1>

      <p className="mt-6 max-w-xl text-balance text-lg text-text-secondary">
        O Atlas une engenharia de alto nível, design premium e inteligência artificial para
        orientar, acompanhar e motivar você — todos os dias.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
          Começar minha jornada
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
          Já tenho conta
        </Link>
      </div>
    </section>
  );
}
