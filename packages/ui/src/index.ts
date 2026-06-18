/**
 * @atlas/ui — the Atlas Design System.
 *
 * Public surface: tokens, utilities, hooks, and the base component library.
 * Every component honors the Design System (doc 05), Motion System (doc 04),
 * and Accessibility (doc 06) blueprints.
 */

// Utilities
export { cn } from "./utils/cn.js";

// Hooks
export { usePrefersReducedMotion } from "./hooks/use-prefers-reduced-motion.js";

// Tokens
export * as tokens from "./tokens/index.js";

// Components
export { Button, buttonVariants, type ButtonProps } from "./components/button/button.js";
export { Spinner, type SpinnerProps } from "./components/spinner/spinner.js";
export { Skeleton, type SkeletonProps } from "./components/skeleton/skeleton.js";
export { Input, type InputProps } from "./components/input/input.js";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  type CardProps,
} from "./components/card/card.js";
export { VisuallyHidden } from "./components/visually-hidden/visually-hidden.js";
