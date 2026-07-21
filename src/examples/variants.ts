import {
  BarLayout,
  ChartAnnotation,
  ChartSeries,
  ChartTextAnnotation,
  Color,
  Coloring,
  GraphMode,
  Interpolation,
  LabelCollisionPolicy,
  LegendPosition,
  Overflow,
  Renderer,
  XScale,
} from '@types';

import type { VariantExampleCoverage } from './types';

const exhaustiveValues =
  <Union>() =>
  <Values extends readonly Union[]>(
    values: Exclude<Union, Values[number]> extends never ? Values : never,
  ): Values =>
    values;

/**
 * Supported renderer variants values.
 */
export const RENDERER_VARIANTS = exhaustiveValues<Renderer>()(['ascii', 'braille'] as const);
/**
 * Supported graph mode variants values.
 */
export const GRAPH_MODE_VARIANTS = exhaustiveValues<GraphMode>()([
  'line',
  'point',
  'bar',
  'horizontalBar',
] as const);
/**
 * Supported interpolation variants values.
 */
export const INTERPOLATION_VARIANTS = exhaustiveValues<Interpolation>()([
  'step',
  'linear',
] as const);
/**
 * Supported overflow variants values.
 */
export const OVERFLOW_VARIANTS = exhaustiveValues<Overflow>()(['clip', 'discard'] as const);
/**
 * Supported bar layout variants values.
 */
export const BAR_LAYOUT_VARIANTS = exhaustiveValues<BarLayout>()([
  'overlap',
  'grouped',
  'stacked',
  'normalized',
] as const);
/**
 * Supported x scale variants values.
 */
export const X_SCALE_VARIANTS = exhaustiveValues<XScale>()(['linear', 'band', 'time'] as const);
/**
 * Supported label collision variants values.
 */
export const LABEL_COLLISION_VARIANTS = exhaustiveValues<LabelCollisionPolicy>()([
  'hide',
  'truncate',
  'wrap',
  'error',
] as const);
/**
 * Supported legend position variants values.
 */
export const LEGEND_POSITION_VARIANTS = exhaustiveValues<LegendPosition>()([
  'left',
  'right',
  'top',
  'bottom',
  'auto',
] as const);
/**
 * Supported annotation type variants values.
 */
export const ANNOTATION_TYPE_VARIANTS = exhaustiveValues<ChartAnnotation['type']>()([
  'span',
  'text',
  'arrow',
  'errorBar',
] as const);
/**
 * Supported coloring type variants values.
 */
export const COLORING_TYPE_VARIANTS = exhaustiveValues<Coloring['type']>()([
  'conditional',
  'gradient',
] as const);
/**
 * Supported gradient axis variants values.
 */
export const GRADIENT_AXIS_VARIANTS = exhaustiveValues<
  Extract<Coloring, { type: 'gradient' }>['by']
>()(['x', 'y'] as const);
/**
 * Supported series Y-axis variant values.
 */
export const SERIES_Y_AXIS_VARIANTS = exhaustiveValues<NonNullable<ChartSeries['yAxis']>>()([
  'primary',
  'secondary',
] as const);
/**
 * Supported text align variants values.
 */
export const TEXT_ALIGN_VARIANTS = exhaustiveValues<NonNullable<ChartTextAnnotation['align']>>()([
  'left',
  'center',
  'right',
] as const);
/**
 * Supported color variants values.
 */
export const COLOR_VARIANTS = exhaustiveValues<Color>()([
  'ansiBlack',
  'ansiRed',
  'ansiGreen',
  'ansiYellow',
  'ansiBlue',
  'ansiMagenta',
  'ansiCyan',
  'ansiWhite',
  'ansiBrightBlack',
  'ansiBrightRed',
  'ansiBrightGreen',
  'ansiBrightYellow',
  'ansiBrightBlue',
  'ansiBrightMagenta',
  'ansiBrightCyan',
  'ansiBrightWhite',
] as const);

/**
 * Supported public variants values.
 */
export const PUBLIC_VARIANTS = {
  renderer: RENDERER_VARIANTS,
  graphMode: GRAPH_MODE_VARIANTS,
  interpolation: INTERPOLATION_VARIANTS,
  overflow: OVERFLOW_VARIANTS,
  barLayout: BAR_LAYOUT_VARIANTS,
  xScale: X_SCALE_VARIANTS,
  labelCollision: LABEL_COLLISION_VARIANTS,
  legendPosition: LEGEND_POSITION_VARIANTS,
  annotationType: ANNOTATION_TYPE_VARIANTS,
  coloringType: COLORING_TYPE_VARIANTS,
  gradientAxis: GRADIENT_AXIS_VARIANTS,
  seriesYAxis: SERIES_Y_AXIS_VARIANTS,
  textAlign: TEXT_ALIGN_VARIANTS,
  color: COLOR_VARIANTS,
} as const;

/**
 * Maps public variant families to values exercised by examples.
 */
export const variantExampleCoverage = {
  renderer: {
    ascii: 'single point with inferred domains [ascii]',
    braille: 'single point with inferred domains [braille]',
  },
  graphMode: {
    line: 'mode line',
    point: 'mode point',
    bar: 'mode bar',
    horizontalBar: 'mode horizontalBar',
  },
  interpolation: {
    step: 'discard overflow with step interpolation',
    linear: 'clip overflow with linear interpolation',
  },
  overflow: {
    clip: 'clip overflow with linear interpolation',
    discard: 'discard overflow with step interpolation',
  },
  barLayout: {
    overlap: 'bar options: overlapping multi-series bars',
    grouped: 'bar options: grouped positive values',
    stacked: 'bar options: stacked three positive series',
    normalized: 'normalized bars with value formatter',
  },
  xScale: {
    linear: 'complete numeric specification',
    band: 'band categories and wrapped labels',
    time: 'date time scale',
  },
  labelCollision: {
    hide: 'complete numeric specification',
    truncate: 'date time scale',
    wrap: 'band categories and wrapped labels',
    error: 'label collision error policy',
  },
  legendPosition: {
    left: 'legend position left',
    right: 'legend position right',
    top: 'legend position top',
    bottom: 'legend position bottom',
    auto: 'legend position auto',
  },
  annotationType: {
    span: 'complete numeric specification',
    text: 'complete numeric specification',
    arrow: 'complete numeric specification',
    errorBar: 'complete numeric specification',
  },
  coloringType: {
    conditional: 'dynamic colors overlays symbols and labels',
    gradient: 'per-series gradient coloring',
  },
  gradientAxis: {
    x: 'per-series gradient coloring',
    y: 'per-series gradient coloring',
  },
  seriesYAxis: {
    primary: 'complete numeric specification',
    secondary: 'complete numeric specification',
  },
  textAlign: {
    left: 'annotation alignment variants',
    center: 'annotation alignment variants',
    right: 'annotation alignment variants',
  },
  color: {
    ansiBlack: 'color: ansiBlack',
    ansiRed: 'color: ansiRed',
    ansiGreen: 'color: ansiGreen',
    ansiYellow: 'color: ansiYellow',
    ansiBlue: 'color: ansiBlue',
    ansiMagenta: 'color: ansiMagenta',
    ansiCyan: 'color: ansiCyan',
    ansiWhite: 'color: ansiWhite',
    ansiBrightBlack: 'color: ansiBrightBlack',
    ansiBrightRed: 'color: ansiBrightRed',
    ansiBrightGreen: 'color: ansiBrightGreen',
    ansiBrightYellow: 'color: ansiBrightYellow',
    ansiBrightBlue: 'color: ansiBrightBlue',
    ansiBrightMagenta: 'color: ansiBrightMagenta',
    ansiBrightCyan: 'color: ansiBrightCyan',
    ansiBrightWhite: 'color: ansiBrightWhite',
  },
} as const satisfies VariantExampleCoverage;
