import type { AXIS, CHART, THRESHOLDS } from '@constants';

/** Recursively marks every property and nested value as readonly. */
export type DeepReadonly<Value> = Value extends object
  ? { readonly [Key in keyof Value]: DeepReadonly<Value[Key]> }
  : Value;

/** Per-call sparkline glyph overrides. */
export type SparklineSymbols = Readonly<{
  /** Exactly eight one-column glyphs ordered from lowest to highest. */
  levels?: readonly [string, string, string, string, string, string, string, string];
  /** One-column glyph used for `null`. */
  empty?: string;
}>;

/** Per-call heatmap glyph overrides. */
export type HeatmapSymbols = Readonly<{
  /** Default one-column categorical cell glyph. */
  cell?: string;
  /** Default one-column glyph for values below a threshold. */
  belowThreshold?: string;
  /** Default one-column glyph for values at or above a threshold. */
  aboveThreshold?: string;
  /** One-column glyph used for `null`. */
  empty?: string;
  /** Display-safe text inserted between cells. */
  gap?: string;
}>;

/** Shared candlestick glyph overrides. */
export type CandlestickSymbols = Readonly<{
  /** One-column wick glyph. */
  wick?: string;
  /** One-column glyph used when close is greater than open. */
  rising?: string;
  /** One-column glyph used when close is less than open. */
  falling?: string;
  /** One-column glyph used when close equals open. */
  unchanged?: string;
}>;

/** Direction-specific one-column annotation arrowheads. */
export type ArrowHeadSymbols = Readonly<{
  /** Left-facing arrowhead. */
  left?: string;
  /** Right-facing arrowhead. */
  right?: string;
  /** Up-facing arrowhead. */
  up?: string;
  /** Down-facing arrowhead. */
  down?: string;
  /** Up-left arrowhead. */
  upLeft?: string;
  /** Up-right arrowhead. */
  upRight?: string;
  /** Down-left arrowhead. */
  downLeft?: string;
  /** Down-right arrowhead. */
  downRight?: string;
}>;

/** One-column glyphs used by annotation error bars. */
export type ErrorBarSymbols = Readonly<{
  /** Horizontal whisker glyph. */
  horizontal?: string;
  /** Vertical whisker glyph. */
  vertical?: string;
  /** Left cap glyph. */
  leftCap?: string;
  /** Right cap glyph. */
  rightCap?: string;
  /** Top cap glyph. */
  topCap?: string;
  /** Bottom cap glyph. */
  bottomCap?: string;
  /** Error-bar center glyph. */
  center?: string;
}>;

/** Shared annotation glyph overrides. */
export type AnnotationSymbols = Readonly<{
  /** One-column reference-span fill glyph. */
  span?: string;
  /** One-column arrow-line glyph. */
  arrowLine?: string;
  /** Direction-specific arrowhead glyphs. */
  arrowHeads?: ArrowHeadSymbols;
  /** Error-bar glyphs. */
  errorBar?: ErrorBarSymbols;
}>;

/** Symbols shared by plot, renderChart, and candlestick. */
export type Symbols = {
  /** Axis line, tick, boundary, and intersection glyph overrides. */
  axis?: Partial<typeof AXIS>;
  /** Line and filled-area glyph overrides. */
  chart?: Partial<typeof CHART>;
  /** One-column glyph for unoccupied plot cells. */
  empty?: string;
  /** One-column glyph painted behind plot data. */
  background?: string;
  /** One-column glyph used for the plot border. */
  border?: string;
  /** Horizontal and vertical threshold glyph overrides. */
  thresholds?: Partial<typeof THRESHOLDS>;
  /** One-column point glyph. */
  point?: string;
  /** Shared candlestick glyph overrides. */
  candlestick?: CandlestickSymbols;
  /** Shared annotation glyph overrides. */
  annotations?: AnnotationSymbols;
  /** One-column glyph used when labels are truncated. */
  ellipsis?: string;
};
