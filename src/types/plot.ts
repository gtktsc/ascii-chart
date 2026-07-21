import type {
  BarLayout,
  ChartValueLabels,
  ChartWidth,
  Color,
  Coloring,
  CustomSymbol,
  Formatter,
  GraphMode,
  GraphPoint,
  Interpolation,
  LegendPosition,
  LineFormatterArgs,
  MaybePoint,
  MultiLine,
  Overflow,
  Renderer,
  Symbols,
  Threshold,
  XAxis,
  YAxis,
} from './common';

/** Public plot datum. A null y-value creates a gap. */
export type PlotDatum = readonly [x: number, y: number | null];

/** One plot series with optional missing-value gaps. */
export type PlotLine = readonly PlotDatum[];

/** Coordinates accepted by plot. */
export type PlotCoordinates = PlotLine | readonly PlotLine[];

/** Legend placement, labels, and color for `plot`. */
export type Legend = {
  /** Placement relative to the plot. Defaults to `bottom`. */
  position?: LegendPosition;
  /** One series label or labels indexed by source series. */
  series?: string | string[];
  /** One point label or labels indexed by overlay point. */
  points?: string | string[];
  /** One threshold label or labels indexed by threshold. */
  thresholds?: string | string[];
  /** ANSI color applied to legend labels. */
  color?: Color;
};

/** Chooses one static series color from its index and complete input. */
export type ColorGetter = (series: number, coordinates: MultiLine) => Color;

/** One color, colors indexed by series, or a series-color callback. */
export type Colors = Color | Color[] | ColorGetter;

/** Complete configuration for numeric `plot` rendering. */
export type Settings = {
  /** Static series color configuration. */
  color?: Colors;
  /** Fixed plot width or `auto` for active terminal columns. Defaults to an input-derived width. */
  width?: ChartWidth;
  /** Plot height in terminal rows. Defaults to an input-derived height unless `aspectRatio` applies. */
  height?: number;
  /** Desired physical width-to-height ratio used when height is derived. */
  aspectRatio?: number;
  /** Explicit numeric Y extent as `[minimum, maximum]`. */
  yRange?: [number, number];
  /** Line behavior outside explicit domains. Defaults to `discard`. */
  overflow?: Overflow;
  /** Plot-cell backend. Defaults to `ascii`. */
  renderer?: Renderer;
  /** Reserves enough width for complete Y-axis tick labels. */
  showTickLabel?: boolean;
  /** Hides the X-axis line, ticks, labels, and axis label. */
  hideXAxis?: boolean;
  /** Hides X-axis tick markers and labels while retaining the axis line. */
  hideXAxisTicks?: boolean;
  /** Hides the Y-axis line, ticks, labels, and axis label. */
  hideYAxis?: boolean;
  /** Hides Y-axis tick markers and labels while retaining the axis line. */
  hideYAxisTicks?: boolean;
  /** Explicit finite X-axis tick values. */
  customXAxisTicks?: number[];
  /** Explicit finite Y-axis tick values. */
  customYAxisTicks?: number[];
  /** Title rendered above the chart. */
  title?: string;
  /** ANSI color applied to the title. */
  titleColor?: Color;
  /** X-axis label. */
  xLabel?: string;
  /** Y-axis label. */
  yLabel?: string;
  /** Numeric horizontal and/or vertical reference lines. */
  thresholds?: Threshold[];
  /** Point overlays rendered in data coordinates. */
  points?: GraphPoint[];
  /** Fills the region between line series and the X-axis baseline. */
  fillArea?: boolean;
  /** Legend placement, labels, and ANSI color. */
  legend?: Legend;
  /** Explicit X/Y axis intersection; `undefined` preserves an inferred coordinate. */
  axisCenter?: MaybePoint;
  /** Shared numeric axis-label formatter. Structured axis formatters take precedence. */
  formatter?: Formatter;
  /** Custom glyph callback for occupied series cells. */
  lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
  /** Per-call glyph overrides. */
  symbols?: Symbols;
  /** ANSI color applied to the configured border glyph. */
  borderColor?: Color;
  /** ANSI color applied to background glyphs. */
  backgroundColor?: Color;
  /** Graph primitive. Defaults to `line`. */
  mode?: GraphMode;
  /** Line-segment interpolation. Defaults to `step`. */
  interpolation?: Interpolation;
  /** Shared or per-series dynamic color strategy. */
  coloring?: Coloring | readonly (Coloring | undefined)[];
  /** Multi-series bar arrangement. Defaults to `overlap`. */
  barLayout?: BarLayout;
  /** Enables bar endpoint labels or configures their text and color. */
  valueLabels?: ChartValueLabels;
  /** Logs out-of-bounds drawing attempts for diagnostics. */
  debugMode?: boolean;
  /** Structured X-axis fields; each supplied field overrides its flat alias. */
  xAxis?: XAxis;
  /** Structured Y-axis fields; each supplied field overrides its flat alias. */
  yAxis?: YAxis;
};

/** Renders numeric coordinates as a terminal chart. */
export type Plot = (coordinates: PlotCoordinates, settings?: Settings) => string;
