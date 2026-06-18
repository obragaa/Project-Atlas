import { Identifier } from "../../../shared/domain/identifier.js";

/** Opaque identity of a user (blueprint/15 "Identity Model"). */
export class UserId extends Identifier<"UserId"> {
  static create(value: string): UserId {
    return new UserId(value);
  }

  static generate(): UserId {
    return new UserId(Identifier.newId());
  }
}
