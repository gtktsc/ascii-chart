import { Formatter, FormatterHelpers } from '@types';
import { defaultFormatter } from '@helpers/formatting';
import { assertDisplayValue } from '@helpers/terminal-text';

/**
 * Returns transform label.
 * @param {object} options - Structured options.
 * @param {Formatter} options.formatter - The formatter.
 * @returns {Formatter} - Computed result.
 */
export const getTransformLabel = ({ formatter }: { formatter?: Formatter }): Formatter => {
  const cache = new Map<string, number | string>();
  return (value: number, helpers: FormatterHelpers) => {
    const key = `${helpers.axis}:${value}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const result = assertDisplayValue(
      formatter ? formatter(value, helpers) : defaultFormatter(value, helpers),
      `${helpers.axis}Axis.formatter.result`,
    );
    cache.set(key, result);
    return result;
  };
};
