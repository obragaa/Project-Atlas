/**
 * Error contract — RFC 7807 "Problem Details for HTTP APIs" (blueprint/14 - API.md,
 * ADR-003). Every error response across the Atlas API conforms to this shape.
 * Internal details (stack traces, SQL, framework) are never exposed
 * (blueprint/16 - Security.md).
 */

/** The fixed taxonomy of error categories (blueprint/14 - API.md "Error Taxonomy"). */
export const ERROR_CATEGORIES = [
  "validation",
  "authentication",
  "authorization",
  "business_rule",
  "conflict",
  "not_found",
  "rate_limit",
  "infrastructure",
  "unexpected",
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

/** A single field-level validation issue. */
export interface ValidationIssue {
  /** Dotted path to the offending field, e.g. "profile.weight". */
  readonly field: string;
  /** Human-readable, user-safe message. */
  readonly message: string;
  /** Stable machine code for programmatic handling. */
  readonly code: string;
}

/**
 * RFC 7807 Problem Details, with Atlas extensions (`category`, `traceId`,
 * optional `issues` for validation errors).
 */
export interface ProblemDetails {
  /** URI reference identifying the problem type. */
  readonly type: string;
  /** Short, human-readable summary of the problem type. */
  readonly title: string;
  /** HTTP status code. */
  readonly status: number;
  /** Human-readable explanation specific to this occurrence. */
  readonly detail: string;
  /** URI reference identifying the specific occurrence. */
  readonly instance?: string;
  /** Atlas error category (extension member). */
  readonly category: ErrorCategory;
  /** Correlation id for tracing this occurrence (extension member). */
  readonly traceId: string;
  /** Field-level issues, present for validation errors (extension member). */
  readonly issues?: readonly ValidationIssue[];
}
