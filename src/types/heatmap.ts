import type { Color } from './common';
import type { HeatmapSymbols } from './symbols';

/** One discrete value rendered in a heatmap cell. Null reserves an empty cell. */
export type HeatmapValue = string | number | null;

/** Visual mapping for one non-null heatmap value. */
export type HeatmapLevel = Readonly<{
  /** Exact non-null cell value matched by this level. */
  value: Exclude<HeatmapValue, null>;
  /** One-column glyph. Defaults to the heatmap cell symbol. */
  symbol?: string;
  /** ANSI color applied to matching cells and their legend marker. */
  color?: Color;
  /** Legend text. Defaults to the string form of `value`. */
  label?: string;
}>;

/** Binary visual mapping selected by comparing numeric cells with one threshold. */
export type HeatmapThreshold = Readonly<{
  /** Finite comparison value. */
  value: number;
  /** ANSI color used for cells below the threshold. */
  belowColor: Color;
  /** Color used when a cell value equals or exceeds the threshold. */
  aboveColor: Color;
  /** One-column glyph used below the threshold. */
  belowSymbol?: string;
  /** One-column glyph used at or above the threshold. */
  aboveSymbol?: string;
  /** Legend text for values below the threshold. */
  belowLabel?: string;
  /** Legend text for values at or above the threshold. */
  aboveLabel?: string;
}>;

type HeatmapBaseSpec = Readonly<{
  /** Optional row labels; length must match the data row count. */
  rows?: readonly string[];
  /** Optional column labels; length must match the widest data row. */
  columns?: readonly string[];
  /** Title rendered above the matrix. */
  title?: string;
  /** Renders a level or threshold legend below the matrix. */
  legend?: boolean;
  /** Per-call glyph overrides. */
  symbols?: HeatmapSymbols;
}>;

/** Complete discrete heatmap or status-matrix specification. */
export type HeatmapSpec = HeatmapBaseSpec &
  (
    | Readonly<{
        /** Matrix of categorical values; `null` reserves an empty cell. */
        data: readonly (readonly HeatmapValue[])[];
        /** Exact visual mapping for categorical or already-binned values. */
        levels: readonly HeatmapLevel[];
        threshold?: never;
      }>
    | Readonly<{
        /** Matrix of finite numeric values; `null` reserves an empty cell. */
        data: readonly (readonly (number | null)[])[];
        levels?: never;
        /** Binary visual mapping for raw numeric values. */
        threshold: HeatmapThreshold;
      }>
  );

/** Renders a discrete heatmap or status matrix. */
export type Heatmap = (spec: HeatmapSpec) => string;
