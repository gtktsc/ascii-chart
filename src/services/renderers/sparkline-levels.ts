import { CONSTANT_SPARKLINE_LEVEL, SPARKLINE_LEVEL_COUNT } from '@constants/layout';
import { normalizeInRange } from '@helpers/numeric-range';
import { rangeError, typeError } from '@services/errors';

import type { SparklineLevel } from './types';

/**
 * Purely validates and scales sparkline values into glyph levels.
 * @param {readonly (number | null)[]} input - Finite numeric values with optional null gaps.
 * @returns {SparklineLevel[]} - Numeric glyph levels with null positions preserved.
 */
export const toSparklineLevels = (input: readonly (number | null)[]): SparklineLevel[] => {
  if (!Array.isArray(input)) return typeError('values', 'must be an array');

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  const values = input.map((value, index) => {
    if (value === null) return null;
    if (typeof value !== 'number') return typeError(`values[${index}]`, 'must be a number or null');
    if (!Number.isFinite(value)) return rangeError(`values[${index}]`, 'must be finite');
    min = Math.min(min, value);
    max = Math.max(max, value);
    return value;
  });

  if (min === Number.POSITIVE_INFINITY) return values.map(() => null);
  if (min === max) {
    return values.map((value) => (value === null ? null : CONSTANT_SPARKLINE_LEVEL));
  }

  return values.map((value) =>
    value === null
      ? null
      : (Math.min(
          SPARKLINE_LEVEL_COUNT - 1,
          Math.floor(normalizeInRange(value, min, max) * SPARKLINE_LEVEL_COUNT),
        ) as SparklineLevel),
  );
};
