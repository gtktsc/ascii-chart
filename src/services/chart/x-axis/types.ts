import { ChartSpec } from '@types';

/**
 * Represents normalized chart spec.
 */
export type NormalizedChartSpec = {
  spec: ChartSpec<number>;
  hasConfiguredTicks: boolean;
  usesNativeTicks: boolean;
};
