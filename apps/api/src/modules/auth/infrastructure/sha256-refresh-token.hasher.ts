import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { type RefreshTokenHasher } from "../domain/ports.js";
import { type Environment } from "../../../config/environment.js";

/**
 * Hashes refresh tokens for at-rest storage (blueprint/15/16: never store the
 * raw token). Refresh tokens are high-entropy random JWTs, so a fast keyed hash
 * is the correct primitive (not argon2). When `AUTH_REFRESH_HASH_PEPPER` is set,
 * an HMAC-SHA-256 is used so a store dump alone cannot forge a match.
 */
@Injectable()
export class Sha256RefreshTokenHasher implements RefreshTokenHasher {
  private readonly pepper?: string;

  constructor(config: ConfigService<Environment, true>) {
    this.pepper = config.get("AUTH_REFRESH_HASH_PEPPER", { infer: true });
  }

  hash(rawToken: string): string {
    if (this.pepper) {
      return createHmac("sha256", this.pepper).update(rawToken).digest("hex");
    }
    return createHash("sha256").update(rawToken).digest("hex");
  }

  /** Constant-time comparison of two hex digests. */
  matches(a: string, b: string): boolean {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }
}
