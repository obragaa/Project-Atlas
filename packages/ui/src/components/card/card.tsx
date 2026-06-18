import { type HTMLAttributes, forwardRef } from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../utils/cn.js";

/**
 * Card — a light, breathable block of information (blueprint/05: cards must feel
 * light and organized, never heavy boxes). The `interactive` variant adds the
 * subtle hover elevation defined in blueprint/04 - Motion System.md.
 */
const cardVariants = cva(
  cn("rounded-xl border border-border-subtle bg-surface-raised text-text-primary"),
  {
    variants: {
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: cn(
          "cursor-pointer transition-[transform,box-shadow,border-color] duration-base ease-emphasized",
          "hover:-translate-y-0.5 hover:border-border hover:shadow-lg",
          "motion-reduce:hover:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
        ),
        false: "",
      },
    },
    defaultVariants: {
      padding: "md",
      interactive: false,
    },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padding, interactive, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(cardVariants({ padding, interactive }), className)} {...rest} />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("mb-4 flex flex-col gap-1", className)} {...rest} />;
  },
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...rest }, ref) {
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold tracking-tight text-text-primary", className)}
        {...rest}
      />
    );
  },
);

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...rest }, ref) {
  return <p ref={ref} className={cn("text-sm text-text-secondary", className)} {...rest} />;
});
