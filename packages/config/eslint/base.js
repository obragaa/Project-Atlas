import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

/**
 * Atlas base ESLint config (flat).
 *
 * Encodes engineering principles from `blueprint/24 - Engineering Principles.md`
 * and `blueprint/12 - Backend Architecture.md`: clarity over cleverness, single
 * responsibility, no circular dependencies, strong typing.
 *
 * Type-checked rules apply only to TS/TSX. JavaScript config files are linted
 * without type information (they live outside any tsconfig `include`).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // Shared, non-type-aware rules for all files.
  {
    plugins: { import: importPlugin },
    rules: {
      "import/no-cycle": ["error", { maxDepth: Infinity }],
      "import/no-self-import": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  // Type-checked rules, scoped to TypeScript sources only.
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // Fail-secure defaults: no silent floating promises (doc 16/21).
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  // JavaScript files (configs, scripts): disable type-aware linting.
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },
  // Config and script files run in Node and may use console freely.
  {
    files: ["**/*.config.{js,ts,mjs}", "**/eslint.config.js", "**/scripts/**"],
    rules: { "no-console": "off" },
  },
  prettier,
];
