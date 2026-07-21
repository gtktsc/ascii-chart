import { Formatter } from '@types';
import { colorizeSymbol } from '@helpers/colors';
import { defaultFormatter } from '@helpers/formatting';
import { assertDisplayValue, displayWidth, toDisplayTokens } from '@helpers/terminal-text';

import { drawPosition } from './position';

import type { SecondaryYAxisLayout, SecondaryYAxisOptions } from './types';

const formatTick = ({
  axis,
  xDomain,
  yDomain,
  tick,
}: Omit<SecondaryYAxisLayout, 'ticks'> & { tick: number }): number | string => {
  const formatter: Formatter = axis.formatter ?? defaultFormatter;
  return assertDisplayValue(
    formatter(tick, { axis: 'y', xRange: [...xDomain], yRange: [...yDomain] }),
    'secondaryYAxis.formatter.result',
  );
};

/**
 * Measures secondary yaxis width.
 * @param {object} options - Structured options.
 * @returns {number} - Computed result.
 */
export const measureSecondaryYAxisWidth = ({
  axis,
  xDomain,
  yDomain,
  ticks,
}: SecondaryYAxisLayout): number => {
  const tickWidth =
    axis.hidden || axis.hideTicks
      ? 0
      : Math.max(
          0,
          ...ticks.map((tick) => displayWidth(formatTick({ axis, xDomain, yDomain, tick }))),
        );
  const labelWidth = axis.label
    ? Math.max(0, ...toDisplayTokens(axis.label).map(({ width }) => width))
    : 0;
  return tickWidth + (labelWidth ? labelWidth + 1 : 0);
};

const getDenseTicks = (domain: readonly [number, number], plotHeight: number): number[] => {
  const [min, max] = domain;
  const step = (max - min) / plotHeight;
  return Array.from({ length: plotHeight + 1 }, (_, index) => Math.round(max - index * step));
};

const getTickRow = (
  value: number,
  domain: readonly [number, number],
  plotHeight: number,
): number => {
  const span = domain[1] - domain[0];
  if (span === 0) return plotHeight;
  return 1 + Math.round(((domain[1] - value) / span) * (plotHeight - 1));
};

/**
 * Draws secondary yaxis.
 * @param {object} options - Structured options.
 */
export const drawSecondaryYAxis = ({
  graph,
  plotWidth,
  plotHeight,
  realXShift,
  xAxisRow,
  backgroundSymbol,
  axisSymbols,
  axis,
  xDomain,
  yDomain,
  ticks,
  debugMode,
}: SecondaryYAxisOptions): void => {
  const axisColumn = realXShift + plotWidth + 1;
  const bottomRow = xAxisRow === undefined ? plotHeight + 1 : plotHeight;
  const visibleTicks =
    axis.hidden || axis.hideTicks
      ? []
      : axis.showTickLabel && axis.ticks === undefined
        ? getDenseTicks(yDomain, plotHeight)
        : [...ticks];
  const labels = new Map<number, string[]>();

  visibleTicks.forEach((tick) => {
    const value = formatTick({ axis, xDomain, yDomain, tick });
    labels.set(
      getTickRow(tick, yDomain, plotHeight),
      toDisplayTokens(value).flatMap(({ text, width }) => [text, ...Array(width - 1).fill('')]),
    );
  });

  const tickWidth = Math.max(0, ...[...labels.values()].map((label) => label.length));
  const axisLabel = axis.label ? toDisplayTokens(axis.label) : [];
  const labelColumn = axisColumn + 1 + tickWidth + (axisLabel.length ? 1 : 0);
  const totalWidth = labelColumn + Math.max(0, ...axisLabel.map(({ width }) => width));

  graph.forEach((row) => {
    while (row.length < totalWidth) row.push(backgroundSymbol);
  });

  if (!axis.hidden) {
    for (let row = 0; row <= bottomRow; row++) {
      drawPosition({
        graph,
        scaledX: axisColumn,
        scaledY: row,
        symbol: colorizeSymbol(
          row === 0
            ? axisSymbols.n
            : row === xAxisRow
              ? axisSymbols.intersectionXY
              : row === bottomRow && xAxisRow === undefined
                ? axisSymbols.nsw
                : axisSymbols.ns,
          axis.color,
        ),
        debugMode,
      });
    }
  }

  labels.forEach((label, row) => {
    drawPosition({
      graph,
      scaledX: axisColumn,
      scaledY: row,
      symbol: colorizeSymbol(
        row === xAxisRow ? axisSymbols.intersectionXY : axisSymbols.y2,
        axis.color,
      ),
      debugMode,
    });
    label.forEach((cell, index) => {
      drawPosition({
        graph,
        scaledX: axisColumn + 1 + index,
        scaledY: row,
        symbol: cell ? colorizeSymbol(cell, axis.color) : cell,
        debugMode,
      });
    });
  });

  const labelStartRow = Math.max(0, Math.round((plotHeight + 2 - axisLabel.length) / 2));
  axisLabel.forEach((token, index) => {
    const row = labelStartRow + index;
    drawPosition({
      graph,
      scaledX: labelColumn,
      scaledY: row,
      symbol: colorizeSymbol(token.text, axis.color),
      debugMode,
    });
    for (let column = 1; column < token.width; column++) {
      drawPosition({
        graph,
        scaledX: labelColumn + column,
        scaledY: row,
        symbol: '',
        debugMode,
      });
    }
  });
};
