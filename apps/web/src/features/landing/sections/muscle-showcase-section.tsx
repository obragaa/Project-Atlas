import Image from "next/image";
import { type MuscleGroup } from "@atlas/contracts";
import { MUSCLE_IMAGES } from "@/features/media/fitness-images";

/**
 * Muscle showcase — a gym-style category grid (blueprint/01 brand: premium,
 * energetic visuals). Each tile is a photo with a dark gradient and an overlaid
 * pt-BR label so contrast holds over any image (blueprint/06).
 */
interface MuscleTile {
  readonly muscle: MuscleGroup;
  readonly label: string;
}

const TILES: readonly MuscleTile[] = [
  { muscle: "chest", label: "Peito" },
  { muscle: "back", label: "Costas" },
  { muscle: "legs", label: "Pernas" },
  { muscle: "shoulders", label: "Ombros" },
  { muscle: "core", label: "Core" },
  { muscle: "biceps", label: "Braços" },
];

export function MuscleShowcaseSection() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-accent">
            Treine cada grupo
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Um catálogo para o corpo inteiro
          </h2>
          <p className="mt-4 text-balance text-lg text-text-secondary">
            Encontre exercícios para cada grupo muscular e monte um treino completo e equilibrado.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {TILES.map(({ muscle, label }) => (
            <li
              key={muscle}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border-subtle"
            >
              <Image
                src={MUSCLE_IMAGES[muscle]}
                alt={`Treino de ${label}`}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-slow ease-emphasized group-hover:scale-105 motion-reduce:transform-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-surface-canvas via-surface-canvas/40 to-transparent"
              />
              <span className="absolute bottom-4 left-4 text-lg font-semibold tracking-tight text-text-primary">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
