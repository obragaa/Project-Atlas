import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn.js";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Renders a circular skeleton (e.g. for avatars). */
  circle?: boolean;
}

/**
 * Skeleton — the preferred loading affordance (blueprint/04 - Motion System.md:
 * "Spinner será a última opção"). Skeletons must mirror the structure they
 * stand in for, never generic blocks. The shimmer respects reduced motion.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { circle, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden bg-surface-overlay",
        circle ? "rounded-full" : "rounded-md",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        "before:animate-[atlas-shimmer_1.6s_ease-in-out_infinite]",
        "motion-reduce:before:hidden",
        className,
      )}
      {...rest}
    />
  );
});
