/**
 * Represents example group.
 */
export type ExampleGroup = 'candlestick' | 'heatmap' | 'plot' | 'renderChart' | 'sparkline';

/**
 * Represents snapshot example.
 */
export type SnapshotExample = Readonly<{
  group: ExampleGroup;
  title: string;
  renderer?: import('@types').Renderer;
  only?: boolean;
  render: () => string;
}>;

/** Plot example settings plus snapshot catalog metadata. */
export type ExampleSettings = Settings & {
  only?: boolean;
  title: string;
  snapshotTitle?: string;
};

/** Legacy plot input, settings, and equivalent structured chart spec. */
export type Example = [Coordinates, ExampleSettings, ChartSpec];

/** Executable usage example for one public renderer helper. */
export type HelperExample = Readonly<{
  helper: 'heatmap' | 'histogram' | 'sparkline';
  title: string;
  code: string;
  output: string;
  size?: 'large';
}>;

/** Helper example that renders directly into a visual snapshot. */
export type VisualHelperExample = HelperExample & {
  helper: 'heatmap' | 'sparkline';
};

/** Input row for one series in a mixed chart example. */
export type MixedSeriesInput = Readonly<{
  id: string;
  name: string;
  mode: 'bar' | 'line';
  values: readonly (number | null)[];
  xValues?: readonly number[];
  color?: Color;
  coloring?: Coloring;
  interpolation?: Interpolation;
  fillArea?: boolean;
  yAxis?: 'primary' | 'secondary';
}>;

/** Source metadata used to define one mixed chart example. */
export type MixedChartInput = Readonly<{
  title: string;
  series: readonly MixedSeriesInput[];
  chart?: Omit<ChartSpec<number>, 'renderer' | 'series' | 'title'>;
}>;

/** Render-ready mixed chart definition. */
export type MixedChartDefinition = Readonly<{
  title: string;
  spec: ChartSpec<number>;
}>;

/** Structured chart scenario rendered through every supported backend. */
export type EdgeCaseScenario<X extends ChartX> = Readonly<{
  title: string;
  spec: ChartSpec<X>;
}>;

/** Per-cell colors and values used by a multicolor sparkline example. */
export type MulticolorSparklineScenario = Readonly<{
  title: string;
  values: readonly (number | null)[];
  colors: readonly (Color | undefined)[];
}>;

/** Threshold and palette used by one sparkline example. */
export type ThresholdSparklineScenario = Readonly<{
  title: string;
  size: 'small' | 'wide';
  values: readonly (number | null)[];
  threshold: number;
  belowColor: Color;
  aboveColor: Color;
}>;

/** Matrix and threshold used by one heatmap example. */
export type ThresholdHeatmapScenario = Readonly<{
  title: string;
  columns: readonly string[];
  rows: readonly string[];
  data: readonly (readonly (number | null)[])[];
  threshold: HeatmapThreshold;
}>;

/** Plot data, threshold, axes, and palette used by one coloring example. */
export type ThresholdColoringScenario = Readonly<{
  title: string;
  seriesLabel: string;
  thresholdLabel: string;
  yLabel: string;
  data: PlotCoordinates;
  threshold: number;
  yDomain: readonly [number, number];
  yTicks: readonly number[];
  baseColor: Color;
  alertColor: Color;
  thresholdColor: Color;
}>;

/** Exhaustive example coverage mapped from every public variant family. */
export type VariantExampleCoverage = {
  [Surface in keyof typeof import('./variants').PUBLIC_VARIANTS]: Record<
    (typeof import('./variants').PUBLIC_VARIANTS)[Surface][number],
    string
  >;
};

/** Required example metadata for every field of a public option surface. */
export type ExampleCoverage<Surface> = { [Key in keyof Surface]-?: string };

/** Object form of chart value-label configuration. */
export type ChartValueLabelsConfig = Exclude<ChartValueLabels, boolean>;

/** Conditional branch of public coloring configuration. */
export type ConditionalColoring = Extract<Coloring, { type: 'conditional' }>;

/** Gradient branch of public coloring configuration. */
export type GradientColoring = Extract<Coloring, { type: 'gradient' }>;

import type {
  ChartSpec,
  ChartValueLabels,
  ChartX,
  Color,
  Coloring,
  Coordinates,
  HeatmapThreshold,
  Interpolation,
  PlotCoordinates,
  Settings,
} from '@types';
