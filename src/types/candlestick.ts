import type { Color, Symbols, XAxis, YAxis } from './common';
import type { ChartThreshold } from './render-chart';

/** One financial OHLC sample positioned on a numeric X axis. */
export type CandlestickDatum = readonly [
  x: number,
  open: number,
  high: number,
  low: number,
  close: number,
];

/** Body style for one candlestick price direction. */
export type CandlestickMarkStyle = Readonly<{
  /** One-column body glyph. */
  symbol?: string;
  /** ANSI color applied to the body and wick. */
  color?: Color;
}>;

/** Symbols and colors used to distinguish candle directions. */
export type CandlestickStyle = Readonly<{
  /** One-column wick glyph. */
  wick?: string;
  /** Style used when close is greater than open. */
  rising?: CandlestickMarkStyle;
  /** Style used when close is less than open. */
  falling?: CandlestickMarkStyle;
  /** Style used when close equals open. */
  unchanged?: CandlestickMarkStyle;
}>;

/** Complete candlestick chart specification. */
export type CandlestickSpec = Readonly<{
  /** Unique-X OHLC tuples satisfying `low <= open/close <= high`. */
  data: readonly CandlestickDatum[];
  /** Plot width in terminal columns. */
  width?: number;
  /** Plot height in terminal rows. */
  height?: number;
  /** Title rendered above the chart. */
  title?: string;
  /** Numeric X-axis configuration. */
  xAxis?: XAxis<number>;
  /** Numeric Y-axis configuration. */
  yAxis?: YAxis;
  /** Per-direction body colors and glyphs plus a wick glyph. */
  style?: CandlestickStyle;
  /** Named horizontal or vertical reference lines. */
  thresholds?: readonly ChartThreshold<number>[];
  /** Shared symbol overrides. `style` glyphs take precedence. */
  symbols?: Symbols;
  /** Logs out-of-bounds drawing attempts for diagnostics. */
  debugMode?: boolean;
}>;

/** Renders a candlestick chart from OHLC data. */
export type Candlestick = (spec: CandlestickSpec) => string;
