/**
 * Opaque keyset cursor for workout listings (blueprint/13/14 Cursor Pagination).
 * Encodes the last row's stable sort key (createdAt, id) as base64url. The cursor
 * is opaque to clients; a malformed cursor decodes to null and is treated as the
 * first page (defensive — never a 500).
 */
export interface WorkoutCursor {
  readonly createdAt: Date;
  readonly id: string;
}

export function encodeCursor(cursor: WorkoutCursor): string {
  const payload = JSON.stringify({ c: cursor.createdAt.toISOString(), i: cursor.id });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeCursor(raw: string): WorkoutCursor | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { c?: unknown; i?: unknown };
    if (typeof parsed.c !== "string" || typeof parsed.i !== "string") {
      return null;
    }
    const createdAt = new Date(parsed.c);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }
    return { createdAt, id: parsed.i };
  } catch {
    return null;
  }
}
