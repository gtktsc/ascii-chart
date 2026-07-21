import { AXIS } from '@constants';
import { Color, Graph, MaybePoint, Symbols } from '@types';
import { colorizeSymbol } from '@helpers/colors';
import { toArray } from '@helpers/coordinates';
import { stripAnsi } from '@helpers/terminal-text';

import { drawPosition } from './position';

import type { DrawYAxisEndOptions } from './types';

const isSameSymbol = (
  left: string | undefined,
  right: string | undefined,
  color?: Color,
): boolean =>
  left !== undefined &&
  right !== undefined &&
  (color ? stripAnsi(left) === stripAnsi(right) : left === right);

/**
 * Draws one x-axis label character, clamped to graph bounds.
 * @param {object} options - Options for positioning the label character.
 * @param {boolean} options.hasPlaceToRender - Whether the label fits above the axis.
 * @param {number} options.yPos - Base graph row for the label.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {boolean} [options.hideXAxisTicks] - Whether x-axis ticks are hidden.
 * @param {number} options.yShift - Horizontal shift reserved for y-axis labels.
 * @param {number} options.i - Character index within the label.
 * @param {number} options.scaledX - Scaled x-coordinate for the tick.
 * @param {MaybePoint} [options.axisCenter] - Optional custom axis intersection.
 * @param {string[]} options.pointXShift - Characters in the formatted x-axis label.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {Color} [options.color] - ANSI color for the tick label.
 */
export const drawXAxisEnd = ({
  hasPlaceToRender,
  yPos,
  graph,
  yShift,
  i,
  scaledX,
  hideXAxisTicks,
  pointXShift,
  debugMode,
  axisCenter,
  color,
}: {
  hasPlaceToRender: boolean;
  yPos: number;
  graph: Graph;
  hideXAxisTicks?: boolean;
  yShift: number;
  i: number;
  scaledX: number;
  axisCenter?: MaybePoint;
  pointXShift: string[];
  debugMode?: boolean;
  color?: Color;
}) => {
  if (hideXAxisTicks) {
    return;
  }

  const yShiftWhenOccupied = hasPlaceToRender ? -1 : 0;
  const yShiftWhenHasAxisCenter = 0;

  let graphY = yPos + yShiftWhenOccupied + yShiftWhenHasAxisCenter;
  if (graphY < 0) graphY = 0;
  else if (graphY >= graph.length) graphY = graph.length - 1;

  let graphX = scaledX + yShift - i + (axisCenter ? 1 : 2);
  if (graphX < 0) graphX = 0;
  else if (graphX >= graph[graphY].length) graphX = graph[graphY].length - 1;

  drawPosition({
    debugMode,
    graph,
    scaledX: graphX,
    scaledY: graphY,
    symbol: colorizeSymbol(pointXShift[pointXShift.length - 1 - i], color),
  });
};

/**
 * Draws one x-axis tick when its axis cell is available.
 * @param {object} options - Options for drawing the x-axis tick.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {boolean} [options.hideXAxisTicks] - Whether x-axis ticks are hidden.
 * @param {number} options.xPosition - Graph column for the tick.
 * @param {Symbols['axis']} options.axisSymbols - Symbols used to render axes and ticks.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {Color} [options.color] - ANSI color for the tick mark.
 */
export const drawXAxisTick = ({
  graph,
  xPosition,
  hideXAxisTicks,
  axisSymbols,
  debugMode,
  axis,
  color,
}: {
  axis: { x: number; y: number };
  graph: Graph;
  hideXAxisTicks?: boolean;
  xPosition: number;
  axisSymbols: Symbols['axis'];
  debugMode?: boolean;
  color?: Color;
}) => {
  if (hideXAxisTicks) {
    return;
  }

  if (
    isSameSymbol(graph[axis.y][xPosition], axisSymbols?.ns, color) ||
    isSameSymbol(graph[axis.y][xPosition], axisSymbols?.we, color)
  ) {
    drawPosition({
      debugMode,
      graph,
      scaledX: xPosition,
      scaledY: axis.y,
      symbol: colorizeSymbol(axisSymbols?.x || AXIS.x, color),
    });
  }
};

const drawYAxisLabel = (options: DrawYAxisEndOptions, value: number, graphY: number): void => {
  const cells = toArray(
    options.transformLabel(value, {
      axis: 'y',
      xRange: options.expansionX,
      yRange: options.expansionY,
    }),
  );
  for (let index = 0; index < cells.length; index++) {
    const graphX = options.axis.x + options.yShift - index;
    if (graphX < 0 || graphX >= options.graph[graphY].length) continue;
    drawPosition({
      debugMode: options.debugMode,
      graph: options.graph,
      scaledX: graphX,
      scaledY: graphY,
      symbol: colorizeSymbol(cells[cells.length - 1 - index], options.color),
    });
  }
};

const drawYAxisTick = (options: DrawYAxisEndOptions, graphY: number, graphX: number): void => {
  const row = options.graph[graphY];
  if (graphX < 0 || graphX >= row.length) return;
  if (
    !isSameSymbol(row[graphX], options.axisSymbols?.ns, options.color) &&
    !isSameSymbol(row[graphX], options.axisSymbols?.we, options.color)
  ) {
    return;
  }
  drawPosition({
    debugMode: options.debugMode,
    graph: options.graph,
    scaledX: graphX,
    scaledY: graphY,
    symbol: colorizeSymbol(options.axisSymbols?.y || AXIS.y, options.color),
  });
};

const drawAdaptiveYAxisTicks = (options: DrawYAxisEndOptions): void => {
  const yMax = Math.max(...options.expansionY);
  const yMin = Math.min(...options.expansionY);
  const yStep = (yMax - yMin) / options.plotHeight;
  const tickValueByRow = new Map<number, number>();
  for (let index = 0; index <= options.plotHeight; index++) {
    const yValue = Math.round(yMax - index * yStep);
    const scaledY = ((yMax - yValue) / (yMax - yMin)) * (options.plotHeight - 1);
    const graphY = Math.floor(scaledY) + 1;
    if (graphY >= 0 && graphY < options.graph.length) tickValueByRow.set(graphY, yValue);
  }
  tickValueByRow.forEach((value, graphY) => {
    drawYAxisLabel(options, value, graphY);
    drawYAxisTick(options, graphY, options.axis.x + options.yShift + 1);
  });
};

const drawLegacyYAxisTick = (options: DrawYAxisEndOptions): void => {
  if (options.hideYAxisTicks) return;
  const row = options.scaledY + 1;
  const column = options.axis.x + options.yShift + 1;
  const graphRow = options.graph[row];
  if (!graphRow || row < 0 || column < 0 || column >= graphRow.length) return;
  if (isSameSymbol(graphRow[column], options.axisSymbols?.y, options.color)) return;
  drawYAxisLabel(options, options.pointY, row);
  drawYAxisTick(options, row, column);
};

/**
 * Draws y-axis labels and ticks.
 * @param {object} options - Options for drawing y-axis labels and ticks.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {number} options.scaledY - Scaled y-coordinate for the source point.
 * @param {number} options.yShift - Horizontal shift reserved for y-axis labels.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {number} options.pointY - Original y-value used for the label.
 * @param {Formatter} options.transformLabel - Function used to format axis labels.
 * @param {Symbols['axis']} options.axisSymbols - Symbols used to render axes and ticks.
 * @param {number[]} options.expansionX - Expanded x-axis range.
 * @param {number[]} options.expansionY - Expanded y-axis range.
 * @param {boolean} [options.hideYAxisTicks] - Whether y-axis ticks are hidden.
 * @param {boolean} [options.showTickLabel] - Whether evenly spaced tick labels are shown.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {Color} [options.color] - ANSI color for tick marks and labels.
 */
export const drawYAxisEnd = ({
  graph,
  scaledY,
  yShift,
  axis,
  pointY,
  transformLabel,
  axisSymbols,
  expansionX,
  expansionY,
  plotHeight,
  showTickLabel,
  hideYAxisTicks,
  debugMode,
  color,
}: DrawYAxisEndOptions) => {
  const options: DrawYAxisEndOptions = {
    graph,
    scaledY,
    yShift,
    axis,
    pointY,
    transformLabel,
    axisSymbols,
    expansionX,
    expansionY,
    plotHeight,
    showTickLabel,
    hideYAxisTicks,
    debugMode,
    color,
  };
  if (showTickLabel) {
    drawAdaptiveYAxisTicks(options);
    return;
  }
  drawLegacyYAxisTick(options);
};

const resolveVerticalAxisSymbol = (
  row: number,
  rowCount: number,
  axisCenter: MaybePoint | undefined,
  hideXAxis: boolean | undefined,
  axisSymbols: Symbols['axis'],
): string => {
  if (row === 0) return axisSymbols?.n || AXIS.n;
  if (row === rowCount - 1 && !axisCenter && !hideXAxis) {
    return axisSymbols?.nse || AXIS.nse;
  }
  return axisSymbols?.ns || AXIS.ns;
};

const resolveHorizontalAxisSymbol = (
  column: number,
  columnCount: number,
  axisSymbols: Symbols['axis'],
): string => (column === columnCount - 1 ? axisSymbols?.e || AXIS.e : axisSymbols?.we || AXIS.we);

const resolveAxisSymbol = ({
  row,
  column,
  rowCount,
  columnCount,
  axis,
  axisCenter,
  hideXAxis,
  hideYAxis,
  axisSymbols,
}: {
  row: number;
  column: number;
  rowCount: number;
  columnCount: number;
  axis: { x: number; y: number };
  axisCenter?: MaybePoint;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  axisSymbols: Symbols['axis'];
}): string => {
  if (column === axis.x && !hideYAxis) {
    return resolveVerticalAxisSymbol(row, rowCount, axisCenter, hideXAxis, axisSymbols);
  }
  if (row !== axis.y || hideXAxis) return '';
  return resolveHorizontalAxisSymbol(column, columnCount, axisSymbols);
};

/**
 * Draws the x and y axes.
 * @param {object} options - Options for drawing both axes.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {boolean} [options.hideXAxis] - Whether the x-axis is hidden.
 * @param {MaybePoint} [options.axisCenter] - Optional custom axis intersection.
 * @param {boolean} [options.hideYAxis] - Whether the y-axis is hidden.
 * @param {Symbols['axis']} options.axisSymbols - Symbols used to render the axes.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {Color} [options.xColor] - ANSI color for the X-axis.
 * @param {Color} [options.yColor] - ANSI color for the Y-axis.
 */
export const drawAxis = ({
  graph,
  hideXAxis,
  hideYAxis,
  axisCenter,
  axisSymbols,
  axis,
  debugMode,
  xColor,
  yColor,
}: {
  graph: Graph;
  axis: { x: number; y: number };
  hideXAxis?: boolean;
  axisCenter?: MaybePoint;
  hideYAxis?: boolean;
  axisSymbols: Symbols['axis'];
  debugMode?: boolean;
  xColor?: Color;
  yColor?: Color;
}) => {
  for (let index = 0; index < graph.length; index++) {
    const line = graph[index];
    for (let curr = 0; curr < line.length; curr++) {
      const lineChar = resolveAxisSymbol({
        row: index,
        column: curr,
        rowCount: graph.length,
        columnCount: line.length,
        axis,
        axisCenter,
        hideXAxis,
        hideYAxis,
        axisSymbols,
      });

      if (lineChar) {
        const color = curr === axis.x ? yColor : xColor;
        drawPosition({
          debugMode,
          graph,
          scaledX: curr,
          scaledY: index,
          symbol: colorizeSymbol(lineChar, color),
        });
      }
    }
  }
};

const isEmptyAxisCell = (
  value: string | undefined,
  axisSymbols: typeof AXIS,
  emptySymbol: string,
  backgroundSymbol: string,
  color?: Color,
): boolean => {
  if (!color) {
    return (
      value === undefined ||
      !Object.values(axisSymbols).includes(value) ||
      value === backgroundSymbol ||
      value === emptySymbol
    );
  }
  const plain = stripAnsi(String(value));
  return (
    !Object.values(axisSymbols).some((axisSymbol) => stripAnsi(axisSymbol) === plain) ||
    plain === stripAnsi(backgroundSymbol) ||
    plain === stripAnsi(emptySymbol)
  );
};

const resolveAxisCenterSymbol = (
  graph: Graph,
  x: number,
  y: number,
  axisSymbols: typeof AXIS,
  emptySymbol: string,
  backgroundSymbol: string,
  color?: Color,
): string | undefined => {
  const isEmpty = (value: string | undefined) =>
    isEmptyAxisCell(value, axisSymbols, emptySymbol, backgroundSymbol, color);
  const emptyOnLeft = isEmpty(graph[y]?.[x - 1]);
  const emptyOnBottom = isEmpty(graph[y + 1]?.[x]);
  const emptyOnRight = isEmpty(graph[y]?.[x + 1]);
  const emptyOnTop = isEmpty(graph[y - 1]?.[x]);
  const connections =
    (emptyOnLeft ? 0 : 1) | (emptyOnBottom ? 0 : 2) | (emptyOnRight ? 0 : 4) | (emptyOnTop ? 0 : 8);
  switch (connections) {
    case 0:
      return undefined;
    case 4:
      return axisSymbols.we;
    case 8:
    case 10:
      return axisSymbols.ns;
    case 14:
      return axisSymbols.intersectionY;
    case 15:
      return axisSymbols.intersectionXY;
    default:
      return axisSymbols.nse;
  }
};

/**
 * Resolves and draws the symbol at custom axis intersection.
 * @param {object} options - Options for drawing the custom axis intersection.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {number} options.realXShift - Applied horizontal graph shift.
 * @param {typeof AXIS} options.axisSymbols - Complete set of axis symbols.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {string} options.emptySymbol - Symbol representing unused graph cells.
 * @param {string} options.backgroundSymbol - Symbol representing chart background cells.
 * @param {Color} [options.color] - ANSI color for the axis intersection.
 */
export const drawAxisCenter = ({
  graph,
  realXShift,
  axis,
  debugMode,
  axisSymbols,
  emptySymbol,
  backgroundSymbol,
  color,
}: {
  graph: Graph;
  axis: { x: number; y: number };
  realXShift: number;
  axisSymbols: typeof AXIS;
  debugMode?: boolean;
  emptySymbol: string;
  backgroundSymbol: string;
  color?: Color;
}) => {
  const positionX = axis.x + realXShift;
  const positionY = axis.y;
  if (graph[positionY][positionX] === undefined) return;
  const symbol = resolveAxisCenterSymbol(
    graph,
    positionX,
    positionY,
    axisSymbols,
    emptySymbol,
    backgroundSymbol,
    color,
  );
  if (!symbol) return;
  drawPosition({
    graph,
    scaledX: positionX,
    scaledY: positionY,
    symbol: colorizeSymbol(symbol, color),
    debugMode,
  });
};
