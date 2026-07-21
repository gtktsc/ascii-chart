import type { GraphMode } from './rendering';

/** One of the 16 supported ANSI foreground colors. */
export type Color = `ansi${
  | 'Red'
  | 'Green'
  | 'Black'
  | 'Yellow'
  | 'Blue'
  | 'Magenta'
  | 'Cyan'
  | 'White'
  | 'BrightBlack'
  | 'BrightRed'
  | 'BrightGreen'
  | 'BrightYellow'
  | 'BrightBlue'
  | 'BrightMagenta'
  | 'BrightCyan'
  | 'BrightWhite'}`;

/** Data and plot coordinates supplied to conditional color callbacks. */
export type ColorContext = {
  /** Zero-based source-series index. */
  series: number;
  /** Rendering mode used by the occupied cell. */
  mode: GraphMode;
  /** Numeric data-space X coordinate. */
  x: number;
  /** Numeric data-space Y coordinate. */
  y: number;
  /** Zero-based plot-column coordinate. */
  plotX: number;
  /** Zero-based plot-row coordinate. */
  plotY: number;
};

/** Dynamic per-cell series-color strategy. */
export type Coloring =
  | {
      /** Selects callback-based colors. */
      type: 'conditional';
      /** Returns a color or `undefined` to use the static series fallback. */
      getColor: (context: ColorContext) => Color | undefined;
    }
  | {
      /** Selects equal-band palette coloring. */
      type: 'gradient';
      /** Data-space axis used to select a palette band. */
      by: 'x' | 'y';
      /** Nonempty ordered ANSI color palette. */
      colors: readonly Color[];
      /** Optional finite palette extent. Defaults to the resolved chart domain. */
      domain?: readonly [number, number];
    };
