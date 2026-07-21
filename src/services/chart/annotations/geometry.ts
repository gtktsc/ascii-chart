import { Color } from '@types';
import { colorizeSymbol } from '@helpers/colors';
import { getPlotCoords, toPlot } from '@helpers/coordinates';

import { NumericPoint } from './types';

/**
 * Checks whether input is inside.
 * @param {number} value - The value.
 * @param {readonly [number, number]} domain - The domain.
 * @returns {boolean} - Computed result.
 */
export const isInside = (value: number, domain: readonly [number, number]): boolean =>
  value >= domain[0] && value <= domain[1];

/**
 * Converts input to cell.
 * @param {NumericPoint} point - The point.
 * @param {number} plotWidth - The plot width.
 * @param {number} plotHeight - The plot height.
 * @param {readonly [number, number]} xDomain - The x domain.
 * @param {readonly [number, number]} yDomain - The y domain.
 * @returns {[number, number]} - Computed result.
 */
export const toCell = (
  point: NumericPoint,
  plotWidth: number,
  plotHeight: number,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
): [number, number] => {
  const [[x, y]] = getPlotCoords(
    [[point[0], point[1]]],
    plotWidth,
    plotHeight,
    [...xDomain],
    [...yDomain],
  );
  const [plotX, plotY] = toPlot(plotWidth, plotHeight)(x, y);
  return [plotX + 1, plotY + 1];
};

/**
 * Applies terminal color to cell.
 * @param {string} symbol - The symbol.
 * @param {Color} color - The color.
 * @returns {string} - Computed result.
 */
export const colorizeCell = (symbol: string, color?: Color): string =>
  symbol === '' ? '' : colorizeSymbol(symbol, color);

/**
 * Clips line segment.
 * @param {NumericPoint} start - The start.
 * @param {NumericPoint} end - The end.
 * @param {readonly [number, number]} xDomain - The x domain.
 * @param {readonly [number, number]} yDomain - The y domain.
 * @returns {readonly [NumericPoint, NumericPoint] | undefined} - Computed result.
 */
export const clipLineSegment = (
  start: NumericPoint,
  end: NumericPoint,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
): readonly [NumericPoint, NumericPoint] | undefined => {
  const deltaX = end[0] - start[0];
  const deltaY = end[1] - start[1];
  const edges = [
    [-deltaX, start[0] - xDomain[0]],
    [deltaX, xDomain[1] - start[0]],
    [-deltaY, start[1] - yDomain[0]],
    [deltaY, yDomain[1] - start[1]],
  ] as const;
  let entry = 0;
  let exit = 1;

  for (const [direction, distance] of edges) {
    if (direction === 0) {
      if (distance < 0) return undefined;
      continue;
    }
    const ratio = distance / direction;
    if (direction < 0) entry = Math.max(entry, ratio);
    else exit = Math.min(exit, ratio);
    if (entry > exit) return undefined;
  }

  const pointAt = (ratio: number): NumericPoint => [
    Math.min(xDomain[1], Math.max(xDomain[0], start[0] + ratio * deltaX)),
    Math.min(yDomain[1], Math.max(yDomain[0], start[1] + ratio * deltaY)),
  ];
  return [pointAt(entry), pointAt(exit)];
};

/**
 * Returns line cells.
 * @param {object} options - Structured options.
 * @param {object} options1 - Structured options1.
 * @returns {NumericPoint[]} - Computed result.
 */
export const getLineCells = (
  [startX, startY]: NumericPoint,
  [endX, endY]: NumericPoint,
): NumericPoint[] => {
  const cells: NumericPoint[] = [];
  let x = startX;
  let y = startY;
  const deltaX = Math.abs(endX - startX);
  const deltaY = Math.abs(endY - startY);
  const stepX = startX < endX ? 1 : -1;
  const stepY = startY < endY ? 1 : -1;
  let error = deltaX - deltaY;

  while (true) {
    cells.push([x, y]);
    if (x === endX && y === endY) return cells;
    const doubledError = error * 2;
    if (doubledError > -deltaY) {
      error -= deltaY;
      x += stepX;
    }
    if (doubledError < deltaX) {
      error += deltaX;
      y += stepY;
    }
  }
};
