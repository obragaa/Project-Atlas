import { ValidationError } from "../../../../shared/domain/errors.js";

const MIN_LENGTH = 12;
const MAX_LENGTH = 128;

/**
 * A raw password presented by a user, validated against policy before hashing
 * (blueprint/15 - Authentication.md "Password Policy"). This type only ever
 * holds a plaintext password transiently on its way to the hasher; it is never
 * persisted, logged, or returned (doc 15 / doc 16).
 */
export class RawPassword {
  private constructor(private readonly value: string) {}

  static create(raw: string): RawPassword {
    if (raw.length < MIN_LENGTH || raw.length > MAX_LENGTH) {
      throw new ValidationError(
        "A senha deve ter entre 12 e 128 caracteres.",
        [
          {
            field: "password",
            message: "A senha deve ter pelo menos 12 caracteres.",
            code: "password.too_short",
          },
        ],
        "password.policy",
      );
    }
    return new RawPassword(raw);
  }

  /** Exposes the plaintext to a hasher only. Never call this elsewhere. */
  reveal(): string {
    return this.value;
  }
}
