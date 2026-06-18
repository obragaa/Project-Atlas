"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Returns whether the user prefers reduced motion.
 *
 * Every motion-bearing Atlas component consults this so animations degrade
 * gracefully (blueprint/04 - Motion System.md and 06 - Accessibility.md:
 * "Respeitar sempre prefers-reduced-motion"). Defaults to `true` (safe: no
 * motion) until the media query is read on the client.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    setPrefersReduced(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent): void => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
}
