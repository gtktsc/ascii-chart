import { AxisFormatter, ChartSpec, Formatter } from '@types';

import { formatDateTick } from './format';
import { getDataXValues, normalizeSpec } from './mapping';
import { NormalizedChartSpec } from './types';

/**
 * Normalizes time spec.
 * @param {ChartSpec<Date>} spec - The spec.
 * @returns {NormalizedChartSpec} - Computed result.
 */
export const normalizeTimeSpec = (spec: ChartSpec<Date>): NormalizedChartSpec => {
  const encode = (value: Date) => value.getTime();
  const decode = (value: number) => new Date(value);
  const dataValues = getDataXValues(spec).map((value) => encode(value as Date));
  const nativeDomain = spec.xAxis?.domain as readonly [Date, Date] | undefined;
  const domain: [number, number] | undefined = nativeDomain
    ? [encode(nativeDomain[0]), encode(nativeDomain[1])]
    : dataValues.length
      ? [Math.min(...dataValues), Math.max(...dataValues)]
      : undefined;
  const configuredTicks = spec.xAxis?.ticks;
  let ticks: number | number[] | undefined;
  if (typeof configuredTicks === 'number') ticks = configuredTicks;
  else if (configuredTicks) ticks = configuredTicks.map((tick) => encode(tick));
  const nativeFormatter = spec.xAxis?.formatter as AxisFormatter<Date> | undefined;
  const formatter: Formatter = (value, helpers) =>
    nativeFormatter
      ? nativeFormatter(decode(value), helpers)
      : formatDateTick(decode(value), domain ?? [value, value]);
  const xAxis: ChartSpec<number>['xAxis'] = {
    ...spec.xAxis,
    scale: 'linear',
    domain,
    ticks,
    formatter,
  };

  return {
    spec: normalizeSpec(spec, encode, decode, xAxis),
    hasConfiguredTicks: configuredTicks !== undefined,
    usesNativeTicks: false,
  };
};
