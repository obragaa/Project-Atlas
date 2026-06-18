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
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    plugins: { import: importPlugin },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // Domain integrity: forbid circular dependencies (doc 12 anti-patterns).
      "import/no-cycle": ["error", { maxDepth: Infinity }],
      "import/no-self-import": "error",
      // Clarity over cleverness.
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
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Config and script files run in Node and may use console freely.
    files: ["**/*.config.{js,ts,mjs}", "**/scripts/**"],
    rules: { "no-console": "off" },
  },
  prettier,
];
