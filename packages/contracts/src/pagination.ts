/**
 * Cursor pagination contract (blueprint/13 - Database.md and 14 - API.md, both
 * ADR "Cursor Pagination"). Offset pagination is avoided for large collections;
 * cursors keep performance predictable.
 */

/** Query parameters accepted by any paginated collection endpoint. */
export interface CursorPageQuery {
  /** Opaque cursor returned by a previous page. Absent for the first page. */
  readonly cursor?: string;
  /** Maximum number of items to return. Server clamps to a safe maximum. */
  readonly limit?: number;
}

/** A page of results with cursors for forward/backward navigation. */
export interface CursorPage<TItem> {
  readonly items: readonly TItem[];
  readonly nextCursor: string | null;
  readonly previousCursor: string | null;
  readonly hasNext: boolean;
}
