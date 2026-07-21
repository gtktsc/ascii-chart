import { Color } from './common';

import type { SparklineSymbols } from './symbols';

/** One color for all glyphs or colors mapped by input position. */
export type SparklineColor = Color | readonly (Color | undefined)[];

/** Colors selected by comparing each finite value with one numeric threshold. */
export type SparklineThreshold = Readonly<{
  /** Finite comparison value. */
  value: number;
  /** ANSI color used for values below the threshold. */
  belowColor: Color;
  /** Color used when a value equals or exceeds the threshold. */
  aboveColor: Color;
}>;

/** Visual options for compact sparkline output. */
export type SparklineOptions = Readonly<{
  /** Per-call level and empty-cell glyph overrides. */
  symbols?: SparklineSymbols;
}> &
  (
    | {
        /** ANSI color applied globally or mapped one-to-one with input values. */
        color?: SparklineColor;
        threshold?: never;
      }
    | {
        color?: never;
        /** ANSI colors selected from each finite value's threshold relation. */
        threshold: SparklineThreshold;
      }
  );
