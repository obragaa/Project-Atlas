import { ValueObject } from "../../../../shared/domain/value-object.js";
import { ValidationError } from "../../../../shared/domain/errors.js";

interface EmailProps {
  readonly value: string;
}

// Pragmatic, RFC-5321-aligned check. Full RFC validation is intentionally
// avoided (blueprint/24: clarity over cleverness); deliverability is verified
// out of band.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email value object (blueprint/13 - Database.md "Value Objects"). Normalized to
 * lowercase. Identity never depends on email (doc 15 "Identity Model"); this is
 * a contactable attribute, validated and immutable.
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized) || normalized.length > 254) {
      throw new ValidationError(
        "Informe um e-mail válido.",
        [{ field: "email", message: "Informe um e-mail válido.", code: "email.invalid" }],
        "email.invalid",
      );
    }
    return new Email({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }

  override toString(): string {
    return this.props.value;
  }
}
