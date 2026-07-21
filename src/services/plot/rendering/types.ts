import type { CHART } from '@constants';
import type {
  Color,
  Coloring,
  CustomSymbol,
  Graph,
  GraphMode,
  GraphPoint,
  Interpolation,
  LineFormatterArgs,
  MultiLine,
  Settings,
  Threshold,
} from '@types';

/** Validated coloring strategy and its public validation path. */
export type ResolvedColoring = {
  value: Coloring;
  resultPath: string;
};

/** Per-series rendering settings produced by structured chart normalization. */
export type SeriesRenderSettings = {
  seriesIndex?: number;
  color?: Color;
  coloring?: ResolvedColoring;
  mode?: GraphMode;
  interpolation?: Interpolation;
  fillArea?: boolean;
  lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
  yRange?: readonly [number, number];
};

/** Complete internal input for rendering every normalized data series. */
export type RenderDataSeriesOptions = {
  input: MultiLine;
  graph: Graph;
  plotWidth: number;
  plotHeight: number;
  emptySymbol: string;
  expansionX: number[];
  expansionY: number[];
  minX: number;
  minY: number;
  axis: { x: number; y: number };
  fillAxisPosition: { x: number; y: number };
  axisCenter: Settings['axisCenter'];
  color: Settings['color'];
  coloring: Settings['coloring'];
  mode: GraphMode;
  interpolation: Settings['interpolation'];
  fillArea: Settings['fillArea'];
  lineFormatter: Settings['lineFormatter'];
  symbols: Settings['symbols'];
  debugMode: Settings['debugMode'];
  seriesSettings?: readonly SeriesRenderSettings[];
  seriesIndexes?: readonly number[];
  colorInput?: MultiLine;
  cellPriorities?: number[][];
};

/** Settings subset used to resolve one series state. */
export type SeriesStateOptions = Pick<
  RenderDataSeriesOptions,
  | 'color'
  | 'coloring'
  | 'mode'
  | 'interpolation'
  | 'fillArea'
  | 'lineFormatter'
  | 'seriesSettings'
  | 'seriesIndexes'
>;

/** Fully resolved drawing state for one series. */
export type SeriesState = {
  colorSeries: number;
  setting: SeriesRenderSettings | undefined;
  originalSeries: number;
  color: Settings['color'] | Color | undefined;
  coloring: ResolvedColoring | undefined;
  mode: GraphMode;
  interpolation: Interpolation;
  fillArea: boolean | undefined;
  lineFormatter: Settings['lineFormatter'];
  yRange: readonly [number, number] | undefined;
  usesLayer: boolean;
};

/** Mutable drawing context for one normalized series. */
export type SeriesDrawingContext = {
  options: RenderDataSeriesOptions;
  state: SeriesState;
  seriesGraph: Graph;
  sortedCoords: [number, number][];
  seriesYRange: number[];
  chartSymbols: typeof CHART;
  pointSymbol: string;
  toPlotCoordinates: (x: number, y: number) => [number, number];
};

/** Inputs consumed while adding labels, legend, border, and background. */
export type DecorationOptions = {
  graph: string[][];
  input: MultiLine;
  plotWidth: number;
  yShift: number;
  backgroundSymbol: string;
  pointSymbol: string;
  color?: Settings['color'];
  coloring?: Settings['coloring'];
  symbols?: Settings['symbols'];
  fillArea?: Settings['fillArea'];
  debugMode?: Settings['debugMode'];
  xLabel?: Settings['xLabel'];
  yLabel?: Settings['yLabel'];
  title?: Settings['title'];
  xLabelColor: Color | undefined;
  yLabelColor: Color | undefined;
  titleColor?: Settings['titleColor'];
  legend?: Settings['legend'];
  borderSymbol: string | undefined;
  borderColor?: Settings['borderColor'];
  backgroundColor?: Settings['backgroundColor'];
  points?: GraphPoint[];
  thresholds?: Threshold[];
  legendInput?: MultiLine;
  legendPoints?: GraphPoint[];
  legendThresholds?: Threshold[];
  legendColors?: Array<Color | undefined>;
  legendSeriesFillAreas?: boolean[];
};
