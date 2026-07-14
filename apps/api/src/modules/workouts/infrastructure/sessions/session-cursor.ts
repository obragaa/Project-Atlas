/**
 * Opaque keyset cursor for session history (blueprint/13/14 Cursor Pagination).
 * Encodes the last row's stable sort key (performedOn, id) as base64url. History
 * is ordered by the civil day performed, so the cursor carries the AAAA-MM-DD
 * day string (not a timestamp) plus the id tiebreaker. A malformed cursor decodes
 * to null and is treated as the first page (defensive — never a 500).
 */
export interface SessionCursor {
  readonly performedOn: string;
  readonly id: string;
}

export function encodeCursor(cursor: SessionCursor): string {
  const payload = JSON.stringify({ p: cursor.performedOn, i: cursor.id });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeCursor(raw: string): SessionCursor | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { p?: unknown; i?: unknown };
    if (typeof parsed.p !== "string" || typeof parsed.i !== "string") {
      return null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.p)) {
      return null;
    }
    return { performedOn: parsed.p, id: parsed.i };
  } catch {
    return null;
  }
}
