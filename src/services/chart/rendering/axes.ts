import { ChartSpec } from '@types';
import { DEFAULT_CHART_HEIGHT, DEFAULT_CHART_WIDTH } from '@constants/layout';
import {
  assertStructuredBarAxisCenter,
  prepareStructuredBars,
} from '@services/chart/bars/structured';
import { assertXAxisLabelsFit } from '@services/chart/domain/labels';
import { resolveDomain, resolveTicks } from '@services/chart/domain/ranges';

/**
 * Resolves chart axes.
 * @param {ChartSpec} spec - The spec.
 * @param {ReturnType<typeof prepareStructuredBars>} bars - The bars.
 * @param {boolean} hasConfiguredXTicks - The has configured xticks.
 * @returns {{ xDomain: [number, number]; yDomain: [number, number]; secondaryYDomain: [number, number] | undefined; width: ChartWidth; height: number | undefined; xTicks: number[]; yTicks: number[]; secondaryYTicks: number[] | undefined; } | undefined} - Computed result.
 */
export const resolveChartAxes = (
  spec: ChartSpec,
  bars: ReturnType<typeof prepareStructuredBars>,
  hasConfiguredXTicks: boolean,
) => {
  const xValues = [
    ...bars.regularSeries.flatMap((series) => series.data.map(([x]) => x)),
    ...bars.prepared.xValues,
  ];
  const primaryYValues = [
    ...bars.regularSeries
      .filter((series) => series.yAxis !== 'secondary')
      .flatMap((series) => series.data.flatMap(([, y]) => (y === null ? [] : [y]))),
    ...bars.prepared.yValues,
  ];
  const secondaryYValues = bars.regularSeries
    .filter((series) => series.yAxis === 'secondary')
    .flatMap((series) => series.data.flatMap(([, y]) => (y === null ? [] : [y])));
  const xDomain = resolveDomain(spec.xAxis, xValues);
  const yDomain = resolveDomain(spec.yAxis, primaryYValues);
  if (!xDomain || !yDomain) return undefined;

  const secondaryYDomain =
    spec.secondaryYAxis !== undefined || secondaryYValues.length > 0
      ? resolveDomain(spec.secondaryYAxis, secondaryYValues)
      : undefined;
  const width = spec.width ?? DEFAULT_CHART_WIDTH;
  const xTicks = resolveTicks(spec.xAxis, xDomain, xValues, 'xAxis');
  const yTicks = resolveTicks(spec.yAxis, yDomain, primaryYValues, 'yAxis');
  const secondaryYTicks = secondaryYDomain
    ? resolveTicks(spec.secondaryYAxis, secondaryYDomain, secondaryYValues, 'secondaryYAxis')
    : undefined;
  if (hasConfiguredXTicks && width !== 'auto' && spec.xAxis?.labelCollision === undefined) {
    assertXAxisLabelsFit({ axis: spec.xAxis, ticks: xTicks, xDomain, yDomain, width });
  }
  assertStructuredBarAxisCenter(spec, bars.axisCenter, xDomain, yDomain);

  return {
    xDomain,
    yDomain,
    secondaryYDomain,
    width,
    height:
      spec.height ??
      (spec.aspectRatio === undefined && spec.width !== 'auto' ? DEFAULT_CHART_HEIGHT : undefined),
    xTicks,
    yTicks,
    secondaryYTicks,
  };
};

/**
 * Returns secondary yaxis settings.
 * @param {ChartSpec['secondaryYAxis']} axis - The axis.
 * @param {readonly [number, number] | undefined} domain - The domain.
 * @param {readonly number[] | undefined} ticks - The ticks.
 * @returns {{ axis: YAxis; domain: readonly [number, number]; ticks: readonly number[]; } | undefined} - Computed result.
 */
export const getSecondaryYAxisSettings = (
  axis: ChartSpec['secondaryYAxis'],
  domain: readonly [number, number] | undefined,
  ticks: readonly number[] | undefined,
) => {
  if (!domain || !ticks) return undefined;
  return { axis: axis ?? {}, domain, ticks };
};
