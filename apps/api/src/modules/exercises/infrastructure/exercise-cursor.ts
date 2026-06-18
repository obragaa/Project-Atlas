/**
 * Opaque keyset cursor for the exercise catalogue (blueprint/13/14 Cursor
 * Pagination). Encodes the last row's stable sort key (lower(name), id) as
 * base64url. A malformed cursor decodes to null and is treated as the first page
 * (defensive — never a 500).
 */
export interface ExerciseCursor {
  /** Lowercased name (the sort key's first component). */
  readonly name: string;
  readonly id: string;
}

export function encodeCursor(cursor: ExerciseCursor): string {
  const payload = JSON.stringify({ n: cursor.name, i: cursor.id });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeCursor(raw: string): ExerciseCursor | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { n?: unknown; i?: unknown };
    if (typeof parsed.n !== "string" || typeof parsed.i !== "string") {
      return null;
    }
    return { name: parsed.n, id: parsed.i };
  } catch {
    return null;
  }
}
