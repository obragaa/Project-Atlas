import node from "@atlas/config/eslint/node";
import tseslint from "typescript-eslint";

export default [
  ...node,
  {
    ignores: ["dist/**", ".turbo/**", "coverage/**", "drizzle.config.ts", "drizzle/**"],
  },
  {
    // NestJS relies heavily on decorators and DI; relax a rule that fights the
    // framework idioms without weakening domain-layer guarantees.
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
      // Dependency Rule boundary (blueprint/12): persistence/cache/queue drivers
      // are Infrastructure-only. Forbidding them everywhere by default keeps
      // Domain and Application framework/DB-agnostic; the infra zones below
      // re-enable them.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "drizzle-orm", message: "Drizzle is Infrastructure-only (blueprint/12)." },
            { name: "pg", message: "node-postgres is Infrastructure-only (blueprint/12)." },
            {
              name: "ioredis",
              message: "The Redis client is Infrastructure-only (blueprint/12).",
            },
            {
              name: "@electric-sql/pglite",
              message: "PGlite is Infrastructure/test-only (blueprint/12).",
            },
          ],
          patterns: [
            {
              group: ["drizzle-orm/*", "drizzle-orm"],
              message: "Drizzle is Infrastructure-only (blueprint/12).",
            },
          ],
        },
      ],
    },
  },
  {
    // Infrastructure zones may import the drivers — this is exactly where the
    // concrete persistence/cache technology lives (blueprint/12).
    files: [
      "**/infrastructure/**/*.ts",
      "**/shared/database/**/*.ts",
      "**/infra/**/*.ts",
      "**/testing/**/*.ts",
      "drizzle.config.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    // Spec files are not part of the production tsconfig project; lint them
    // without type information (jest globals come from the test runner) and
    // without engaging the project service parser.
    files: ["**/*.spec.ts"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: false,
      },
    },
  },
];
