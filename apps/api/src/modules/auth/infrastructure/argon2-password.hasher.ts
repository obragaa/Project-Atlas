import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { type PasswordHasher } from "../domain/ports.js";

/**
 * Argon2id password hasher (blueprint/15 "Password Policy": a brute-force
 * resistant algorithm, unique salt per credential — argon2 salts internally).
 * Parameters follow OWASP guidance.
 */
@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  private readonly options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  };

  hash(plaintext: string): Promise<string> {
    return argon2.hash(plaintext, this.options);
  }

  async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      // A malformed hash must never crash auth; treat as a failed verification.
      return false;
    }
  }
}
