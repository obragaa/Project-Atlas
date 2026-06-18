import { v4 as uuidv4, validate as uuidValidate } from "uuid";

/**
 * An opaque, type-safe identifier (blueprint/13 - Database.md "Chaves
 * Primárias": always opaque; never a natural key like email/CPF/username).
 *
 * The phantom `__brand` ties an id to its entity type at compile time so a
 * `UserId` can never be passed where a `WorkoutId` is expected.
 */
export class Identifier<TBrand extends string> {
  private readonly value: string;
  /** Compile-time-only brand; never present at runtime. */
  declare private readonly __brand: TBrand;

  protected constructor(value: string) {
    if (!uuidValidate(value)) {
      throw new Error("Identifier must be a valid UUID.");
    }
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  equals(other?: Identifier<TBrand>): boolean {
    return other instanceof Identifier && other.value === this.value;
  }

  /** Generate a fresh opaque UUID string for subclass factories. */
  protected static newId(): string {
    return uuidv4();
  }
}
