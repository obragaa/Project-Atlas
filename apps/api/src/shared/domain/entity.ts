import { type Identifier } from "./identifier.js";

/**
 * Base Entity — an object with a stable identity and a mutable lifecycle
 * (blueprint/13 - Database.md "Entidades"). Equality is by identifier, not by
 * attribute values.
 */
export abstract class Entity<TId extends Identifier<string>> {
  protected readonly _id: TId;

  protected constructor(id: TId) {
    this._id = id;
  }

  get id(): TId {
    return this._id;
  }

  equals(other?: Entity<TId>): boolean {
    if (other === undefined || other === null) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._id.equals(other._id);
  }
}
