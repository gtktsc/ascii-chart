import type { MultiLine, Settings } from '@types';
import type { SeriesRenderSettings } from '@services/plot/rendering/types';

/** Measured terminal placement for one x-axis tick label. */
export type XTickLabelLayout = {
  value: number;
  position: number;
  slotWidth: number;
  lines: string[];
};

/** Plot settings and derived inputs required by layout resolution. */
export type PlotLayoutSettings = Pick<
  Settings,
  | 'width'
  | 'height'
  | 'aspectRatio'
  | 'yRange'
  | 'axisCenter'
  | 'formatter'
  | 'symbols'
  | 'showTickLabel'
  | 'customXAxisTicks'
  | 'customYAxisTicks'
  | 'title'
  | 'xLabel'
  | 'yLabel'
  | 'legend'
  | 'xAxis'
> & {
  dataInput?: MultiLine;
  axisInput?: MultiLine;
  xRange?: readonly [number, number];
  seriesSettings?: readonly SeriesRenderSettings[];
  xTickPath: string;
  rightOverhead: number;
};
