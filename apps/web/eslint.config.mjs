import react from "@atlas/config/eslint/react";

export default [
  ...react,
  {
    ignores: [".next/**", ".turbo/**", "next-env.d.ts"],
  },
];
