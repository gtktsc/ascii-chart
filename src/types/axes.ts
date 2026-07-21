import type { Color } from './colors';
import type { Formatter, FormatterHelpers } from './formatting';
import type { LabelCollisionPolicy } from './rendering';

/** Native X-axis value accepted by structured charts. */
export type ChartX = string | number | Date;
/** Formats one native axis value for terminal output. */
export type AxisFormatter<Value extends ChartX> = (
  value: Value,
  helpers: FormatterHelpers,
) => number | string;
/** X-axis scale selected explicitly or inferred from data. */
export type XScale = 'linear' | 'band' | 'time';
/** Ordered categories for band scales or a two-value extent for continuous scales. */
export type XAxisDomain<X extends ChartX> = [X] extends [string] ? readonly X[] : readonly [X, X];
/** Structured X-axis configuration. */
export type XAxis<X extends ChartX = number> = {
  /** Scale kind. Defaults to the kind inferred from X values. */
  scale?: XScale;
  /** Explicit category order or continuous scale extent. */
  domain?: XAxisDomain<X>;
  /** Exact native tick values or an exact tick count of at least two. */
  ticks?: number | readonly X[];
  /** Axis label rendered outside tick labels. */
  label?: string;
  /** Formatter called with native X values. */
  formatter?: AxisFormatter<X>;
  /** Hides the axis line, ticks, labels, and axis label. */
  hidden?: boolean;
  /** Hides tick markers and labels while retaining the axis line. */
  hideTicks?: boolean;
  /** Handling for labels that do not fit the available width. */
  labelCollision?: LabelCollisionPolicy;
  /** ANSI color applied to the axis line, ticks, tick labels, and label. */
  color?: Color;
};
/** Numeric Y-axis configuration. */
export type YAxis = {
  /** Explicit numeric extent as `[minimum, maximum]`. */
  domain?: readonly [number, number];
  /** Exact numeric tick values or an exact tick count of at least two. */
  ticks?: number | readonly number[];
  /** Axis label rendered outside tick labels. */
  label?: string;
  /** Formatter called for each numeric Y-axis tick. */
  formatter?: Formatter;
  /** Hides the axis line, ticks, labels, and axis label. */
  hidden?: boolean;
  /** Hides tick markers and labels while retaining the axis line. */
  hideTicks?: boolean;
  /** Reserves enough width for complete Y-axis tick labels. */
  showTickLabel?: boolean;
  /** ANSI color applied to the axis line, ticks, tick labels, and label. */
  color?: Color;
};
/** Compatibility alias for a numeric chart axis. */
export type ChartAxis = YAxis;
