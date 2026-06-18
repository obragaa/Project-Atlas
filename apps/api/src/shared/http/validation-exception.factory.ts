import { type ValidationError as ClassValidatorError } from "class-validator";
import { type ValidationIssue } from "@atlas/contracts";
import { ValidationError } from "../domain/errors.js";

/**
 * Translates class-validator errors into a domain `ValidationError`, so request
 * validation failures surface as RFC 7807 422 responses with field-level issues
 * (blueprint/14 - API.md error taxonomy) rather than Nest's default 400.
 */
export function validationExceptionFactory(errors: ClassValidatorError[]): ValidationError {
  const issues = flatten(errors);
  return new ValidationError("Alguns campos precisam ser corrigidos.", issues);
}

function flatten(errors: ClassValidatorError[], parentPath = ""): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      for (const [code, message] of Object.entries(error.constraints)) {
        issues.push({ field: path, message, code: `validation.${code}` });
      }
    }

    if (error.children && error.children.length > 0) {
      issues.push(...flatten(error.children, path));
    }
  }

  return issues;
}
