/**
 * Opaque keyset cursor for measurement history (blueprint/13/14 Cursor
 * Pagination). Encodes the last row's sort key (recordedOn, id) as base64url. A
 * malformed cursor decodes to null and is treated as the first page (defensive).
 */
export interface MeasurementCursor {
  /** ISO date string (YYYY-MM-DD). */
  readonly recordedOn: string;
  readonly id: string;
}

export function encodeCursor(cursor: MeasurementCursor): string {
  const payload = JSON.stringify({ d: cursor.recordedOn, i: cursor.id });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeCursor(raw: string): MeasurementCursor | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { d?: unknown; i?: unknown };
    if (typeof parsed.d !== "string" || typeof parsed.i !== "string") {
      return null;
    }
    return { recordedOn: parsed.d, id: parsed.i };
  } catch {
    return null;
  }
}
