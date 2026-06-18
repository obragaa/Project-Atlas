import type { Config } from "tailwindcss";
import atlasPreset from "@atlas/ui/tailwind-preset";

/**
 * Tailwind for the web app. It extends the shared Atlas preset so every utility
 * resolves to the design tokens — the single source of truth (blueprint/05).
 * The content globs include the design-system package so its class names are
 * not purged.
 */
const config: Config = {
  presets: [atlasPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
