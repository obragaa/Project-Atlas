import react from "@atlas/config/eslint/react";

export default [
  ...react,
  {
    ignores: ["dist/**", ".turbo/**"],
  },
];
