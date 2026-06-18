import { type Request } from "express";
import { DeviceId } from "../domain/device-id.js";
import { type SessionContext } from "../application/session.factory.js";

export const DEVICE_ID_HEADER = "x-device-id";

/**
 * Derives the session context from the request (blueprint/15 Device Management).
 * The client may present a stable opaque device id via the `x-device-id` header;
 * otherwise a fresh one is generated for this session. Risk scoring is seeded as
 * `low` for now (the full scoring engine is deferred — see tracked exceptions).
 */
export function sessionContextFromRequest(req: Request): SessionContext {
  const headerValue = req.headers[DEVICE_ID_HEADER];
  const deviceId = isValidDeviceId(headerValue) ? headerValue : DeviceId.generate().toString();
  return { deviceId, riskLevel: "low" };
}

function isValidDeviceId(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  try {
    DeviceId.create(value);
    return true;
  } catch {
    return false;
  }
}
