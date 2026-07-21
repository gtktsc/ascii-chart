import type { AXIS } from '@constants';
import type { Color, Formatter, Graph, GraphMode, MaybePoint, Point, Symbols, YAxis } from '@types';
import type { XTickLabelLayout } from '@services/plot/layout/types';

/** State required to draw one y-axis endpoint and label. */
export type DrawYAxisEndOptions = {
  graph: Graph;
  scaledY: number;
  yShift: number;
  plotHeight: number;
  axis: { x: number; y: number };
  pointY: number;
  transformLabel: Formatter;
  axisSymbols: Symbols['axis'];
  expansionX: number[];
  expansionY: number[];
  hideYAxisTicks?: boolean;
  showTickLabel?: boolean;
  debugMode?: boolean;
  color?: Color;
};

/** Inputs required to draw one series line or point sequence. */
export type DrawLineOptions = {
  index: number;
  arr: Point[];
  graph: Graph;
  scaledX: number;
  scaledY: number;
  plotHeight: number;
  emptySymbol: string;
  chartSymbols: Symbols['chart'];
  axisCenter: MaybePoint;
  axis: { x: number; y: number };
  debugMode?: boolean;
  mode: GraphMode;
  pointSymbol?: string;
};

/** Inputs required to draw x-axis ticks and their labels. */
export type DrawXAxisTicksOptions = {
  debugMode?: boolean;
  hideXAxisTicks?: boolean;
  plotWidth: number;
  plotHeight: number;
  emptySymbol: string;
  yShift: number;
  graph: Graph;
  axisCenter?: MaybePoint;
  axis: { x: number; y: number };
  transformLabel: Formatter;
  axisSymbols: typeof AXIS;
  expansionX: number[];
  expansionY: number[];
  xTickLabelLayout?: readonly XTickLabelLayout[];
  labelBackgroundSymbol?: string;
  color?: Color;
};

/** Mutable collision state used while drawing adaptive x-axis labels. */
export type XTickContext = DrawXAxisTicksOptions & {
  occupiedByRow: Map<number, Set<number>>;
  adaptiveLabels: Map<number, XTickLabelLayout>;
  adaptiveLabelStarts: Map<number, number[]> | undefined;
  adaptiveLabelRow: number;
  adaptiveLabelColumn: number;
};

/** Inputs required to measure and draw the secondary y-axis. */
export type SecondaryYAxisOptions = {
  graph: Graph;
  plotWidth: number;
  plotHeight: number;
  realXShift: number;
  xAxisRow?: number;
  backgroundSymbol: string;
  axisSymbols: typeof AXIS;
  axis: YAxis;
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  ticks: readonly number[];
  debugMode?: boolean;
};

/** Domain and tick subset used to measure secondary y-axis labels. */
export type SecondaryYAxisLayout = Pick<
  SecondaryYAxisOptions,
  'axis' | 'xDomain' | 'yDomain' | 'ticks'
>;
