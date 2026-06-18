/**
 * @atlas/ui — the Atlas Design System.
 *
 * Public surface: tokens, utilities, hooks, and the base component library.
 * Every component honors the Design System (doc 05), Motion System (doc 04),
 * and Accessibility (doc 06) blueprints.
 */

// Utilities
export { cn } from "./utils/cn";

// Hooks
export { usePrefersReducedMotion } from "./hooks/use-prefers-reduced-motion";

// Tokens
export * as tokens from "./tokens/index";

// Components
export { Button, buttonVariants, type ButtonProps } from "./components/button/button";
export { Spinner, type SpinnerProps } from "./components/spinner/spinner";
export { Skeleton, type SkeletonProps } from "./components/skeleton/skeleton";
export { Input, type InputProps } from "./components/input/input";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  type CardProps,
} from "./components/card/card";
export { VisuallyHidden } from "./components/visually-hidden/visually-hidden";
