import type { DeepReadonly } from '@types';

import { DEFAULT_ANNOTATION_SYMBOLS } from './annotations';
import { DEFAULT_CANDLESTICK_SYMBOLS } from './candlestick';
import { DEFAULT_HEATMAP_SYMBOLS } from './heatmap';
import { AXIS, CHART, EMPTY, POINT, THRESHOLDS } from './plot';
import { DEFAULT_SPARKLINE_SYMBOLS } from './sparkline';
import { DEFAULT_TEXT_SYMBOLS } from './text';

export { AXIS, CHART, EMPTY, POINT, THRESHOLDS } from './plot';

const defaultSymbols = {
  plot: {
    axis: AXIS,
    chart: CHART,
    empty: EMPTY,
    thresholds: THRESHOLDS,
    point: POINT,
  },
  heatmap: DEFAULT_HEATMAP_SYMBOLS,
  sparkline: DEFAULT_SPARKLINE_SYMBOLS,
  candlestick: DEFAULT_CANDLESTICK_SYMBOLS,
  annotations: DEFAULT_ANNOTATION_SYMBOLS,
  text: DEFAULT_TEXT_SYMBOLS,
} as const;

/** Public read-only catalog of renderer defaults. Per-call overrides are merged from these values. */
export const DEFAULT_SYMBOLS: DeepReadonly<typeof defaultSymbols> = defaultSymbols;
