import { CHART, POINT } from '@constants';
import { CustomSymbol, Graph, LineFormatterArgs, MultiLine, Point } from '@types';
import { distance } from '@helpers/coordinates';
import { assertCellSymbol } from '@helpers/terminal-text';
import { rangeError, typeError } from '@services/errors';

import { drawPosition } from './position';

import type { DrawLineOptions } from './types';

/**
 * Samples scaled line coordinates at every integer plot column.
 * @param {Point[]} points - Scaled points ordered by x-coordinate.
 * @returns {Point[]} - Points with linearly interpolated intermediate columns.
 */
export const interpolateLinearPoints = (points: Point[]): Point[] => {
  if (points.length < 2) return [...points];
  const interpolated: Point[] = [points[0]];

  for (let index = 1; index < points.length; index++) {
    const [previousX, previousY] = points[index - 1];
    const [currentX, currentY] = points[index];
    const firstColumn = Math.round(previousX);
    const lastColumn = Math.round(currentX);
    if (firstColumn === lastColumn || currentX === previousX) {
      interpolated.push(points[index]);
      continue;
    }
    for (let column = firstColumn + 1; column <= lastColumn; column++) {
      const ratio = Math.max(0, Math.min(1, (column - previousX) / (currentX - previousX)));
      interpolated.push([column, previousY + ratio * (currentY - previousY)]);
    }
  }

  return interpolated;
};

const assertCustomSymbol = (value: unknown, path: string): CustomSymbol => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return typeError(path, 'must be an object');
  }
  const symbol = value as Record<string, unknown>;
  for (const coordinate of ['x', 'y'] as const) {
    if (typeof symbol[coordinate] !== 'number') {
      typeError(`${path}.${coordinate}`, 'must be a number');
    }
    if (!Number.isFinite(symbol[coordinate]) || !Number.isInteger(symbol[coordinate])) {
      rangeError(`${path}.${coordinate}`, 'must be a finite integer');
    }
  }
  return {
    x: symbol.x as number,
    y: symbol.y as number,
    symbol: assertCellSymbol(symbol.symbol, `${path}.symbol`),
  };
};

/**
 * Renders custom symbols returned by a line formatter.
 * @param {object} options - Options passed to the custom line formatter.
 * @param {Point[]} options.sortedCoords - Sorted source coordinates for the series.
 * @param {number} options.scaledX - Scaled x-coordinate of the current point.
 * @param {number} options.scaledY - Scaled y-coordinate of the current point.
 * @param {MultiLine} options.input - Complete chart input.
 * @param {number} options.index - Index of the current point.
 * @param {number} options.minY - Minimum y-value in the chart range.
 * @param {number} options.minX - Minimum x-value in the chart range.
 * @param {number[]} options.expansionX - Expanded x-axis range.
 * @param {number[]} options.expansionY - Expanded y-axis range.
 * @param {function} options.toPlotCoordinates - Converts source coordinates to plot coordinates.
 * @param {function} options.lineFormatter - Produces one or more custom symbols.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 */
export const drawCustomLine = ({
  sortedCoords,
  scaledX,
  scaledY,
  input,
  index,
  lineFormatter,
  graph,
  toPlotCoordinates,
  expansionX,
  expansionY,
  minY,
  minX,
  debugMode,
}: {
  sortedCoords: Point[];
  scaledX: number;
  scaledY: number;
  input: MultiLine;
  index: number;
  minY: number;
  minX: number;
  expansionX: number[];
  expansionY: number[];
  toPlotCoordinates: (x: number, y: number) => Point;
  lineFormatter: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
  graph: Graph;
  debugMode?: boolean;
}) => {
  const lineFormatterArgs = {
    x: sortedCoords[index][0],
    y: sortedCoords[index][1],
    plotX: scaledX + 1,
    plotY: scaledY + 1,
    index,
    input: input[0],
    minY,
    minX,
    toPlotCoordinates,
    expansionX,
    expansionY,
  };
  const customSymbols = lineFormatter(lineFormatterArgs);
  if (Array.isArray(customSymbols)) {
    customSymbols.forEach((customSymbol, customIndex) => {
      const {
        x: symbolX,
        y: symbolY,
        symbol,
      } = assertCustomSymbol(customSymbol, `lineFormatter.result[${customIndex}]`);
      drawPosition({ debugMode, graph, scaledX: symbolX, scaledY: symbolY, symbol });
    });
  } else {
    const customSymbol = assertCustomSymbol(customSymbols, 'lineFormatter.result');
    drawPosition({
      debugMode,
      graph,
      scaledX: customSymbol.x,
      scaledY: customSymbol.y,
      symbol: customSymbol.symbol,
    });
  }
};

const drawBar = (options: DrawLineOptions): void => {
  const vertical = options.mode === 'bar';
  const from = vertical ? options.scaledY : options.scaledX;
  const to = vertical ? options.axis.y : options.axis.x;
  const step = from >= to ? -1 : 1;
  const axisCenterShift = options.axisCenter ? 0 : 1;
  for (let position = from; ; position += step) {
    drawPosition({
      debugMode: options.debugMode,
      graph: options.graph,
      scaledX: vertical ? options.scaledX + axisCenterShift : position,
      scaledY: vertical ? position : options.scaledY + 1,
      symbol: options.chartSymbols?.area || CHART.area,
    });
    if (position === to) break;
  }
};

const drawPoint = (options: DrawLineOptions): void => {
  drawPosition({
    debugMode: options.debugMode,
    graph: options.graph,
    scaledX: options.scaledX + 1,
    scaledY: options.scaledY + 1,
    symbol: options.pointSymbol ?? POINT,
  });
};

const drawDescendingConnection = (
  options: DrawLineOptions,
  step: number,
  lastStep: number,
): void => {
  drawPosition({
    debugMode: options.debugMode,
    graph: options.graph,
    scaledX: options.scaledX,
    scaledY: options.scaledY + 1,
    symbol: options.chartSymbols?.nse || CHART.nse,
  });
  drawPosition({
    debugMode: options.debugMode,
    graph: options.graph,
    scaledX: options.scaledX,
    scaledY: options.scaledY - step,
    symbol:
      step === lastStep
        ? options.chartSymbols?.wns || CHART.wns
        : options.chartSymbols?.ns || CHART.ns,
  });
};

const drawAscendingConnection = (options: DrawLineOptions, step: number): void => {
  drawPosition({
    debugMode: options.debugMode,
    graph: options.graph,
    scaledX: options.scaledX,
    scaledY: options.scaledY + step + 2,
    symbol: options.chartSymbols?.wsn || CHART.wsn,
  });
  drawPosition({
    debugMode: options.debugMode,
    graph: options.graph,
    scaledX: options.scaledX,
    scaledY: options.scaledY + step + 1,
    symbol: options.chartSymbols?.ns || CHART.ns,
  });
};

const drawVerticalConnection = (
  options: DrawLineOptions,
  previousY: number,
  currentY: number,
): void => {
  const steps = distance(currentY, previousY);
  for (let step = 0; step < steps; step++) {
    if (Math.round(previousY) > Math.round(currentY)) {
      drawDescendingConnection(options, step, steps - 1);
    } else {
      drawAscendingConnection(options, step);
    }
  }
  if (Math.round(previousY) < Math.round(currentY)) {
    drawPosition({
      debugMode: options.debugMode,
      graph: options.graph,
      scaledX: options.scaledX,
      scaledY: options.scaledY + 1,
      symbol: options.chartSymbols?.sne || CHART.sne,
    });
  } else if (
    Math.round(previousY) === Math.round(currentY) &&
    options.graph[options.scaledY + 1][options.scaledX] === options.emptySymbol
  ) {
    drawPosition({
      debugMode: options.debugMode,
      graph: options.graph,
      scaledX: options.scaledX,
      scaledY: options.scaledY + 1,
      symbol: options.chartSymbols?.we || CHART.we,
    });
  }
};

const drawHorizontalConnection = (
  options: DrawLineOptions,
  previous: Point,
  current: Point,
): void => {
  const distanceX = distance(current[0], previous[0]);
  for (let step = 0; step < (distanceX ? distanceX - 1 : 0); step++) {
    drawPosition({
      debugMode: options.debugMode,
      graph: options.graph,
      scaledX: Math.round(previous[0]) + step + 1,
      scaledY: options.plotHeight - Math.round(previous[1]),
      symbol: options.chartSymbols?.we || CHART.we,
    });
  }
};

const drawLineSegment = (options: DrawLineOptions): void => {
  const current = options.arr[options.index];
  if (options.index > 0) {
    const previous = options.arr[options.index - 1];
    drawVerticalConnection(options, previous[1], current[1]);
    drawHorizontalConnection(options, previous, current);
  }
  if (options.arr.length - 1 === options.index) {
    drawPosition({
      debugMode: options.debugMode,
      graph: options.graph,
      scaledX: options.scaledX + 1,
      scaledY: options.scaledY + 1,
      symbol: options.chartSymbols?.we || CHART.we,
    });
  }
};

/**
 * Renders one line, point, or bar series segment.
 * @param {object} options - Options for rendering the current series segment.
 * @param {number} options.index - Index of the current point.
 * @param {Point[]} options.arr - Points in the current series.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {number} options.scaledX - Scaled x-coordinate of the current point.
 * @param {number} options.scaledY - Scaled y-coordinate of the current point.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {string} options.emptySymbol - Symbol representing unused graph cells.
 * @param {Symbols['chart']} options.chartSymbols - Symbols used to render chart data.
 * @param {MaybePoint} [options.axisCenter] - Optional custom axis intersection.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {GraphMode} options.mode - Chart rendering mode.
 * @param {string} [options.pointSymbol] - Symbol used for point-mode series.
 * @returns {void} - Nothing.
 */
export const drawLine = (options: DrawLineOptions): void => {
  if (options.mode === 'bar' || options.mode === 'horizontalBar') return drawBar(options);
  if (options.mode === 'point') return drawPoint(options);
  drawLineSegment(options);
};
