"use client";

import { usePrefersReducedMotion } from "@atlas/ui";

/**
 * LivingBackground — the Atlas canvas is never fully static (blueprint/00 §9,
 * 01 "Background", 04 "Background Vivo"). Two slow aurora blooms drift behind
 * the content to create depth and a sense of life, never to draw attention.
 *
 * Performance (blueprint/04, 17): animates only `transform`/`opacity`, sits on
 * its own compositor layer, and disables motion entirely under
 * `prefers-reduced-motion` — degrading to a still, elegant gradient.
 */
export function LivingBackground() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base canvas tint. */}
      <div className="absolute inset-0 bg-surface-canvas" />

      {/* Aurora bloom — accent indigo. */}
      <div
        className="absolute left-[-10%] top-[-15%] h-[55vmax] w-[55vmax] rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--atlas-accent-500) 0%, transparent 70%)",
          animation: reducedMotion ? undefined : "atlas-aurora-a 26s ease-in-out infinite",
          willChange: reducedMotion ? undefined : "transform",
        }}
      />

      {/* Aurora bloom — calm teal, offset for a layered, organic feel. */}
      <div
        className="absolute bottom-[-20%] right-[-10%] h-[50vmax] w-[50vmax] rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--atlas-teal-500) 0%, transparent 70%)",
          animation: reducedMotion ? undefined : "atlas-aurora-b 32s ease-in-out infinite",
          willChange: reducedMotion ? undefined : "transform",
        }}
      />

      {/* Subtle vignette to anchor content and deepen the edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, transparent 50%, rgba(6,8,12,0.6) 100%)",
        }}
      />
    </div>
  );
}
