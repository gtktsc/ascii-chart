/** Filesystem folder names for each generated snapshot domain. */
export const SNAPSHOT_GROUP_FOLDERS = {
  candlestick: 'candlestick',
  heatmap: 'heatmap',
  plot: 'plot',
  renderChart: 'render-chart',
  sparkline: 'sparkline',
} as const;

/** Root folder name containing generated text snapshots. */
export const SNAPSHOT_DIRECTORY_NAME = '__snapshots__';
