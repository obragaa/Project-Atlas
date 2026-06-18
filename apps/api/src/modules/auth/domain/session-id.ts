import { Identifier } from "../../../shared/domain/identifier.js";

/** Opaque session identifier (blueprint/15 "Session Model"). */
export class SessionId extends Identifier<"SessionId"> {
  static create(value: string): SessionId {
    return new SessionId(value);
  }

  static generate(): SessionId {
    return new SessionId(Identifier.newId());
  }
}

/**
 * Opaque session-family identifier. One family per login; every rotation stays
 * in the same family, so reuse of a superseded token can revoke the whole
 * chain (blueprint/15 reuse detection).
 */
export class FamilyId extends Identifier<"FamilyId"> {
  static create(value: string): FamilyId {
    return new FamilyId(value);
  }

  static generate(): FamilyId {
    return new FamilyId(Identifier.newId());
  }
}
