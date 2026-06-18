/**
 * @atlas/contracts — the API contract shared by producer (apps/api) and
 * consumers (apps/web). The OpenAPI document (`openapi/openapi.json`) is the
 * formal source of truth (blueprint/14 - API.md, ADR-001 "Contract First");
 * these types mirror it for type-safe authoring.
 */
export * from "./errors.js";
export * from "./pagination.js";
export * from "./auth.js";
export * from "./core.js";
export * from "./health.js";
export * from "./routes.js";
