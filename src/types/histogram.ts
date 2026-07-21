/** Histogram bin represented by its midpoint and count. */
export type HistogramDatum = readonly [x: number, count: number];

/** Numeric histogram data accepted by `plot`. */
export type HistogramData = readonly HistogramDatum[];

/** Options for deriving histogram bins from raw samples. */
export type HistogramOptions = {
  /** Positive integer bin count. Defaults to Sturges' formula. */
  binCount?: number;
};
