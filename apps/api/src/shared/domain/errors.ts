import { type ErrorCategory, type ValidationIssue } from "@atlas/contracts";

/**
 * Domain errors — framework-agnostic. The Domain and Application layers throw
 * these; the Presentation layer's exception filter translates them into RFC
 * 7807 responses (blueprint/12 - Backend Architecture.md "Tratamento de Erros",
 * 14 - API.md "Error Taxonomy"). The domain never knows about HTTP.
 */
export abstract class DomainError extends Error {
  abstract readonly category: ErrorCategory;
  /** Stable machine-readable code, e.g. "auth.invalid_credentials". */
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Input failed validation. Carries field-level issues. */
export class ValidationError extends DomainError {
  readonly category = "validation" as const;
  readonly code: string;
  readonly issues: readonly ValidationIssue[];

  constructor(message: string, issues: readonly ValidationIssue[], code = "validation.failed") {
    super(message);
    this.issues = issues;
    this.code = code;
  }
}

/** The caller is not authenticated, or authentication failed. */
export class AuthenticationError extends DomainError {
  readonly category = "authentication" as const;
  readonly code: string;

  constructor(message = "Authentication required.", code = "auth.unauthenticated") {
    super(message);
    this.code = code;
  }
}

/** The caller is authenticated but lacks permission. */
export class AuthorizationError extends DomainError {
  readonly category = "authorization" as const;
  readonly code: string;

  constructor(
    message = "You do not have permission to perform this action.",
    code = "auth.forbidden",
  ) {
    super(message);
    this.code = code;
  }
}

/** A business invariant was violated. */
export class BusinessRuleError extends DomainError {
  readonly category = "business_rule" as const;
  readonly code: string;

  constructor(message: string, code = "business_rule.violated") {
    super(message);
    this.code = code;
  }
}

/** The operation conflicts with current state (e.g. duplicate). */
export class ConflictError extends DomainError {
  readonly category = "conflict" as const;
  readonly code: string;

  constructor(message: string, code = "conflict") {
    super(message);
    this.code = code;
  }
}

/** The requested resource does not exist. */
export class NotFoundError extends DomainError {
  readonly category = "not_found" as const;
  readonly code: string;

  constructor(message = "Resource not found.", code = "not_found") {
    super(message);
    this.code = code;
  }
}
