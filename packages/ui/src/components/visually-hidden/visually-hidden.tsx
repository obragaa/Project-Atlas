import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn.js";

/**
 * VisuallyHidden — content available to assistive technology but not painted.
 * Used for screen-reader-only labels (blueprint/06 - Accessibility.md).
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function VisuallyHidden({ className, ...rest }, ref) {
    return <span ref={ref} className={cn("sr-only", className)} {...rest} />;
  },
);
