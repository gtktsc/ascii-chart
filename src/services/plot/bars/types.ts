import type {
  BarLayout,
  ChartDatum,
  ChartValueLabels,
  Color,
  Colors,
  Graph,
  GraphMode,
  MaybePoint,
  MultiLine,
  Symbols,
  ValueLabelFormatter,
} from '@types';
import type { ResolvedColoring } from '@services/plot/rendering/types';

/**
 * Represents bar mode.
 */
export type BarMode = Extract<GraphMode, 'bar' | 'horizontalBar'>;

/**
 * Represents bar series input.
 */
export type BarSeriesInput = {
  seriesIndex: number;
  seriesId?: string;
  seriesName?: string;
  data: readonly ChartDatum<number>[];
  mode: BarMode;
  color?: Color;
  coloring?: ResolvedColoring;
  dataPath?: string;
};

/**
 * Represents bar segment.
 */
export type BarSegment = {
  seriesIndex: number;
  seriesId?: string;
  seriesName?: string;
  datumIndex: number;
  x: number;
  y: number;
  mode: BarMode;
  layout: BarLayout;
  value: number;
  category: number;
  start: number;
  end: number;
  slotIndex: number;
  slotCount: number;
  color?: Color;
  coloring?: ResolvedColoring;
};

/**
 * Represents bar label candidate.
 */
export type BarLabelCandidate = {
  x: number;
  y: number;
  cells: string[];
  alternatives?: { x: number; y: number }[];
};

/**
 * Represents bar label anchor.
 */
export type BarLabelAnchor = {
  mode: BarMode;
  layout: BarLayout;
  categoryPosition: number;
  startPosition: number;
  endPosition: number;
  direction: -1 | 1;
  cells: string[];
  groupBounds?: readonly [number, number];
  preferredGroupSide?: 'left' | 'right';
};

/** Positive and negative magnitude totals used by normalized bars. */
export type BarNormalizationTotals = {
  positive: Map<string, number>;
  negative: Map<string, number>;
};

/** Mutable accumulator used while preparing bar segments and their domains. */
export type BarSegmentState = {
  layout: BarLayout;
  axisCenter: MaybePoint;
  verticalCount: number;
  horizontalCount: number;
  verticalSlots: Map<number, number>;
  horizontalSlots: Map<number, number>;
  positive: Map<string, number>;
  negative: Map<string, number>;
  totals: BarNormalizationTotals | undefined;
  segments: BarSegment[];
  xValues: number[];
  yValues: number[];
};

/** Complete inputs required to draw prepared bar segments. */
export type DrawPreparedBarsOptions = {
  graph: Graph;
  segments: readonly BarSegment[];
  plotWidth: number;
  plotHeight: number;
  xRange: readonly [number, number];
  yRange: readonly [number, number];
  axis: { x: number; y: number };
  axisCenter: MaybePoint;
  symbols?: Symbols;
  color?: Colors;
  colorInput: MultiLine;
  valueLabels?: ChartValueLabels;
  formatterPath: string;
  layoutPath: string;
  groupedSlotStride?: { x: number; y: number };
  debugMode?: boolean;
  cellPriorities?: number[][];
};

/** Resolved scales, slots, and label formatter used while drawing bars. */
export type BarDrawingContext = Omit<DrawPreparedBarsOptions, 'segments' | 'groupedSlotStride'> & {
  toX: (value: number) => number;
  toY: (value: number) => number;
  groupedSlotStride: { x: number; y: number };
  verticalStarts: Map<string, number>;
  horizontalStarts: Map<string, number>;
  labelFormatter: ValueLabelFormatter<number>;
};
