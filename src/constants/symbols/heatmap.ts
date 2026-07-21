/**
 * Default heatmap symbols used when callers provide no override.
 */
export const DEFAULT_HEATMAP_SYMBOLS = {
  cell: '█',
  belowThreshold: '░',
  aboveThreshold: '█',
  empty: ' ',
  gap: '  ',
} as const;
