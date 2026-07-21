import type {
  ChartAnnotation,
  Color,
  GraphPoint,
  MultiLine,
  Settings,
  Threshold,
  YAxis,
} from '@types';
import type { BarSegment } from '@services/plot/bars/types';
import type { SeriesRenderSettings } from '@services/plot/rendering/types';

import type { resolvePlotLayout } from './layout/resolve';

/** Secondary y-axis state resolved before plot rendering. */
export type SecondaryYAxisSettings = {
  axis: YAxis;
  domain: readonly [number, number];
  ticks: readonly number[];
};

/** Public plot settings plus normalized internal rendering fields. */
export type InternalPlotSettings = Settings & {
  annotations?: readonly ChartAnnotation<number>[];
  xRange?: readonly [number, number];
  seriesSettings?: readonly SeriesRenderSettings[];
  legendInput?: MultiLine;
  legendPoints?: GraphPoint[];
  legendThresholds?: Threshold[];
  legendSeriesFillAreas?: boolean[];
  legendColors?: Array<Color | undefined>;
  seriesIndexes?: readonly number[];
  barSegments?: readonly BarSegment[];
  dataInput?: MultiLine;
  axisInput?: MultiLine;
  barFormatterPath?: string;
  barLayoutPath?: string;
  xTickPath?: string;
  secondaryYAxis?: SecondaryYAxisSettings;
};

/** Prepared plot input, internal settings, and resolved layout. */
export type PlotState = {
  input: MultiLine;
  settings: InternalPlotSettings;
  layout: ReturnType<typeof resolvePlotLayout>;
};
