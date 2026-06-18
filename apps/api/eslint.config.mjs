import node from "@atlas/config/eslint/node";
import tseslint from "typescript-eslint";

export default [
  ...node,
  {
    ignores: ["dist/**", ".turbo/**", "coverage/**"],
  },
  {
    // NestJS relies heavily on decorators and DI; relax a rule that fights the
    // framework idioms without weakening domain-layer guarantees.
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
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
