import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual size of the spinner. */
  size?: "sm" | "md" | "lg";
  /** Accessible label announced to assistive tech. Defaults to "Carregando". */
  label?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-2",
};

/**
 * Spinner — the last-resort loading indicator (blueprint/04 - Motion System.md
 * prefers skeletons; spinners are reserved for inline/button loading). Honors
 * reduced motion via CSS `motion-reduce`.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Carregando", className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex", className)}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block animate-spin rounded-full border-current border-t-transparent",
          "motion-reduce:animate-[spin_1.6s_linear_infinite]",
          sizeClasses[size],
        )}
      />
    </span>
  );
});
