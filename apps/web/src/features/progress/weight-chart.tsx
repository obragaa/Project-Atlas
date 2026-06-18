"use client";

import { type WeightPoint } from "@atlas/contracts";

/**
 * A lightweight weight chart drawn as inline SVG (no charting dependency, so it
 * stays small and fast — blueprint/17). Plots the ascending weight series with
 * a soft area fill and points; degrades to an empty state.
 */
export function WeightChart({ series }: { series: readonly WeightPoint[] }) {
  if (series.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border-subtle text-sm text-text-tertiary">
        Registre pelo menos dois pesos para ver sua evolução.
      </div>
    );
  }

  const W = 600;
  const H = 200;
  const PAD = 24;

  const weights = series.map((p) => p.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const x = (i: number) => PAD + (i / (series.length - 1)) * (W - PAD * 2);
  const y = (w: number) => PAD + (1 - (w - min) / range) * (H - PAD * 2);

  const line = series.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.weightKg)}`).join(" ");
  const area = `${line} L ${x(series.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-48 w-full"
        role="img"
        aria-label="Gráfico de evolução do peso"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--atlas-accent-500)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--atlas-accent-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#weightFill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--atlas-accent-500)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {series.map((p, i) => (
          <circle
            key={p.recordedOn}
            cx={x(i)}
            cy={y(p.weightKg)}
            r="3.5"
            fill="var(--atlas-surface-canvas)"
            stroke="var(--atlas-accent-500)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-text-tertiary">
        <span>{formatDate(series[0]!.recordedOn)}</span>
        <span>{formatDate(series[series.length - 1]!.recordedOn)}</span>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y!.slice(2)}`;
}
