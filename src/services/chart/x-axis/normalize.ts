import { ChartSpec, ChartX } from '@types';

import { normalizeBandSpec } from './band';
import { resolveScale } from './mapping';
import { normalizeTimeSpec } from './time';
import { NormalizedChartSpec } from './types';

/**
 * Normalizes chart x.
 * @param {ChartSpec<X>} spec - The spec.
 * @returns {NormalizedChartSpec} - Computed result.
 */
export const normalizeChartX = <X extends ChartX>(spec: ChartSpec<X>): NormalizedChartSpec => {
  const scale = resolveScale(spec);
  if (scale === 'band') return normalizeBandSpec(spec as unknown as ChartSpec<string>);
  if (scale === 'time') return normalizeTimeSpec(spec as unknown as ChartSpec<Date>);
  return {
    spec: spec as unknown as ChartSpec<number>,
    hasConfiguredTicks: spec.xAxis?.ticks !== undefined,
    usesNativeTicks: false,
  };
};
