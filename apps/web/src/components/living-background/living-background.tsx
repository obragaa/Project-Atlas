"use client";

import { usePrefersReducedMotion } from "@atlas/ui";

/**
 * LivingBackground — the Atlas canvas is never fully static (blueprint/00 §9,
 * 01 "Background", 04 "Background Vivo"). A vivid aurora field drifts behind the
 * content for depth and energy.
 *
 * Performance (blueprint/04, 17): the motion is a slow `background-position`
 * shift on pre-painted radial gradients — no per-frame blur or scale, so it
 * composites cheaply. Disabled under `prefers-reduced-motion`, degrading to a
 * still, rich gradient.
 */
export function LivingBackground() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Deep base canvas. */}
      <div className="absolute inset-0 bg-surface-canvas" />

      {/* Vivid aurora field — layered radial blooms that slowly drift. */}
      <div
        className="absolute inset-[-20%]"
        style={{
          backgroundImage: [
            "radial-gradient(40% 50% at 18% 22%, rgba(91,94,240,0.40), transparent 70%)",
            "radial-gradient(38% 46% at 82% 18%, rgba(51,185,166,0.30), transparent 70%)",
            "radial-gradient(45% 55% at 70% 85%, rgba(122,130,251,0.28), transparent 72%)",
            "radial-gradient(36% 44% at 30% 88%, rgba(27,154,138,0.22), transparent 72%)",
          ].join(","),
          backgroundSize: "200% 200%",
          animation: reducedMotion ? undefined : "atlas-aurora-drift 28s ease-in-out infinite",
          willChange: reducedMotion ? undefined : "background-position",
        }}
      />

      {/* Fine grain + vignette to anchor content and deepen the edges. */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 0%, transparent 45%, rgba(6,8,12,0.72) 100%)",
        }}
      />
    </div>
  );
}
