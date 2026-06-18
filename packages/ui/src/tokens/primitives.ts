/**
 * Primitive design tokens — the raw, context-free values of the Atlas visual
 * language. These are the only place where literal colors, sizes, and timings
 * are allowed to exist (blueprint/05 - Design System.md: "Jamais utilizar
 * valores fixos espalhados pelo código").
 *
 * Primitives carry no meaning on their own. Semantic tokens (see `semantic.ts`)
 * map them to roles. Components consume semantic tokens, never primitives.
 *
 * Palette intent (blueprint/01 - Brand.md): premium, sophisticated, high
 * contrast, technological. Never neon, never over-saturated. Red is never the
 * primary; the accent is a refined indigo→cyan "Atlas Aurora".
 */

export const palette = {
  // Neutral ramp — a deep, slightly cool near-black canvas through to near-white.
  // Tuned for depth via luminance, not heavy shadows (doc 05: "Elevação").
  neutral: {
    0: "#ffffff",
    50: "#f6f7f9",
    100: "#eceef2",
    200: "#d6dae2",
    300: "#b3bac7",
    400: "#8b94a6",
    500: "#646e82",
    600: "#39414f",
    700: "#2b3242",
    800: "#1c212e",
    900: "#12161f",
    950: "#0b0e15",
    1000: "#06080c",
  },
  // Accent ramp — the "Atlas Aurora" indigo. Sophisticated, technological.
  accent: {
    50: "#eef1ff",
    100: "#dfe4ff",
    200: "#c4ccff",
    300: "#9faaff",
    400: "#7a82fb",
    500: "#5b5ef0",
    600: "#4a44dd",
    700: "#3d36bb",
    800: "#332e96",
    900: "#2d2b77",
    950: "#1b1945",
  },
  // Secondary accent — a calm teal/cyan used sparingly for aurora gradients and
  // data viz. Never neon (doc 01).
  teal: {
    50: "#e9fbf8",
    100: "#c9f4ec",
    200: "#97e8da",
    300: "#5fd4c2",
    400: "#33b9a6",
    500: "#1b9a8a",
    600: "#137b70",
    700: "#13625a",
    800: "#144e49",
    900: "#14403d",
    950: "#052724",
  },
  // Functional ramps — success / warning / danger / info. Muted, not neon.
  // Danger is reserved for destructive states only, never the brand primary.
  success: {
    100: "#d6f3e0",
    300: "#86d6a6",
    500: "#33a868",
    700: "#1f7a4a",
    900: "#13492e",
  },
  warning: {
    100: "#f9eccf",
    300: "#ecc878",
    500: "#d99e2b",
    700: "#a4741a",
    900: "#5f4310",
  },
  danger: {
    100: "#f7d9d9",
    300: "#e89a9a",
    500: "#cf4f4f",
    700: "#a03636",
    900: "#5e2020",
  },
  info: {
    100: "#d6e6f7",
    300: "#8ab6e8",
    500: "#4f86cf",
    700: "#365fa0",
    900: "#203a5e",
  },
} as const;

/** Spacing scale — a single, predictable 4px-based grid (doc 05: "Grid"). */
export const spacing = {
  0: "0px",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
} as const;

/** Border radius scale — modern, never exaggerated (doc 05: "Radius"). */
export const radius = {
  none: "0px",
  sm: "0.375rem", // 6px
  md: "0.625rem", // 10px
  lg: "0.875rem", // 14px
  xl: "1.25rem", // 20px
  "2xl": "1.75rem", // 28px
  full: "9999px",
} as const;

/** Typography — one technological, highly legible system (doc 05: "Tipografia"). */
export const typography = {
  fontFamily: {
    sans: '"Inter", "Inter Fallback", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "JetBrains Mono Fallback", ui-monospace, "SF Mono", Menlo, monospace',
  },
  // A constrained type scale — each level has a single purpose (doc 05).
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1.1" }],
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.04em",
  },
} as const;

/**
 * Motion tokens (blueprint/04 - Motion System.md). Durations are short and
 * purposeful; easings are physical, never robotic. Components must honor
 * `prefers-reduced-motion`.
 */
export const motion = {
  duration: {
    instant: "80ms",
    fast: "140ms",
    base: "220ms",
    slow: "360ms",
    deliberate: "560ms",
  },
  easing: {
    // Standard ease for most UI transitions — gentle acceleration/deceleration.
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    // Entering elements: decelerate into place.
    decelerate: "cubic-bezier(0, 0, 0.2, 1)",
    // Leaving elements: accelerate out.
    accelerate: "cubic-bezier(0.4, 0, 1, 1)",
    // Emphasis — a refined spring-like feel without exaggeration.
    emphasized: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  },
} as const;

/** Elevation via light & blur, not heavy shadows (doc 05: "Elevação"). */
export const elevation = {
  none: "none",
  sm: "0 1px 2px rgba(6, 8, 12, 0.32)",
  md: "0 4px 16px rgba(6, 8, 12, 0.40)",
  lg: "0 12px 40px rgba(6, 8, 12, 0.48)",
  glow: "0 0 0 1px rgba(91, 94, 240, 0.18), 0 8px 32px rgba(91, 94, 240, 0.18)",
} as const;

/** Z-index scale — a single ordered system (doc 05 tokens include z-index). */
export const zIndex = {
  base: "0",
  raised: "10",
  sticky: "100",
  drawer: "200",
  overlay: "300",
  modal: "400",
  toast: "500",
  tooltip: "600",
} as const;

/** Opacity steps used for disabled/muted states. */
export const opacity = {
  disabled: "0.45",
  muted: "0.65",
  full: "1",
} as const;
