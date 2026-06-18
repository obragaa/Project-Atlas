import Image from "next/image";
import Link from "next/link";
import { buttonVariants, cn } from "@atlas/ui";
import { HERO_IMAGES } from "@/features/media/fitness-images";
import { ArrowRightIcon } from "@/features/landing/icons";

/**
 * Final CTA band — one last, confident invitation (blueprint/03: a single clear
 * primary action). A moody gym photo plus an accent wash for energy; the dark
 * overlay keeps the headline legible (blueprint/06).
 */
export function CtaSection() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border-subtle">
        <Image
          src={HERO_IMAGES.dashboard}
          alt=""
          fill
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="-z-20 object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-surface-canvas via-surface-canvas/85 to-surface-canvas/50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-accent-subtle/40 mix-blend-screen"
        />

        <div className="relative px-8 py-16 text-center sm:px-16 sm:py-24">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            Pronto para começar sua evolução?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-text-secondary">
            Crie sua conta gratuita e monte seu primeiro treino hoje mesmo. Sua melhor versão começa
            com a próxima sessão.
          </p>
          <div className="mt-9 flex justify-center">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "group")}>
              Criar minha conta
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-fast ease-standard group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
