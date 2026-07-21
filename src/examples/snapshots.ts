import { plot } from '@services/plot/plot';

import { additionalCandlestickExamples, candlestickExamples } from './candlestick';
import { examples } from './collection';
import { customSymbolExamples } from './custom-symbols';
import { dateEdgeCaseExamples } from './date-edge-cases';
import { numericEdgeCaseExamples } from './edge-cases';
import { elementColoringExamples } from './element-coloring';
import { helperExamples } from './helpers';
import { mixedChartExamples } from './mixed';
import { multicolorSparklineExamples } from './multicolor-sparklines';
import { nativeXExamples } from './native-x';
import { fillAreaExamples, plotOptionExamples } from './plot-options';
import { settingsMatrixExamples } from './settings-matrix';
import { structuredExamples } from './structured';
import { withExampleTerminal } from './terminal';
import { thresholdColoringExamples } from './threshold-coloring';
import { thresholdHeatmapExamples } from './threshold-heatmaps';
import { thresholdSparklineExamples } from './threshold-sparklines';

import type { SnapshotExample, VisualHelperExample } from './types';

const graphExamples: SnapshotExample[] = examples.map(([data, settings]) => ({
  group: 'plot',
  title: settings.snapshotTitle ?? settings.title,
  renderer: settings.renderer,
  only: settings.only,
  render: () => withExampleTerminal(() => plot(data, settings)),
}));

const isVisualHelperExample = (
  example: (typeof helperExamples)[number],
): example is VisualHelperExample => example.helper !== 'histogram';

const toHelperSnapshot = ({ helper, title, output }: VisualHelperExample) => ({
  group: helper,
  title,
  render: () => output,
});

const standardHelperExamples: SnapshotExample[] = helperExamples
  .filter(isVisualHelperExample)
  .filter(({ size }) => size !== 'large')
  .map(toHelperSnapshot);

const largeHelperExamples: SnapshotExample[] = helperExamples
  .filter(isVisualHelperExample)
  .filter(({ size }) => size === 'large')
  .map(toHelperSnapshot);

/**
 * Examples covering snapshot behavior.
 */
export const snapshotExamples: readonly SnapshotExample[] = [
  ...graphExamples,
  ...plotOptionExamples,
  ...settingsMatrixExamples,
  ...structuredExamples,
  ...nativeXExamples,
  ...candlestickExamples,
  ...standardHelperExamples,
  // Keep new example groups at the end so index-based snapshot filenames stay stable.
  ...fillAreaExamples,
  ...largeHelperExamples,
  ...mixedChartExamples,
  ...thresholdColoringExamples,
  ...multicolorSparklineExamples,
  ...additionalCandlestickExamples,
  ...thresholdSparklineExamples,
  ...elementColoringExamples,
  ...numericEdgeCaseExamples,
  ...dateEdgeCaseExamples,
  ...thresholdHeatmapExamples,
  ...customSymbolExamples,
];
