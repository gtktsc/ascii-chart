import type { ChartX } from './axes';
import type { Color } from './colors';

/** Multi-series bar arrangement. */
export type BarLayout = 'overlap' | 'grouped' | 'stacked' | 'normalized';
/** Source metadata supplied to bar value-label formatters. */
export type ValueLabelContext<X extends ChartX = number> = Readonly<{
  /** Zero-based source-series index. */
  seriesIndex: number;
  /** Structured-series identifier when available. */
  seriesId?: string;
  /** Structured-series or legend name when available. */
  seriesName?: string;
  /** Zero-based index in the source series. */
  datumIndex: number;
  /** Native source X value. */
  x: X;
  /** Raw source Y value. */
  y: number;
  /** Bar orientation. */
  mode: 'bar' | 'horizontalBar';
  /** Resolved multi-series bar layout. */
  layout: BarLayout;
}>;
/** Formats one rendered bar value. */
export type ValueLabelFormatter<X extends ChartX = number> = (
  value: number,
  context: ValueLabelContext<X>,
) => number | string;
/** Enables bar endpoint labels or configures their text and ANSI color. */
export type ChartValueLabels<X extends ChartX = number> =
  | boolean
  | {
      /** Formats the rendered value; normalized layouts receive a percentage. */
      formatter?: ValueLabelFormatter<X>;
      /** ANSI color applied to every value label. */
      color?: Color;
    };
