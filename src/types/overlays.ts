import type { Color } from './colors';

/** Numeric vertical and/or horizontal reference line. */
export type Threshold = {
  /** X coordinate for a vertical reference line. */
  x?: number;
  /** Y coordinate for a horizontal reference line. */
  y?: number;
  /** ANSI color applied to the reference line. */
  color?: Color;
};
/** Point overlay positioned in numeric data coordinates. */
export type GraphPoint = {
  /** Numeric X coordinate. */
  x: number;
  /** Numeric Y coordinate. */
  y: number;
  /** ANSI color applied to the point glyph. */
  color?: Color;
};
