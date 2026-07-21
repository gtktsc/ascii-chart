import type { Point, SingleLine } from './geometry';

/** Source and plot coordinates supplied to custom line formatters. */
export type LineFormatterArgs = {
  /** Numeric data-space X coordinate. */
  x: number;
  /** Numeric data-space Y coordinate. */
  y: number;
  /** Zero-based plot-column coordinate. */
  plotX: number;
  /** Zero-based plot-row coordinate. */
  plotY: number;
  /** Complete source series. */
  input: SingleLine;
  /** Zero-based datum index in the source series. */
  index: number;
  /** Resolved minimum Y value. */
  minY: number;
  /** Resolved minimum X value. */
  minX: number;
  /** Expanded numeric X coordinates used by the renderer. */
  expansionX: number[];
  /** Expanded numeric Y coordinates used by the renderer. */
  expansionY: number[];
  /** Converts data coordinates into plot coordinates. */
  toPlotCoordinates: (x: number, y: number) => Point;
};

/** One custom glyph positioned in plot coordinates. */
export type CustomSymbol = {
  /** Zero-based plot-column coordinate. */
  x: number;
  /** Zero-based plot-row coordinate. */
  y: number;
  /** One-column display glyph. */
  symbol: string;
};
/** Resolved axis context supplied to numeric formatters. */
export type FormatterHelpers = {
  /** Axis currently being formatted. */
  axis: 'x' | 'y';
  /** Resolved numeric X extent. */
  xRange: number[];
  /** Resolved numeric Y extent. */
  yRange: number[];
};
/** Formats one numeric axis value for terminal output. */
export type Formatter = (value: number, helpers: FormatterHelpers) => number | string;
