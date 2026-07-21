import type { Coordinates, GraphPoint, MultiLine, Settings, Threshold } from '@types';
import type { BarSegment } from '@services/plot/bars/types';

/** One nullable numeric series accepted by legacy plot routing. */
export type PlotSeriesInput = readonly (readonly [number, number | null])[];

/** Normalized multi-series input accepted by plot routing. */
export type PlotInput = readonly PlotSeriesInput[];

/** Internal settings produced by advanced bar preparation. */
export type AdvancedBarSettings = Settings & {
  xRange: readonly [number, number];
  dataInput: MultiLine;
  legendInput: MultiLine;
  barSegments: BarSegment[];
  points?: GraphPoint[];
  thresholds?: Threshold[];
};

/** Internal settings added while routing ordinary plot series. */
export type RoutedSettings = Settings & {
  xRange?: readonly [number, number];
  seriesIndexes?: readonly number[];
  legendInput?: MultiLine;
};

/** Normalized input and settings returned by plot routing. */
export type RoutedPlot = {
  input: Coordinates;
  settings: RoutedSettings;
};
