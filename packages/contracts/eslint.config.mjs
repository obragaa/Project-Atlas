import node from "@atlas/config/eslint/node";

export default [
  ...node,
  {
    ignores: ["dist/**", ".turbo/**"],
  },
];
