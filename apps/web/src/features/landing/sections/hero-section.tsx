import Image from "next/image";
import Link from "next/link";
import { buttonVariants, cn } from "@atlas/ui";
import { HERO_IMAGES } from "@/features/media/fitness-images";
import { ArrowRightIcon } from "@/features/landing/icons";

/**
 * Hero — the first five seconds (blueprint/03 "Primeira Sessão", 00 §6). A
 * cinematic athlete shot anchors the brand; a dark gradient guarantees text
 * contrast over the photo (blueprint/06 accessibility). One clear primary
 * action, generous whitespace, a calm entrance.
 */
export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[88vh] flex-col justify-center overflow-hidden px-6 py-24 sm:py-32">
      {/* Cinematic background photo. */}
      <Image
        src={HERO_IMAGES.landing}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      {/* Readability gradients: vertical lift for the headline + a side wash. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-surface-canvas via-surface-canvas/70 to-surface-canvas/30"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-surface-canvas/80 via-surface-canvas/30 to-transparent"
      />

      <div
        className="mx-auto w-full max-w-3xl text-center sm:text-left"
        style={{ animation: "atlas-fade-in 700ms ease both" }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-raised/60 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent"
            style={{ animation: "atlas-pulse-glow 2.4s ease-in-out infinite" }}
            aria-hidden="true"
          />
          Inteligência a serviço da sua evolução
        </span>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
          Treine com inteligência.
          <br />
          Evolua de verdade.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-text-secondary sm:mx-0">
          O Atlas reúne um catálogo de exercícios, treinos sob medida e acompanhamento real do seu
          progresso — tudo em um só lugar, com a cara de quem leva a evolução a sério.
        </p>

        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "group")}>
            Começar agora
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-fast ease-standard group-hover:translate-x-0.5" />
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  );
}
