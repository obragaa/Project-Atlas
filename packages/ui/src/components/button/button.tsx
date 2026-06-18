import { type ButtonHTMLAttributes, forwardRef } from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { Spinner } from "../spinner/spinner";

/**
 * Button — the primary action primitive.
 *
 * Encodes every interactive state required by blueprint/05 - Design System.md
 * (default / hover / focus / pressed / disabled / loading) and the motion
 * principles of blueprint/04 (subtle elevation & translate, no exaggeration,
 * reduced-motion aware). Focus is elegant, never aggressive (doc 04 "Focus").
 */
const buttonVariants = cva(
  cn(
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md font-medium outline-none",
    "transition-[transform,background-color,box-shadow,color] duration-fast ease-standard",
    "focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface-base",
    "active:translate-y-px motion-reduce:active:translate-y-0",
    "disabled:pointer-events-none disabled:opacity-45",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-accent text-on-accent shadow-sm",
          "hover:bg-accent-hover hover:shadow-glow",
          "active:bg-accent-active",
        ),
        secondary: cn(
          "bg-surface-overlay text-text-primary border border-border",
          "hover:border-border-strong hover:bg-surface-raised",
          "active:bg-surface-overlay",
        ),
        ghost: cn(
          "bg-transparent text-text-secondary",
          "hover:bg-surface-overlay hover:text-text-primary",
          "active:bg-surface-raised",
        ),
        danger: cn(
          "bg-danger-solid text-on-accent shadow-sm",
          "hover:brightness-110",
          "active:brightness-95",
        ),
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Shows a spinner, disables interaction, and announces a busy state. */
  isLoading?: boolean;
  /** Optional text shown next to the spinner while loading. */
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    isLoading = false,
    loadingText,
    disabled,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      aria-busy={isLoading || undefined}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner size={size === "lg" ? "md" : "sm"} label={loadingText ?? "Carregando"} />
          {loadingText ? <span>{loadingText}</span> : null}
        </>
      ) : (
        children
      )}
    </button>
  );
});

export { buttonVariants };
