import { ChartAxis } from '@types';
import { rangeError } from '@services/errors';

/**
 * Resolves domain.
 * @param {ChartAxis | undefined} axis - The axis.
 * @param {number[]} values - The values.
 * @returns {[number, number] | undefined} - Computed result.
 */
export const resolveDomain = (
  axis: ChartAxis | undefined,
  values: number[],
): [number, number] | undefined => {
  if (axis?.domain) return [...axis.domain];
  if (!values.length) return undefined;
  return [Math.min(...values), Math.max(...values)];
};

/**
 * Resolves ticks.
 * @param {ChartAxis | undefined} axis - The axis.
 * @param {readonly [number, number]} domain - The domain.
 * @param {number[]} values - The values.
 * @param {string} path - The path.
 * @returns {number[]} - Computed result.
 */
export const resolveTicks = (
  axis: ChartAxis | undefined,
  domain: readonly [number, number],
  values: number[],
  path: string,
): number[] => {
  let ticks: number[];
  if (typeof axis?.ticks === 'number') {
    if (domain[0] === domain[1]) rangeError(`${path}.ticks`, 'cannot divide a zero-span domain');
    ticks = Array.from(
      { length: axis.ticks },
      (_, index) => domain[0] + ((domain[1] - domain[0]) * index) / ((axis.ticks as number) - 1),
    );
  } else if (Array.isArray(axis?.ticks)) {
    ticks = [...axis.ticks];
  } else {
    ticks = [...new Set(values)]
      .filter((value) => value >= domain[0] && value <= domain[1])
      .sort((left, right) => left - right);
  }
  if (Array.isArray(axis?.ticks)) {
    ticks.forEach((tick, index) => {
      if (tick < domain[0] || tick > domain[1]) {
        rangeError(
          `${path}.ticks[${index}]`,
          'must fall within the resolved domain',
          'ERR_CHART_OUT_OF_DOMAIN',
        );
      }
    });
  }
  return ticks;
};
