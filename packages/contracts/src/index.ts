/**
 * @atlas/contracts — the API contract shared by producer (apps/api) and
 * consumers (apps/web). The OpenAPI document (`openapi/openapi.json`) is the
 * formal source of truth (blueprint/14 - API.md, ADR-001 "Contract First");
 * these types mirror it for type-safe authoring.
 */
export * from "./errors";
export * from "./pagination";
export * from "./auth";
export * from "./core";
export * from "./workouts";
export * from "./health";
export * from "./routes";
