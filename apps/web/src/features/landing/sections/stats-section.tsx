/**
 * Stats strip — a bordered band of proof points (blueprint/01 brand: confident,
 * not boastful). Plain numbers, calm labels, tokenized surfaces.
 */
const STATS = [
  { value: "+15", label: "exercícios no catálogo" },
  { value: "100%", label: "treino acompanhado" },
  { value: "∞", label: "treinos ilimitados" },
  { value: "Real", label: "evolução medida" },
] as const;

export function StatsSection() {
  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 bg-surface-base/70 px-4 py-8 text-center backdrop-blur"
            >
              <dt className="order-2 text-sm text-text-tertiary">{stat.label}</dt>
              <dd className="order-1 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
