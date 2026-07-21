import { ChartSpec, Formatter } from '@types';
import { rangeError } from '@services/errors';

import { getDataXValues, normalizeSpec } from './mapping';
import { NormalizedChartSpec } from './types';

const selectBandTicks = (categoryCount: number, count: number): number[] => {
  if (count > categoryCount) {
    rangeError('xAxis.ticks', 'count must not exceed the category count');
  }
  return Array.from({ length: count }, (_, index) =>
    Math.round((index * (categoryCount - 1)) / (count - 1)),
  );
};

/**
 * Normalizes band spec.
 * @param {ChartSpec<string>} spec - The spec.
 * @returns {NormalizedChartSpec} - Computed result.
 */
export const normalizeBandSpec = (spec: ChartSpec<string>): NormalizedChartSpec => {
  const dataCategories = [...new Set(getDataXValues(spec) as string[])];
  const categories = spec.xAxis?.domain
    ? [...(spec.xAxis.domain as readonly string[])]
    : dataCategories;
  const indexes = new Map(categories.map((category, index) => [category, index]));
  const encode = (value: string) => indexes.get(value) ?? -1;
  const decode = (value: number) => categories[value] ?? '';
  const configuredTicks = spec.xAxis?.ticks;
  let ticks: number[];
  if (typeof configuredTicks === 'number') {
    ticks = selectBandTicks(categories.length, configuredTicks);
  } else if (Array.isArray(configuredTicks)) {
    let previous = -1;
    ticks = configuredTicks.map((tick, index) => {
      const encoded = encode(tick);
      if (encoded < 0) {
        rangeError(
          `xAxis.ticks[${index}]`,
          'must fall within the resolved domain',
          'ERR_CHART_OUT_OF_DOMAIN',
        );
      }
      if (encoded <= previous) rangeError('xAxis.ticks', 'values must follow domain order');
      previous = encoded;
      return encoded;
    });
  } else {
    ticks = categories.map((_, index) => index);
  }
  const nativeFormatter = spec.xAxis?.formatter;
  const formatter: Formatter = (value, helpers) =>
    nativeFormatter ? nativeFormatter(decode(value), helpers) : decode(value);
  const xAxis: ChartSpec<number>['xAxis'] = {
    ...spec.xAxis,
    scale: 'linear',
    domain: categories.length ? [-0.5, categories.length - 0.5] : undefined,
    ticks: ticks.length ? ticks : undefined,
    formatter,
  };

  return {
    spec: normalizeSpec(spec, encode, decode, xAxis, true),
    hasConfiguredTicks: configuredTicks !== undefined,
    usesNativeTicks: ticks.length > 0,
  };
};
