/**
 * Semantic design tokens — roles, not raw values.
 *
 * Each semantic token resolves to a CSS custom property defined in
 * `tokens.css`. This indirection is what makes theming (dark / light / high
 * contrast) possible without touching components, and keeps the contract from
 * blueprint/05 - Design System.md: components reference roles, never literals.
 *
 * Naming: `--atlas-<group>-<role>`.
 */

/** Helper to reference a CSS variable with an optional fallback. */
const v = (name: string): string => `var(--atlas-${name})`;

export const color = {
  // Surfaces — the layered canvas that creates depth through luminance.
  surface: {
    canvas: v("surface-canvas"),
    base: v("surface-base"),
    raised: v("surface-raised"),
    overlay: v("surface-overlay"),
    inverted: v("surface-inverted"),
  },
  // Borders & separators — discrete, never competing with content (doc 05).
  border: {
    subtle: v("border-subtle"),
    default: v("border-default"),
    strong: v("border-strong"),
    focus: v("border-focus"),
  },
  // Text — a clear hierarchy with accessible contrast (doc 06).
  text: {
    primary: v("text-primary"),
    secondary: v("text-secondary"),
    tertiary: v("text-tertiary"),
    inverted: v("text-inverted"),
    onAccent: v("text-on-accent"),
    disabled: v("text-disabled"),
  },
  // Accent — the Atlas Aurora, used for primary actions and identity.
  accent: {
    subtle: v("accent-subtle"),
    default: v("accent-default"),
    hover: v("accent-hover"),
    active: v("accent-active"),
    contrast: v("accent-contrast"),
  },
  // Functional roles. Each pairs a fill, a text color, and a subtle background
  // so states never rely on color alone (doc 06: contrast + textual support).
  success: {
    surface: v("success-surface"),
    border: v("success-border"),
    solid: v("success-solid"),
    text: v("success-text"),
  },
  warning: {
    surface: v("warning-surface"),
    border: v("warning-border"),
    solid: v("warning-solid"),
    text: v("warning-text"),
  },
  danger: {
    surface: v("danger-surface"),
    border: v("danger-border"),
    solid: v("danger-solid"),
    text: v("danger-text"),
  },
  info: {
    surface: v("info-surface"),
    border: v("info-border"),
    solid: v("info-solid"),
    text: v("info-text"),
  },
  // Focus ring — elegant, never aggressive (doc 04: "Focus").
  focusRing: v("focus-ring"),
} as const;

export type SemanticColors = typeof color;
