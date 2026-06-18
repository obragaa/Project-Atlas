import globals from "globals";
import base from "./base.js";

/**
 * ESLint config for Node services (NestJS API, workers).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
