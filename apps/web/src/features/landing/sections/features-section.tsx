import { type ComponentType, type SVGProps } from "react";
import { Card, CardDescription, CardTitle } from "@atlas/ui";
import { DumbbellIcon, LibraryIcon, SparkIcon, TrendingIcon } from "@/features/landing/icons";

/**
 * Features grid — what Atlas actually does today (blueprint/00 vision grounded
 * in real product surfaces: workouts, exercise catalogue, progress). Each card
 * uses the shared interactive elevation (blueprint/04 Motion System).
 */
interface Feature {
  readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
  readonly title: string;
  readonly description: string;
  readonly badge?: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: DumbbellIcon,
    title: "Monte seus treinos",
    description:
      "Escolha exercícios do catálogo, defina séries, repetições e cargas. Treinos do seu jeito, prontos para a próxima sessão.",
  },
  {
    icon: LibraryIcon,
    title: "Biblioteca de exercícios",
    description:
      "Busque e filtre por grupo muscular e equipamento. Instruções e dicas claras para executar com técnica.",
  },
  {
    icon: TrendingIcon,
    title: "Acompanhe sua evolução",
    description:
      "Conclua treinos e veja seu progresso ao longo do tempo. Cada sessão registrada vira combustível para a próxima.",
  },
  {
    icon: SparkIcon,
    title: "Inteligência Atlas",
    description:
      "Orientação inteligente para ajustar cargas e sugerir o próximo passo da sua jornada.",
    badge: "Em breve",
  },
];

export function FeaturesSection() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-accent">
            O que você ganha
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Tudo o que você precisa para treinar melhor
          </h2>
          <p className="mt-4 text-balance text-lg text-text-secondary">
            Da montagem do treino ao registro do progresso — sem planilhas, sem ruído.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description, badge }) => (
            <Card
              key={title}
              padding="lg"
              interactive
              className="flex flex-col bg-surface-raised/70 backdrop-blur"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                <Icon className="h-6 w-6" />
              </span>
              <div className="mt-5 flex items-center gap-2">
                <CardTitle>{title}</CardTitle>
                {badge ? (
                  <span className="rounded-full border border-border-subtle bg-surface-overlay px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-text-tertiary">
                    {badge}
                  </span>
                ) : null}
              </div>
              <CardDescription className="mt-2">{description}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
