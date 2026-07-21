import type {
  CandlestickMarkStyle,
  Graph,
  HeatmapLevel,
  HeatmapSpec,
  HeatmapSymbols,
  HeatmapValue,
  HistogramData,
  HistogramOptions,
  SparklineOptions,
} from '@types';

/** Callable heatmap renderer contract. */
export type HeatmapRenderer = (spec: HeatmapSpec) => string;

/** Callable sparkline renderer contract. */
export type SparklineRenderer = (
  values: readonly (number | null)[],
  options?: SparklineOptions,
) => string;

/** Overloaded callable histogram normalizer and binning contract. */
export type HistogramRenderer = {
  (input: readonly number[], options?: HistogramOptions): HistogramData;
  (input: HistogramData): HistogramData;
};

/** One resolved heatmap symbol, color, and legend label. */
export type ResolvedHeatmapStyle = Pick<HeatmapLevel, 'color'> & {
  symbol: string;
  label: string;
};

/** Heatmap level with its fallback symbol resolved. */
export type ResolvedHeatmapLevel = Omit<HeatmapLevel, 'symbol'> & { symbol: string };

/** Validated threshold and its resolved below/above styles. */
export type ResolvedHeatmapThreshold = Readonly<{
  value: number;
  below: ResolvedHeatmapStyle;
  above: ResolvedHeatmapStyle;
}>;

/** Fully validated heatmap input used by rendering. */
export type ValidatedHeatmapSpec = Readonly<{
  data: readonly (readonly HeatmapValue[])[];
  levels: readonly ResolvedHeatmapLevel[];
  threshold?: ResolvedHeatmapThreshold;
  rows?: readonly string[];
  columns?: readonly string[];
  title?: string;
  legend?: boolean;
  symbols: Required<HeatmapSymbols>;
}>;

/** Candlestick mark after default symbol resolution. */
export type ResolvedCandlestickMarkStyle = Required<Pick<CandlestickMarkStyle, 'symbol'>> &
  Pick<CandlestickMarkStyle, 'color'>;

/** Fully resolved candlestick symbols and optional mark colors. */
export type ResolvedCandlestickStyle = {
  wick: string;
  rising: ResolvedCandlestickMarkStyle;
  falling: ResolvedCandlestickMarkStyle;
  unchanged: ResolvedCandlestickMarkStyle;
};

/** Renderer-specific raster operations used by shared plot pipeline. */
export type RendererBackend = {
  subcellWidth: number;
  subcellHeight: number;
  foldGraph: (
    source: Graph,
    options: {
      plotWidth: number;
      plotHeight: number;
      emptySymbol: string;
      cellPriorities?: number[][];
    },
  ) => Graph;
};

/** Resolved sparkline glyph index, with null representing an empty cell. */
export type SparklineLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
