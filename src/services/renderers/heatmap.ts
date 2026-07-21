import { HeatmapLevel, HeatmapSymbols, HeatmapThreshold, HeatmapValue } from '@types';
import { DEFAULT_HEATMAP_SYMBOLS } from '@constants/symbols/heatmap';
import { colorizeSymbol } from '@helpers/colors';
import { resolveSymbols } from '@helpers/symbols';
import { assertCellSymbol, assertDisplayText, displayWidth } from '@helpers/terminal-text';
import {
  assertColor,
  assertFiniteNumber,
  assertRecord,
} from '@services/chart/validation/primitives';
import { rangeError, typeError } from '@services/errors';

import type {
  HeatmapRenderer,
  ResolvedHeatmapLevel,
  ResolvedHeatmapThreshold,
  ValidatedHeatmapSpec,
} from './types';

const resolveHeatmapSymbols = (value: unknown): Required<HeatmapSymbols> => {
  if (value === undefined) {
    return resolveSymbols<Required<HeatmapSymbols>>(DEFAULT_HEATMAP_SYMBOLS);
  }
  const symbols = assertRecord(value, 'symbols');
  for (const field of ['cell', 'belowThreshold', 'aboveThreshold', 'empty'] as const) {
    if (symbols[field] !== undefined) assertCellSymbol(symbols[field], `symbols.${field}`);
  }
  if (symbols.gap !== undefined) assertDisplayText(symbols.gap, 'symbols.gap');
  return resolveSymbols<Required<HeatmapSymbols>>(
    DEFAULT_HEATMAP_SYMBOLS,
    symbols as HeatmapSymbols,
  );
};

const assertHeatmapValue = (value: unknown, path: string): HeatmapValue => {
  if (value === null || typeof value === 'string') return value;
  if (typeof value !== 'number') return typeError(path, 'must be a string, number, or null');
  if (!Number.isFinite(value)) return rangeError(path, 'must be finite');
  return value;
};

const assertLabels = (
  value: unknown,
  path: 'rows' | 'columns',
  expectedLength: number,
): readonly string[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return typeError(path, 'must be an array');
  if (value.length !== expectedLength) {
    return rangeError(path, `must contain exactly ${expectedLength} labels`);
  }
  return value.map((label, index) => assertDisplayText(label, `${path}[${index}]`));
};

const resolveLevels = (
  value: unknown,
  symbols: Required<HeatmapSymbols>,
): ResolvedHeatmapLevel[] => {
  if (!Array.isArray(value)) return typeError('levels', 'must be an array');
  const values = new Set<string | number>();

  return value.map((level, index) => {
    const path = `levels[${index}]`;
    const record = assertRecord(level, path);
    const levelValue = assertHeatmapValue(record.value, `${path}.value`);
    if (levelValue === null) return typeError(`${path}.value`, 'must not be null');
    if (typeof levelValue === 'string') assertDisplayText(levelValue, `${path}.value`);
    if (values.has(levelValue)) return rangeError(`${path}.value`, 'must be unique');
    values.add(levelValue);

    const symbol =
      record.symbol === undefined
        ? symbols.cell
        : assertCellSymbol(record.symbol, `${path}.symbol`);
    assertColor(record.color, `${path}.color`);
    const label =
      record.label === undefined ? undefined : assertDisplayText(record.label, `${path}.label`);

    return {
      value: levelValue,
      symbol,
      color: record.color as HeatmapLevel['color'],
      label,
    };
  });
};

const assertRequiredColor = (value: unknown, path: string): HeatmapThreshold['belowColor'] => {
  if (value === undefined) typeError(path, 'must be a color');
  assertColor(value, path);
  return value as HeatmapThreshold['belowColor'];
};

const resolveThreshold = (
  value: unknown,
  symbols: Required<HeatmapSymbols>,
): ResolvedHeatmapThreshold => {
  const record = assertRecord(value, 'threshold');
  const thresholdValue = assertFiniteNumber(record.value, 'threshold.value');

  return {
    value: thresholdValue,
    below: {
      symbol:
        record.belowSymbol === undefined
          ? symbols.belowThreshold
          : assertCellSymbol(record.belowSymbol, 'threshold.belowSymbol'),
      color: assertRequiredColor(record.belowColor, 'threshold.belowColor'),
      label:
        record.belowLabel === undefined
          ? `< ${thresholdValue}`
          : assertDisplayText(record.belowLabel, 'threshold.belowLabel'),
    },
    above: {
      symbol:
        record.aboveSymbol === undefined
          ? symbols.aboveThreshold
          : assertCellSymbol(record.aboveSymbol, 'threshold.aboveSymbol'),
      color: assertRequiredColor(record.aboveColor, 'threshold.aboveColor'),
      label:
        record.aboveLabel === undefined
          ? `≥ ${thresholdValue}`
          : assertDisplayText(record.aboveLabel, 'threshold.aboveLabel'),
    },
  };
};

const validateSpec = (value: unknown): ValidatedHeatmapSpec => {
  const spec = assertRecord(value, 'spec');
  if (!Array.isArray(spec.data)) return typeError('data', 'must be an array');

  const data = spec.data.map((row, rowIndex) => {
    if (!Array.isArray(row)) return typeError(`data[${rowIndex}]`, 'must be an array');
    return row.map((cell, columnIndex) =>
      assertHeatmapValue(cell, `data[${rowIndex}][${columnIndex}]`),
    );
  });
  const columnCount = data[0]?.length ?? (Array.isArray(spec.columns) ? spec.columns.length : 0);
  data.forEach((row, rowIndex) => {
    if (row.length !== columnCount) {
      rangeError(`data[${rowIndex}]`, `must contain exactly ${columnCount} cells`);
    }
  });

  const rows = assertLabels(spec.rows, 'rows', data.length);
  const columns = assertLabels(spec.columns, 'columns', columnCount);
  const symbols = resolveHeatmapSymbols(spec.symbols);
  if (spec.threshold !== undefined && spec.levels !== undefined) {
    typeError('spec', 'levels and threshold are mutually exclusive');
  }
  const threshold =
    spec.threshold === undefined ? undefined : resolveThreshold(spec.threshold, symbols);
  const levels = threshold === undefined ? resolveLevels(spec.levels, symbols) : [];
  const title = spec.title === undefined ? undefined : assertDisplayText(spec.title, 'title');
  if (spec.legend !== undefined && typeof spec.legend !== 'boolean') {
    typeError('legend', 'must be a boolean');
  }

  const levelValues = new Set(levels.map(({ value: levelValue }) => levelValue));
  data.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (threshold !== undefined && cell !== null && typeof cell !== 'number') {
        typeError(
          `data[${rowIndex}][${columnIndex}]`,
          'must be a number or null when threshold is used',
        );
      } else if (threshold === undefined && cell !== null && !levelValues.has(cell)) {
        rangeError(`data[${rowIndex}][${columnIndex}]`, 'has no matching level');
      }
    });
  });

  return {
    data,
    levels,
    threshold,
    rows,
    columns,
    title,
    legend: spec.legend as boolean | undefined,
    symbols,
  };
};

const padEnd = (value: string, width: number): string =>
  `${value}${' '.repeat(Math.max(0, width - displayWidth(value)))}`;

const center = (value: string, width: number): string => {
  const padding = Math.max(0, width - displayWidth(value));
  const left = Math.floor(padding / 2);
  return `${' '.repeat(left)}${value}${' '.repeat(padding - left)}`;
};

const trimLine = (line: string): string => line.trimEnd();

/**
 * Renders a categorical or threshold-colored heatmap with optional labels and legend.
 * @param {HeatmapSpec} spec - Matrix data and exact-level or numeric-threshold mapping.
 * @returns {string} - Display-width-aligned terminal text.
 */
export const heatmap: HeatmapRenderer = (spec) => {
  const validated = validateSpec(spec);
  const { empty, gap } = validated.symbols;
  const byValue = new Map(validated.levels.map((level) => [level.value, level]));
  const legendLevels = validated.threshold
    ? [validated.threshold.below, validated.threshold.above]
    : validated.levels;
  const columnCount = validated.data[0]?.length ?? validated.columns?.length ?? 0;
  const columnWidths = Array.from({ length: columnCount }, (_, index) =>
    Math.max(1, validated.columns ? displayWidth(validated.columns[index]) : 1),
  );
  const rowLabelWidth = validated.rows
    ? Math.max(0, ...validated.rows.map((label) => displayWidth(label)))
    : 0;
  const rowPrefix =
    validated.rows && validated.rows.length > 0 ? `${' '.repeat(rowLabelWidth)}${gap}` : '';
  const lines: string[] = [];

  if (validated.title !== undefined) lines.push(validated.title);
  if (validated.columns && validated.columns.length > 0) {
    lines.push(
      trimLine(
        `${rowPrefix}${validated.columns
          .map((label, index) => center(label, columnWidths[index]))
          .join(gap)}`,
      ),
    );
  }
  validated.data.forEach((row, rowIndex) => {
    const label = validated.rows ? `${padEnd(validated.rows[rowIndex], rowLabelWidth)}${gap}` : '';
    const cells = row.map((value, columnIndex) => {
      if (value === null) return center(empty, columnWidths[columnIndex]);
      const level = validated.threshold
        ? (value as number) >= validated.threshold.value
          ? validated.threshold.above
          : validated.threshold.below
        : (byValue.get(value) as ResolvedHeatmapLevel);
      return center(colorizeSymbol(level.symbol, level.color), columnWidths[columnIndex]);
    });
    lines.push(trimLine(`${label}${cells.join(gap)}`));
  });

  if (validated.legend && legendLevels.length > 0) {
    const legend = legendLevels
      .map((level) => {
        const label = 'value' in level ? (level.label ?? String(level.value)) : level.label;
        return `${colorizeSymbol(level.symbol, level.color)} ${label}`;
      })
      .join(gap);
    if (lines.length > 0) lines.push('');
    lines.push(trimLine(legend));
  }

  return lines.join('\n');
};
