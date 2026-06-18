import type { Config } from "tailwindcss";

/**
 * Atlas Tailwind preset.
 *
 * Bridges the design tokens (CSS custom properties from `tokens.css`) into
 * Tailwind's theme so utility classes resolve to the same single source of
 * truth (blueprint/05 - Design System.md). Apps extend this preset; they never
 * redefine colors locally.
 */
const preset: Partial<Config> = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        surface: {
          canvas: "var(--atlas-surface-canvas)",
          base: "var(--atlas-surface-base)",
          raised: "var(--atlas-surface-raised)",
          overlay: "var(--atlas-surface-overlay)",
          inverted: "var(--atlas-surface-inverted)",
        },
        border: {
          subtle: "var(--atlas-border-subtle)",
          DEFAULT: "var(--atlas-border-default)",
          strong: "var(--atlas-border-strong)",
          focus: "var(--atlas-border-focus)",
        },
        text: {
          primary: "var(--atlas-text-primary)",
          secondary: "var(--atlas-text-secondary)",
          tertiary: "var(--atlas-text-tertiary)",
          inverted: "var(--atlas-text-inverted)",
          "on-accent": "var(--atlas-text-on-accent)",
          disabled: "var(--atlas-text-disabled)",
        },
        accent: {
          subtle: "var(--atlas-accent-subtle)",
          DEFAULT: "var(--atlas-accent-default)",
          hover: "var(--atlas-accent-hover)",
          active: "var(--atlas-accent-active)",
          contrast: "var(--atlas-accent-contrast)",
        },
        success: {
          surface: "var(--atlas-success-surface)",
          border: "var(--atlas-success-border)",
          solid: "var(--atlas-success-solid)",
          text: "var(--atlas-success-text)",
        },
        warning: {
          surface: "var(--atlas-warning-surface)",
          border: "var(--atlas-warning-border)",
          solid: "var(--atlas-warning-solid)",
          text: "var(--atlas-warning-text)",
        },
        danger: {
          surface: "var(--atlas-danger-surface)",
          border: "var(--atlas-danger-border)",
          solid: "var(--atlas-danger-solid)",
          text: "var(--atlas-danger-text)",
        },
        info: {
          surface: "var(--atlas-info-surface)",
          border: "var(--atlas-info-border)",
          solid: "var(--atlas-info-solid)",
          text: "var(--atlas-info-text)",
        },
      },
      borderRadius: {
        sm: "var(--atlas-radius-sm)",
        md: "var(--atlas-radius-md)",
        lg: "var(--atlas-radius-lg)",
        xl: "var(--atlas-radius-xl)",
        "2xl": "var(--atlas-radius-2xl)",
        full: "var(--atlas-radius-full)",
      },
      boxShadow: {
        sm: "var(--atlas-elevation-sm)",
        md: "var(--atlas-elevation-md)",
        lg: "var(--atlas-elevation-lg)",
        glow: "var(--atlas-elevation-glow)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      transitionTimingFunction: {
        standard: "var(--atlas-easing-standard)",
        decelerate: "var(--atlas-easing-decelerate)",
        accelerate: "var(--atlas-easing-accelerate)",
        emphasized: "var(--atlas-easing-emphasized)",
      },
      transitionDuration: {
        instant: "80ms",
        fast: "140ms",
        base: "220ms",
        slow: "360ms",
        deliberate: "560ms",
      },
      ringColor: {
        focus: "var(--atlas-focus-ring)",
      },
    },
  },
};

export default preset;
