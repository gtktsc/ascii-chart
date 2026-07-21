import type { THRESHOLDS } from '@constants';
import type {
  Color,
  Colors,
  Graph,
  GraphPoint,
  Legend,
  MultiLine,
  Symbols,
  Threshold,
} from '@types';

/** Shared graph and priority state used while drawing thresholds. */
export type ThresholdDrawingContext = {
  graph: Graph;
  thresholdSymbols: typeof THRESHOLDS;
  debugMode?: boolean;
  cellPriorities?: number[][];
  priority?: number;
};

/** One normalized legend item or visual spacer. */
export type LegendEntry =
  | { type: 'series' | 'threshold' | 'point'; label: string; index: number }
  | { type: 'spacer' };

/** Inputs required to append a plot legend. */
export type AddLegendOptions = {
  graph: Graph;
  legend: Legend;
  backgroundSymbol: string;
  input: MultiLine;
  color?: Colors | Array<Color | undefined>;
  pointSymbol: string;
  symbols?: Symbols;
  fillArea?: boolean;
  debugMode?: boolean;
  points?: GraphPoint[];
  thresholds?: Threshold[];
  seriesFillAreas?: boolean[];
  labelColor?: Color;
};

/** Resolved entries and layout state used while drawing a legend. */
export type LegendContext = AddLegendOptions & {
  entries: LegendEntry[];
  width: number;
  thresholdSymbol: string;
};
