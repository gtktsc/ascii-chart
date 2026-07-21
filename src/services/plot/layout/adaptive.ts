import { Formatter, LabelCollisionPolicy, Legend, LegendPosition } from '@types';
import { FALLBACK_TERMINAL_COLUMNS, LAYOUT, TERMINAL_CELL_HEIGHT_RATIO } from '@constants/layout';
import { DEFAULT_TEXT_SYMBOLS } from '@constants/symbols/text';
import { assertDisplayValue, displayWidth, toDisplayTokens } from '@helpers/terminal-text';
import { rangeError } from '@services/errors';

import type { XTickLabelLayout } from './types';

export type { XTickLabelLayout } from './types';

/**
 * Resolves terminal columns.
 * @param {number | undefined} columns - The columns.
 * @returns {number} - Computed result.
 */
export const resolveTerminalColumns = (columns: number | undefined): number =>
  Number.isInteger(columns) && (columns as number) > 0
    ? (columns as number)
    : FALLBACK_TERMINAL_COLUMNS;

/**
 * Returns terminal columns.
 * @returns {number} - Computed result.
 */
export const getTerminalColumns = (): number => resolveTerminalColumns(process.stdout.columns);

/**
 * Resolves aspect height.
 * @param {number} width - The width.
 * @param {number} aspectRatio - The aspect ratio.
 * @param {number} verticalOverhead - The vertical overhead.
 * @returns {number} - Computed result.
 */
export const resolveAspectHeight = (
  width: number,
  aspectRatio: number,
  verticalOverhead = 0,
): number =>
  Math.max(
    LAYOUT.MIN_PLOT_HEIGHT,
    Math.round(width / (aspectRatio * TERMINAL_CELL_HEIGHT_RATIO)) - verticalOverhead,
  );

/**
 * Resolves legend position.
 * @param {object} options - Structured options.
 * @param {LegendPosition} options.position - The position.
 * @param {number} options.terminalColumns - The terminal columns.
 * @param {number} options.fixedPlotWidth - The fixed plot width.
 * @param {number} options.baseOverhead - The base overhead.
 * @param {number} options.legendWidth - The legend width.
 * @returns {"left" | "right" | "top" | "bottom"} - Computed result.
 */
export const resolveLegendPosition = ({
  position,
  terminalColumns,
  fixedPlotWidth,
  baseOverhead,
  legendWidth,
}: {
  position: LegendPosition;
  terminalColumns: number;
  fixedPlotWidth: number;
  baseOverhead: number;
  legendWidth: number;
}): Exclude<LegendPosition, 'auto'> => {
  if (position !== 'auto') return position;
  return fixedPlotWidth + baseOverhead + legendWidth + 2 <= terminalColumns ? 'right' : 'bottom';
};

/**
 * Measures legend width.
 * @param {Legend | undefined} legend - The legend.
 * @returns {number} - Computed result.
 */
export const measureLegendWidth = (legend: Legend | undefined): number => {
  if (!legend) return 0;
  const labels = [legend.series, legend.points, legend.thresholds].flatMap((value) =>
    value === undefined ? [] : Array.isArray(value) ? value : [value],
  );
  return labels.length ? 2 + Math.max(...labels.map(displayWidth)) : 0;
};

/**
 * Resolves auto plot width.
 * @param {object} options - Structured options.
 * @param {number} options.terminalColumns - The terminal columns.
 * @param {number} options.baseOverhead - The base overhead.
 * @param {Exclude<LegendPosition, 'auto'>} options.legendPosition - The legend position.
 * @param {number} options.legendWidth - The legend width.
 * @returns {number} - Computed result.
 */
export const resolveAutoPlotWidth = ({
  terminalColumns,
  baseOverhead,
  legendPosition,
  legendWidth,
}: {
  terminalColumns: number;
  baseOverhead: number;
  legendPosition: Exclude<LegendPosition, 'auto'>;
  legendWidth: number;
}): number => {
  const sideLegendWidth =
    legendPosition === 'left' ? legendWidth : legendPosition === 'right' ? legendWidth + 2 : 0;
  return Math.max(1, terminalColumns - baseOverhead - sideLegendWidth);
};

const getPosition = (value: number, domain: readonly [number, number], width: number): number => {
  const span = domain[1] - domain[0];
  return span === 0 ? 0 : ((value - domain[0]) / span) * Math.max(0, width - 1);
};

const getSlots = (
  ticks: readonly { value: number; position: number; label: string }[],
  width: number,
) =>
  ticks.map((tick, index) => {
    const previous = ticks[index - 1];
    const next = ticks[index + 1];
    const left = previous ? Math.floor((previous.position + tick.position) / 2) + 1 : 0;
    const right = next ? Math.floor((tick.position + next.position) / 2) : width - 1;
    return { ...tick, slotWidth: Math.max(1, right - left + 1) };
  });

const truncateText = (value: string, maxWidth: number, ellipsis: string): string => {
  if (displayWidth(value) <= maxWidth) return value;
  if (maxWidth <= 1) return ellipsis;
  const tokens = toDisplayTokens(value);
  const kept: string[] = [];
  let used = 0;
  for (const token of tokens) {
    if (used + token.width > maxWidth - 1) break;
    kept.push(token.text);
    used += token.width;
  }
  return `${kept.join('')}${ellipsis}`;
};

const wrapText = (value: string, maxWidth: number, ellipsis: string): string[] => {
  const lines: string[] = [];
  let line: string[] = [];
  let lineWidth = 0;
  for (const token of toDisplayTokens(value)) {
    if (token.width > maxWidth) {
      if (line.length) lines.push(line.join(''));
      lines.push(ellipsis);
      line = [];
      lineWidth = 0;
      continue;
    }
    if (line.length && lineWidth + token.width > maxWidth) {
      lines.push(line.join(''));
      line = [];
      lineWidth = 0;
    }
    line.push(token.text);
    lineWidth += token.width;
  }
  if (line.length) lines.push(line.join(''));
  return lines.length ? lines : [''];
};

const wrapTextAtWords = (value: string, maxWidth: number): string[] => {
  const words = value.trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return [''];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && displayWidth(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  lines.push(line);
  return lines;
};

const wrappedRowsFit = (layout: readonly XTickLabelLayout[], width: number): boolean => {
  const rowCount = Math.max(0, ...layout.map(({ lines }) => lines.length));
  for (let row = 0; row < rowCount; row += 1) {
    const lineWidths = layout.flatMap(({ lines }) =>
      lines[row] === undefined ? [] : [displayWidth(lines[row])],
    );
    if (lineWidths.reduce((sum, lineWidth) => sum + lineWidth, 0) + lineWidths.length - 1 > width) {
      return false;
    }
  }
  return true;
};

const labelsFit = (
  ticks: readonly { position: number; label: string }[],
  width: number,
): boolean => {
  let previousEnd: number | undefined;
  return ticks.every(({ position, label }) => {
    const labelWidth = displayWidth(label);
    if (labelWidth > width) return false;
    const start = Math.max(
      0,
      Math.min(width - labelWidth, Math.round(position - (labelWidth - 1) / 2)),
    );
    const fits = previousEnd === undefined || start > previousEnd + 1;
    previousEnd = start + labelWidth - 1;
    return fits;
  });
};

const thinTicks = <T extends { position: number; label: string }>(
  ticks: readonly T[],
  width: number,
): T[] => {
  if (labelsFit(ticks, width)) return [...ticks];
  if (ticks.length < 3) return ticks.slice(0, 1);
  for (let stride = 2; stride < ticks.length; stride += 1) {
    const selected = ticks.filter(
      (_, index) => index === 0 || index === ticks.length - 1 || index % stride === 0,
    );
    if (labelsFit(selected, width)) return selected;
  }
  const endpoints = [ticks[0], ticks[ticks.length - 1]];
  if (labelsFit(endpoints, width)) return endpoints;
  return ticks.slice(0, 1);
};

/**
 * Resolves xaxis tick layout.
 * @param {object} options - Structured options.
 * @param {readonly number[]} options.ticks - The ticks.
 * @param {number} options.width - The width.
 * @param {readonly [number, number]} options.xDomain - The x domain.
 * @param {readonly [number, number]} options.yDomain - The y domain.
 * @param {Formatter} options.formatter - The formatter.
 * @param {LabelCollisionPolicy} options.policy - The policy.
 * @param {string} options.path - The path.
 * @param {string} options.ellipsis - The ellipsis.
 * @returns {XTickLabelLayout[]} - Computed result.
 */
export const resolveXAxisTickLayout = ({
  ticks,
  width,
  xDomain,
  yDomain,
  formatter,
  policy,
  path,
  ellipsis = DEFAULT_TEXT_SYMBOLS.ellipsis,
}: {
  ticks: readonly number[];
  width: number;
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  formatter: Formatter;
  policy: LabelCollisionPolicy;
  path: string;
  ellipsis?: string;
}): XTickLabelLayout[] => {
  const formatterPath = `${path.replace(/\.ticks$/, '')}.formatter.result`;
  const formatted = ticks.map((value) => {
    const label = String(
      assertDisplayValue(
        formatter(value, { axis: 'x', xRange: [...xDomain], yRange: [...yDomain] }),
        formatterPath,
      ),
    );
    return { value, position: getPosition(value, xDomain, width), label };
  });

  if (policy === 'error') {
    if (!labelsFit(formatted, width)) {
      rangeError(
        path,
        'formatted labels do not fit; increase width, reduce ticks, or choose another collision policy',
        'ERR_CHART_LAYOUT',
      );
    }
    return getSlots(formatted, width).map(({ label, ...tick }) => ({ ...tick, lines: [label] }));
  }

  const visible = policy === 'hide' ? thinTicks(formatted, width) : formatted;
  const slotted = getSlots(visible, width);
  const layout = slotted.map(({ label, ...tick }) => ({
    ...tick,
    lines:
      policy === 'truncate'
        ? [truncateText(label, tick.slotWidth, ellipsis)]
        : policy === 'wrap'
          ? wrapTextAtWords(label, tick.slotWidth)
          : [label],
  }));
  if (policy !== 'wrap' || wrappedRowsFit(layout, width)) return layout;
  return slotted.map(({ label, ...tick }) => ({
    ...tick,
    lines: wrapText(label, tick.slotWidth, ellipsis),
  }));
};
