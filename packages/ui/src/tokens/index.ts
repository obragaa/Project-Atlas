/**
 * Public token surface. Import semantic tokens for component authoring; import
 * primitives only for advanced composition (e.g. data visualization).
 */
export * as primitives from "./primitives";
export { color, type SemanticColors } from "./semantic";
export {
  spacing,
  radius,
  typography,
  motion,
  elevation,
  zIndex,
  opacity,
  palette,
} from "./primitives";
