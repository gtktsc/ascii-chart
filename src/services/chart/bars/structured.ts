import { ChartSpec } from '@types';
import { rangeError } from '@services/errors';
import { prepareBarSegments } from '@services/plot/bars/preparation';
import { BarSeriesInput } from '@services/plot/bars/types';

/**
 * Checks whether input is bar series.
 * @param {ChartSpec['series'][number]} series - The series.
 * @returns {boolean} - Computed result.
 */
export const isBarSeries = (series: ChartSpec['series'][number]) =>
  series.mode === 'bar' || series.mode === 'horizontalBar';

const getBarSeries = (spec: ChartSpec): BarSeriesInput[] =>
  spec.series.flatMap((entry, seriesIndex) => {
    if (!isBarSeries(entry)) return [];
    return [
      {
        seriesIndex,
        seriesId: entry.id,
        seriesName: entry.name,
        data: entry.data,
        mode: entry.mode as 'bar' | 'horizontalBar',
        color: entry.color,
        coloring: entry.coloring
          ? { value: entry.coloring, resultPath: `series[${seriesIndex}].coloring.result` }
          : undefined,
        dataPath: `series[${seriesIndex}].data`,
      },
    ];
  });

const assertAdvancedBars = (
  spec: ChartSpec,
  series: BarSeriesInput[],
  layout: NonNullable<ChartSpec['barLayout']>,
): void => {
  if (series.length === 0) {
    rangeError(
      spec.valueLabels ? 'valueLabels' : 'barLayout',
      'requires at least one bar or horizontalBar series',
    );
  }
  spec.series.forEach((entry, index) => {
    if (!isBarSeries(entry)) return;
    if (layout !== 'overlap' && entry.fillArea) {
      rangeError(
        `series[${index}].fillArea`,
        'is not supported with grouped, stacked, or normalized bars',
      );
    }
    if (entry.lineFormatter) {
      rangeError(
        `series[${index}].lineFormatter`,
        'is not supported with grouped, stacked, or normalized bars or value labels',
      );
    }
  });
};

const resolveBarAxisCenter = (
  spec: ChartSpec,
  series: BarSeriesInput[],
  advanced: boolean,
): ChartSpec['axisCenter'] => {
  if (!advanced) return spec.axisCenter;
  const vertical = series.some(({ mode }) => mode === 'bar');
  const horizontal = series.some(({ mode }) => mode === 'horizontalBar');
  return [
    horizontal ? (spec.axisCenter?.[0] ?? 0) : spec.axisCenter?.[0],
    vertical ? (spec.axisCenter?.[1] ?? 0) : spec.axisCenter?.[1],
  ];
};

/**
 * Validates and prepares structured bar series for the shared renderer.
 * @param {ChartSpec} spec - Structured chart specification.
 * @returns {object} - Resolved layout, baseline, prepared bars, and regular series.
 */
export const prepareStructuredBars = (spec: ChartSpec) => {
  const layout = spec.barLayout ?? 'overlap';
  const advanced = layout !== 'overlap' || Boolean(spec.valueLabels);
  const series = getBarSeries(spec);
  if (advanced) assertAdvancedBars(spec, series, layout);
  const axisCenter = resolveBarAxisCenter(spec, series, advanced);
  const prepared = advanced
    ? prepareBarSegments(series, layout, axisCenter)
    : { segments: [], xValues: [] as number[], yValues: [] as number[] };
  const regularSeries = advanced ? spec.series.filter((entry) => !isBarSeries(entry)) : spec.series;

  return { layout, advanced, axisCenter, prepared, regularSeries };
};

/**
 * Ensures the effective bar baseline belongs to its explicit or resolved domain.
 * @param {ChartSpec} spec - Structured chart specification used for error attribution.
 * @param {ChartSpec['axisCenter']} axisCenter - Effective x and y baselines.
 * @param {readonly [number, number]} xDomain - Resolved x-axis domain.
 * @param {readonly [number, number]} yDomain - Resolved y-axis domain.
 */
export const assertStructuredBarAxisCenter = (
  spec: ChartSpec,
  axisCenter: ChartSpec['axisCenter'],
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
) => {
  axisCenter?.forEach((coordinate, index) => {
    if (coordinate === undefined) return;
    const domain = index === 0 ? xDomain : yDomain;
    if (coordinate < domain[0] || coordinate > domain[1]) {
      const axisName = ['xAxis', 'yAxis'][index];
      rangeError(
        spec.axisCenter?.[index] === undefined ? `${axisName}.domain` : `axisCenter[${index}]`,
        'must fall within the resolved domain',
        'ERR_CHART_OUT_OF_DOMAIN',
      );
    }
  });
};
