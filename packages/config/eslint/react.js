import globals from "globals";
import base from "./base.js";

/**
 * ESLint config for React / Next.js packages and apps.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
