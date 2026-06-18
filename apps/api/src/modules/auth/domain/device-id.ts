import { Identifier } from "../../../shared/domain/identifier.js";

/**
 * Device identifier (blueprint/15 "Device Management", ADR-003: every session
 * belongs to a device). Generated per first-seen device when the client does
 * not present one.
 */
export class DeviceId extends Identifier<"DeviceId"> {
  static create(value: string): DeviceId {
    return new DeviceId(value);
  }

  static generate(): DeviceId {
    return new DeviceId(Identifier.newId());
  }
}
