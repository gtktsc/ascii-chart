import type { Formatter } from '@types';
import { DEFAULT_DECIMAL_PLACES, K_FORMAT_THRESHOLD } from '@constants/formatting';

/**
 * Formats numeric axis values with compact, bounded precision.
 * @param {number} value - The value.
 * @returns {string | number} - Computed result.
 */
export const defaultFormatter: Formatter = (value) => {
  if (Math.abs(value) >= K_FORMAT_THRESHOLD) {
    const rounded = value / K_FORMAT_THRESHOLD;
    return rounded % 1 === 0 ? `${rounded}k` : `${rounded.toFixed(DEFAULT_DECIMAL_PLACES)}k`;
  }
  return Number(value.toFixed(DEFAULT_DECIMAL_PLACES));
};
