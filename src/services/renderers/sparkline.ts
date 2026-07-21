import { Color, SparklineColor, SparklineOptions, SparklineSymbols } from '@types';
import { DEFAULT_SPARKLINE_SYMBOLS } from '@constants/symbols/sparkline';
import { colorizeSymbol } from '@helpers/colors';
import { resolveSymbols } from '@helpers/symbols';
import { assertCellSymbol } from '@helpers/terminal-text';
import {
  assertColor,
  assertFiniteNumber,
  assertRecord,
} from '@services/chart/validation/primitives';
import { rangeError, typeError } from '@services/errors';

import { toSparklineLevels } from './sparkline-levels';

import type { SparklineRenderer } from './types';

const resolveSparklineSymbols = (value: unknown): Required<SparklineSymbols> => {
  if (value === undefined) {
    return resolveSymbols<Required<SparklineSymbols>>(DEFAULT_SPARKLINE_SYMBOLS);
  }
  const symbols = assertRecord(value, 'options.symbols');
  const levels = symbols.levels;
  if (levels !== undefined) {
    if (!Array.isArray(levels)) {
      typeError('options.symbols.levels', 'must be an array');
    }
    if ((levels as unknown[]).length !== DEFAULT_SPARKLINE_SYMBOLS.levels.length) {
      rangeError(
        'options.symbols.levels',
        `must contain exactly ${DEFAULT_SPARKLINE_SYMBOLS.levels.length} symbols`,
      );
    }
    (levels as unknown[]).forEach((symbol, index) =>
      assertCellSymbol(symbol, `options.symbols.levels[${index}]`),
    );
  }
  if (symbols.empty !== undefined) assertCellSymbol(symbols.empty, 'options.symbols.empty');
  return resolveSymbols<Required<SparklineSymbols>>(
    DEFAULT_SPARKLINE_SYMBOLS,
    symbols as SparklineSymbols,
  );
};

const renderSparklineLevels = (
  levels: ReturnType<typeof toSparklineLevels>,
  symbols: Required<SparklineSymbols>,
): string =>
  levels.map((level) => (level === null ? symbols.empty : symbols.levels[level])).join('');

const isColorArray = (color: SparklineColor | undefined): color is readonly (Color | undefined)[] =>
  Array.isArray(color);

const assertRequiredColor = (value: unknown, path: string): Color => {
  if (value === undefined) typeError(path, 'must be a color');
  assertColor(value, path);
  return value as Color;
};

const resolveThresholdColors = (
  values: readonly (number | null)[],
  threshold: unknown,
): readonly (Color | undefined)[] => {
  const record = assertRecord(threshold, 'options.threshold');
  const value = assertFiniteNumber(record.value, 'options.threshold.value');
  const belowColor = assertRequiredColor(record.belowColor, 'options.threshold.belowColor');
  const aboveColor = assertRequiredColor(record.aboveColor, 'options.threshold.aboveColor');

  return values.map((input) =>
    input === null ? undefined : input >= value ? aboveColor : belowColor,
  );
};

const resolveColor = (
  options: SparklineOptions | undefined,
  values: readonly (number | null)[],
): SparklineColor | undefined => {
  if (options === undefined) return undefined;
  const record = assertRecord(options, 'options');
  if (record.threshold !== undefined) {
    if (record.color !== undefined)
      typeError('options', 'color and threshold are mutually exclusive');
    return resolveThresholdColors(values, record.threshold);
  }
  if (Array.isArray(record.color)) {
    if (record.color.length !== values.length) {
      rangeError('options.color', `must contain exactly ${values.length} colors`);
    }
    record.color.forEach((color, index) => assertColor(color, `options.color[${index}]`));
    return record.color as readonly (Color | undefined)[];
  }
  assertColor(record.color, 'options.color');
  return record.color as Color | undefined;
};

const renderColoredSparklineLevels = (
  levels: ReturnType<typeof toSparklineLevels>,
  colors: readonly (Color | undefined)[],
  symbols: Required<SparklineSymbols>,
): string =>
  levels
    .map((level, index) =>
      level === null ? symbols.empty : colorizeSymbol(symbols.levels[level], colors[index]),
    )
    .join('');

/**
 * Renders finite values as a compact Unicode block sparkline.
 * @param {readonly (number | null)[]} values - Finite numeric values with optional null gaps.
 * @param {SparklineOptions} [options] - Optional ANSI color configuration.
 * @returns {string} - One display cell per input value.
 */
export const sparkline: SparklineRenderer = (values, options) => {
  const levels = toSparklineLevels(values);
  const symbols = resolveSparklineSymbols(options?.symbols);
  const color = resolveColor(options, values);
  if (isColorArray(color)) return renderColoredSparklineLevels(levels, color, symbols);
  const rendered = renderSparklineLevels(levels, symbols);
  if (rendered === '') return '';
  return colorizeSymbol(rendered, color);
};
