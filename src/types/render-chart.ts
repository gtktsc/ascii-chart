import type { ChartAnnotation } from './annotations';
import type {
  BarLayout,
  ChartValueLabels,
  ChartWidth,
  ChartX,
  Color,
  Coloring,
  CustomSymbol,
  GraphMode,
  GraphPoint,
  Interpolation,
  LegendPosition,
  LineFormatterArgs,
  MaybePoint,
  Overflow,
  Renderer,
  Symbols,
  Threshold,
  XAxis,
  YAxis,
} from './common';

export type {
  ChartAnnotation,
  ChartAnnotationBase,
  ChartArrowAnnotation,
  ChartErrorBarAnnotation,
  ChartErrorMagnitude,
  ChartSpanAnnotation,
  ChartTextAnnotation,
} from './annotations';

/** A structured chart datum. A null y-value creates a gap. */
export type ChartDatum<X extends ChartX = ChartX> = readonly [x: X, y: number | null];

/** One independently styled series in a structured chart. */
export type ChartSeries<X extends ChartX = ChartX> = {
  /** Unique series identifier used by legends and callback context. */
  id: string;
  /** Human-readable series label. Defaults to `id`. */
  name?: string;
  /** Native-X/numeric-Y values; `null` creates a continuity gap. */
  data: readonly ChartDatum<X>[];
  /** Series rendering primitive. Defaults to `line`. */
  mode?: GraphMode;
  /** Line-segment interpolation. Defaults to `step`. */
  interpolation?: Interpolation;
  /** Static ANSI series color. */
  color?: Color;
  /** Dynamic per-cell series-color strategy. */
  coloring?: Coloring;
  /** Fills the region between a line and the X-axis baseline. */
  fillArea?: boolean;
  /** Custom glyph callback for occupied series cells. */
  lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
  /** Y-axis assignment. Defaults to `primary`. */
  yAxis?: 'primary' | 'secondary';
};

/** Legend configuration and optional entity selection by id. */
export type ChartLegend = {
  /** Placement relative to the plot. */
  position: LegendPosition;
  /** `true` shows all series; an ID array selects and orders entries. */
  series?: boolean | readonly string[];
  /** `true` shows all points; an ID array selects and orders entries. */
  points?: boolean | readonly string[];
  /** `true` shows all thresholds; an ID array selects and orders entries. */
  thresholds?: boolean | readonly string[];
  /** ANSI color applied to legend labels. */
  color?: Color;
};

/** Named overlay point for a structured chart. */
export type ChartOverlayPoint<X extends ChartX = number> = Omit<GraphPoint, 'x'> & {
  /** Unique point identifier used by legends. */
  id: string;
  /** Human-readable point label. Defaults to `id`. */
  name?: string;
  /** Native X coordinate. */
  x: X;
};

/** Named threshold for a structured chart. */
export type ChartThreshold<X extends ChartX = number> = Omit<Threshold, 'x'> & {
  /** Unique threshold identifier used by legends. */
  id: string;
  /** Human-readable threshold label. Defaults to `id`. */
  name?: string;
  /** Optional native X coordinate for a vertical reference line. */
  x?: X;
};

/** Complete structured chart specification. */
export type ChartSpec<X extends ChartX = number> = {
  /** Structured series collection. May be empty; explicit axis domains can define an empty frame. */
  series: readonly ChartSeries<X>[];
  /** Fixed plot width or `auto` for active terminal columns. Defaults to 60. */
  width?: ChartWidth;
  /** Plot height in terminal rows. Defaults to 15 unless derived. */
  height?: number;
  /** Desired physical width-to-height ratio used when height is derived. */
  aspectRatio?: number;
  /** Title rendered above the chart. */
  title?: string;
  /** ANSI color applied to the title. */
  titleColor?: Color;
  /** Line behavior outside explicit domains. Defaults to `discard`. */
  overflow?: Overflow;
  /** Plot-cell backend. Defaults to `ascii`. */
  renderer?: Renderer;
  /** Native X-axis configuration. */
  xAxis?: XAxis<X>;
  /** Primary numeric Y-axis configuration. */
  yAxis?: YAxis;
  /** Independently scaled right-side Y-axis configuration. */
  secondaryYAxis?: YAxis;
  /** Legend placement, entity selection, and ANSI color. */
  legend?: ChartLegend;
  /** Explicit numeric X/Y axis intersection. */
  axisCenter?: MaybePoint;
  /** Named point overlays rendered on the primary Y-axis. */
  points?: readonly ChartOverlayPoint<X>[];
  /** Named reference lines rendered on the primary Y-axis. */
  thresholds?: readonly ChartThreshold<X>[];
  /** Data-coordinate spans, text, arrows, and error bars. */
  annotations?: readonly ChartAnnotation<X>[];
  /** Per-call glyph overrides. */
  symbols?: Symbols;
  /** ANSI color applied to the configured border glyph. */
  borderColor?: Color;
  /** ANSI color applied to background glyphs. */
  backgroundColor?: Color;
  /** Logs out-of-bounds drawing attempts for diagnostics. */
  debugMode?: boolean;
  /** Shared arrangement for multi-series bars. Defaults to `overlap`. */
  barLayout?: BarLayout;
  /** Enables bar endpoint labels or configures their text and color. */
  valueLabels?: ChartValueLabels<X>;
};

/** Renders a structured chart specification. */
export type RenderChart = <X extends ChartX>(spec: ChartSpec<X>) => string;
