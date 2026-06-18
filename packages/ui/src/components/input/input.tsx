import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "../../utils/cn.js";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label. Required — placeholders are never the sole label (doc 06). */
  label: string;
  /** Helper text shown below the field. */
  hint?: string;
  /** Error message. When present, the field renders its error state. */
  error?: string;
  /** Marks the field as required, with an accessible indicator. */
  requiredField?: boolean;
}

/**
 * Input — a labelled text field.
 *
 * Honors blueprint/06 - Accessibility.md: always a real <label>, required
 * indication, error linked via aria-describedby, error state not conveyed by
 * color alone (icon-free here but paired with text + border + aria-invalid).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, requiredField, id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  const describedBy =
    [hint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
        {label}
        {requiredField ? (
          <span aria-hidden="true" className="ml-0.5 text-danger-text">
            *
          </span>
        ) : null}
        {requiredField ? <span className="sr-only"> (obrigatório)</span> : null}
      </label>

      <input
        ref={ref}
        id={inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        aria-required={requiredField || undefined}
        disabled={disabled}
        className={cn(
          "h-10 w-full rounded-md bg-surface-raised px-3 text-sm text-text-primary",
          "border outline-none placeholder:text-text-tertiary",
          "transition-[border-color,box-shadow] duration-fast ease-standard",
          "focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
          "focus-visible:ring-offset-surface-base",
          "disabled:cursor-not-allowed disabled:opacity-45",
          hasError
            ? "border-danger-solid focus-visible:border-danger-solid"
            : "border-border focus-visible:border-border-focus",
        )}
        {...rest}
      />

      {hint && !hasError ? (
        <p id={hintId} className="text-xs text-text-tertiary">
          {hint}
        </p>
      ) : null}

      {hasError ? (
        <p id={errorId} role="alert" className="text-xs text-danger-text">
          {error}
        </p>
      ) : null}
    </div>
  );
});
