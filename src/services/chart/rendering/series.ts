import { ChartSpec, MultiLine } from '@types';
import { isBarSeries } from '@services/chart/bars/structured';
import { segmentSeries } from '@services/chart/domain/clipping';
import type { SeriesRenderSettings } from '@services/plot/rendering/types';

/**
 * Returns series input.
 * @param {ChartSpec} spec - The spec.
 * @param {boolean} hasAdvancedBars - The has advanced bars.
 * @param {readonly [number, number]} xDomain - The x domain.
 * @param {readonly [number, number]} primaryYDomain - The primary ydomain.
 * @param {readonly [number, number] | undefined} secondaryYDomain - The secondary ydomain.
 * @returns {{ input: MultiLine; axisInput: MultiLine; seriesSettings: SeriesRenderSettings[]; }} - Computed result.
 */
export const getSeriesInput = (
  spec: ChartSpec,
  hasAdvancedBars: boolean,
  xDomain: readonly [number, number],
  primaryYDomain: readonly [number, number],
  secondaryYDomain: readonly [number, number] | undefined,
) => {
  const input: MultiLine = [];
  const axisInput: MultiLine = [];
  const seriesSettings: SeriesRenderSettings[] = [];
  spec.series.forEach((series, seriesIndex) => {
    if (hasAdvancedBars && isBarSeries(series)) return;
    const yDomain = series.yAxis === 'secondary' ? secondaryYDomain : primaryYDomain;
    if (!yDomain) return;
    const overflow = (series.mode ?? 'line') === 'line' ? spec.overflow : 'discard';
    segmentSeries(series.data, xDomain, yDomain, overflow).forEach((segment) => {
      input.push(segment);
      axisInput.push(
        series.yAxis === 'secondary'
          ? segment.map(([x]) => [x, primaryYDomain[0]] as [number, number])
          : segment,
      );
      seriesSettings.push({
        seriesIndex,
        color: series.color,
        coloring: series.coloring
          ? {
              value: series.coloring,
              resultPath: `series[${seriesIndex}].coloring.result`,
            }
          : undefined,
        mode: series.mode,
        interpolation: series.interpolation,
        fillArea: series.fillArea,
        lineFormatter: series.lineFormatter,
        yRange: series.yAxis === 'secondary' ? yDomain : undefined,
      });
    });
  });
  return { input, axisInput, seriesSettings };
};

/**
 * Returns custom xaxis ticks.
 * @param {number[]} ticks - The ticks.
 * @param {number | readonly number[] | undefined} configuredTicks - The configured ticks.
 * @param {boolean} usesNativeTicks - The uses native ticks.
 * @returns {number[] | undefined} - Computed result.
 */
export const getCustomXAxisTicks = (
  ticks: number[],
  configuredTicks: number | readonly number[] | undefined,
  usesNativeTicks: boolean,
) => (configuredTicks === undefined && !usesNativeTicks ? undefined : ticks);
