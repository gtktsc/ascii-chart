import { AXIS } from '@constants';
import { Color, Formatter, Graph, MaybePoint, MultiLine, Point } from '@types';
import { colorizeSymbol } from '@helpers/colors';
import { getPlotCoords, toArray, toPlot, toPoint } from '@helpers/coordinates';
import { stripAnsi } from '@helpers/terminal-text';
import type { XTickLabelLayout } from '@services/plot/layout/types';

import { drawXAxisEnd, drawXAxisTick, drawYAxisEnd } from './axis';
import { drawPosition } from './position';

import type { DrawXAxisTicksOptions, XTickContext } from './types';

const isSameSymbol = (
  left: string | undefined,
  right: string | undefined,
  color?: Color,
): boolean =>
  left !== undefined &&
  right !== undefined &&
  (color ? stripAnsi(left) === stripAnsi(right) : left === right);

/**
 * Creates a renderer for y-axis tick labels.
 * @param {object} options - Options captured by the y-axis tick renderer.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {boolean} [options.showTickLabel] - Whether evenly spaced tick labels are shown.
 * @param {boolean} [options.hideYAxisTicks] - Whether y-axis ticks are hidden.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.yShift - Horizontal shift reserved for y-axis labels.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {Formatter} options.transformLabel - Function used to format axis labels.
 * @param {typeof AXIS} options.axisSymbols - Complete set of axis symbols.
 * @param {number[]} options.expansionX - Expanded x-axis range.
 * @param {number[]} options.expansionY - Expanded y-axis range.
 * @param {Color} [options.color] - ANSI color for Y-axis ticks and labels.
 * @returns {function} - Renderer for y-axis tick labels.
 */
export const getDrawYAxisTicks =
  ({
    debugMode,
    showTickLabel,
    hideYAxisTicks,
    plotHeight,
    graph,
    plotWidth,
    yShift,
    axis,
    transformLabel,
    axisSymbols,
    expansionX,
    expansionY,
    color,
  }: {
    debugMode?: boolean;
    showTickLabel?: boolean;
    hideYAxisTicks?: boolean;
    plotHeight: number;
    graph: Graph;
    plotWidth: number;
    yShift: number;
    axis: { x: number; y: number };
    transformLabel: Formatter;
    axisSymbols: typeof AXIS;
    expansionX: number[];
    expansionY: number[];
    color?: Color;
  }) =>
  (points: Point[], resolvedCoords?: Point[]) => {
    const coords =
      resolvedCoords ?? getPlotCoords(points, plotWidth, plotHeight, expansionX, expansionY);
    points.forEach(([, pointY], i) => {
      const [x, y] = coords[i];
      const [, scaledY] = toPlot(plotWidth, plotHeight)(x, y);
      drawYAxisEnd({
        debugMode,
        showTickLabel,
        hideYAxisTicks,
        plotHeight,
        graph,
        scaledY,
        yShift,
        axis,
        pointY,
        transformLabel,
        axisSymbols,
        expansionX,
        expansionY,
        color,
      });
    });
  };

const resolveAdaptiveLabelStarts = (
  layout: readonly XTickLabelLayout[],
  plotWidth: number,
): Map<number, number[]> => {
  const startsByValue = new Map<number, number[]>();
  const rowCount = Math.max(0, ...layout.map(({ lines }) => lines.length));
  for (let row = 0; row < rowCount; row += 1) {
    const entries = layout.flatMap(({ value, position, lines }) => {
      const line = lines[row];
      if (line === undefined) return [];
      const width = toArray(line).length;
      return [{ value, width, preferred: Math.round(position) - Math.floor((width - 1) / 2) }];
    });
    const totalWidth = entries.reduce((sum, { width }) => sum + width, 0);
    const gap = totalWidth + entries.length - 1 <= plotWidth ? 1 : 0;
    const starts = entries.map(({ preferred, width }) =>
      Math.max(0, Math.min(plotWidth - width, preferred)),
    );

    for (let index = 1; index < entries.length; index += 1) {
      starts[index] = Math.max(starts[index], starts[index - 1] + entries[index - 1].width + gap);
    }
    if (starts.at(-1)! + entries.at(-1)!.width > plotWidth) {
      starts[entries.length - 1] = plotWidth - entries.at(-1)!.width;
      for (let index = entries.length - 2; index >= 0; index -= 1) {
        starts[index] = Math.min(starts[index], starts[index + 1] - entries[index].width - gap);
      }
    }
    entries.forEach(({ value }, index) => {
      const valueStarts = startsByValue.get(value) ?? [];
      valueStarts[row] = starts[index];
      startsByValue.set(value, valueStarts);
    });
  }
  return startsByValue;
};

const drawTickMark = (context: XTickContext, xPosition: number): void => {
  drawXAxisTick({
    debugMode: context.debugMode,
    axis: context.axis,
    xPosition,
    graph: context.graph,
    hideXAxisTicks: context.hideXAxisTicks,
    axisSymbols: context.axisSymbols,
    color: context.color,
  });
};

const drawAdaptiveXAxisLabel = (
  context: XTickContext,
  label: XTickLabelLayout,
  pointX: number,
): void => {
  label.lines.forEach((line, lineIndex) => {
    const cells = toArray(line);
    const row = context.adaptiveLabelRow + lineIndex;
    const start =
      context.adaptiveLabelColumn + context.adaptiveLabelStarts!.get(pointX)![lineIndex];
    cells.forEach((cell, cellIndex) => {
      drawPosition({
        debugMode: context.debugMode,
        graph: context.graph,
        scaledX: start + cellIndex,
        scaledY: row,
        symbol: colorizeSymbol(cell, context.color),
      });
    });
  });
};

const getOccupiedRow = (context: XTickContext, row: number): Set<number> => {
  if (!context.occupiedByRow.has(row)) context.occupiedByRow.set(row, new Set<number>());
  return context.occupiedByRow.get(row)!;
};

const hasXAxisLabelSpace = (
  context: XTickContext,
  cells: string[],
  yPosition: number,
  scaledX: number,
): boolean =>
  cells.every((_, index) =>
    [context.emptySymbol, context.axisSymbols.ns].some((symbol) =>
      isSameSymbol(
        context.graph[yPosition - 1][scaledX + context.yShift - index + 2],
        symbol,
        context.color,
      ),
    ),
  );

const drawLegacyXAxisLabel = (
  context: XTickContext,
  pointX: number,
  scaledX: number,
  tickXPosition: number,
): void => {
  const cells = toArray(
    context.transformLabel(pointX, {
      axis: 'x',
      xRange: context.expansionX,
      yRange: context.expansionY,
    }),
  );
  const yPosition = context.axisCenter ? context.axis.y + 1 : context.graph.length - 1;
  const hasSpace = hasXAxisLabelSpace(context, cells, yPosition, scaledX);
  const targetY = hasSpace ? yPosition - 1 : yPosition;
  const occupied = getOccupiedRow(context, targetY);
  const targetWidth = context.graph[targetY].length;
  const positions = cells.map((_, index) => {
    const rawX = scaledX + context.yShift - index + 2;
    return Math.max(0, Math.min(targetWidth - 1, rawX));
  });
  const hasCollision = !context.axisCenter && positions.some((graphX) => occupied.has(graphX));
  if (!hasCollision) {
    for (let index = 0; index < cells.length; index++) {
      const isOccupied = isSameSymbol(
        context.graph[yPosition - 2][tickXPosition],
        context.axisSymbols.x,
        context.color,
      );
      if (isOccupied) break;
      drawXAxisEnd({
        debugMode: context.debugMode,
        hasPlaceToRender: hasSpace,
        yPos: yPosition,
        graph: context.graph,
        axisCenter: context.axisCenter,
        yShift: context.yShift,
        i: index,
        scaledX,
        hideXAxisTicks: context.hideXAxisTicks,
        pointXShift: cells,
        color: context.color,
      });
    }
    if (!context.axisCenter) positions.forEach((graphX) => occupied.add(graphX));
  }
  drawTickMark(context, tickXPosition);
};

const drawXAxisPoint = (context: XTickContext, pointX: number, coordinate: Point): void => {
  const [scaledX] = toPlot(context.plotWidth, context.plotHeight)(...coordinate);
  const centerOffset = context.axisCenter ? 1 : 2;
  const tickXPosition = scaledX + context.yShift + centerOffset;
  const adaptiveLabel = context.adaptiveLabels.get(pointX);
  if (adaptiveLabel) {
    drawTickMark(context, tickXPosition);
    if (!context.hideXAxisTicks) {
      drawAdaptiveXAxisLabel(context, adaptiveLabel, pointX);
    }
    return;
  }
  drawLegacyXAxisLabel(context, pointX, scaledX, tickXPosition);
};

/**
 * Creates a renderer for collision-aware x-axis tick labels.
 * @param {object} options - Options captured by the x-axis tick renderer.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {boolean} [options.hideXAxisTicks] - Whether x-axis ticks are hidden.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {string} options.emptySymbol - Symbol representing unused graph cells.
 * @param {number} options.yShift - Horizontal shift reserved for y-axis labels.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {MaybePoint} [options.axisCenter] - Optional custom axis intersection.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {Formatter} options.transformLabel - Function used to format axis labels.
 * @param {typeof AXIS} options.axisSymbols - Complete set of axis symbols.
 * @param {number[]} options.expansionX - Expanded x-axis range.
 * @param {number[]} options.expansionY - Expanded y-axis range.
 * @param {XTickLabelLayout[]} [options.xTickLabelLayout] - Resolved label placements.
 * @param {string} [options.labelBackgroundSymbol] - Symbol used behind adaptive labels.
 * @param {Color} [options.color] - ANSI color for X-axis ticks and labels.
 * @returns {function} - Renderer for collision-aware x-axis tick labels.
 */
export const getDrawXAxisTicks = ({
  debugMode,
  hideXAxisTicks,
  plotWidth,
  plotHeight,
  yShift,
  graph,
  axisCenter,
  emptySymbol,
  axisSymbols,
  axis,
  transformLabel,
  expansionX,
  expansionY,
  xTickLabelLayout,
  labelBackgroundSymbol = emptySymbol,
  color,
}: DrawXAxisTicksOptions) => {
  const occupiedByRow = new Map<number, Set<number>>();
  const adaptiveLabels = new Map(xTickLabelLayout?.map((tick) => [tick.value, tick]));
  const adaptiveLabelStarts = xTickLabelLayout
    ? resolveAdaptiveLabelStarts(xTickLabelLayout, plotWidth + 1)
    : undefined;
  const baseLabelRow = graph.length - 1;
  const adaptiveLabelRow = axisCenter ? axis.y + 1 : baseLabelRow;
  const adaptiveLabelColumn = yShift + (axisCenter ? 1 : 2);
  if (xTickLabelLayout) {
    const requiredRows =
      adaptiveLabelRow + Math.max(0, ...xTickLabelLayout.map(({ lines }) => lines.length));
    while (graph.length < requiredRows) {
      graph.push(Array(graph[0].length).fill(labelBackgroundSymbol));
    }
  }

  const context: XTickContext = {
    debugMode,
    hideXAxisTicks,
    plotWidth,
    plotHeight,
    emptySymbol,
    yShift,
    graph,
    axisCenter,
    axis,
    transformLabel,
    axisSymbols,
    expansionX,
    expansionY,
    xTickLabelLayout,
    labelBackgroundSymbol,
    color,
    occupiedByRow,
    adaptiveLabels,
    adaptiveLabelStarts,
    adaptiveLabelRow,
    adaptiveLabelColumn,
  };
  return (points: Point[], resolvedCoords?: Point[]) => {
    const coords =
      resolvedCoords ?? getPlotCoords(points, plotWidth, plotHeight, expansionX, expansionY);
    points.forEach(([pointX], index) => drawXAxisPoint(context, pointX, coords[index]));
  };
};

/**
 * Draws default or custom axis ticks for all input series.
 * @param {object} options - Options for drawing axis ticks.
 * @param {MultiLine} options.input - Complete chart input.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {MaybePoint} [options.axisCenter] - Optional custom axis intersection.
 * @param {number} options.yShift - Horizontal shift reserved for y-axis labels.
 * @param {string} options.emptySymbol - Symbol representing unused graph cells.
 * @param {typeof AXIS} options.axisSymbols - Complete set of axis symbols.
 * @param {boolean} [options.hideYAxis] - Whether the y-axis is hidden.
 * @param {boolean} [options.hideXAxis] - Whether the x-axis is hidden.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {number[]} options.expansionX - Expanded x-axis range.
 * @param {number[]} options.expansionY - Expanded y-axis range.
 * @param {number[]} [options.customYAxisTicks] - Custom y-axis tick values.
 * @param {number[]} [options.customXAxisTicks] - Custom x-axis tick values.
 * @param {boolean} [options.hideYAxisTicks] - Whether y-axis ticks are hidden.
 * @param {boolean} [options.hideXAxisTicks] - Whether x-axis ticks are hidden.
 * @param {boolean} [options.showTickLabel] - Whether evenly spaced tick labels are shown.
 * @param {Formatter} options.transformLabel - Function used to format axis labels.
 * @param {XTickLabelLayout[]} [options.xTickLabelLayout] - Resolved label placements.
 * @param {string} [options.labelBackgroundSymbol] - Symbol used behind adaptive labels.
 * @param {Color} [options.xColor] - ANSI color for X-axis ticks and labels.
 * @param {Color} [options.yColor] - ANSI color for Y-axis ticks and labels.
 */
export const drawTicks = ({
  input,
  graph,
  plotWidth,
  plotHeight,
  axis,
  axisCenter,
  yShift,
  emptySymbol,
  debugMode,
  hideXAxis,
  expansionX,
  expansionY,
  hideYAxis,
  customYAxisTicks,
  customXAxisTicks,
  hideYAxisTicks,
  hideXAxisTicks,
  showTickLabel,
  axisSymbols,
  transformLabel,
  xTickLabelLayout,
  labelBackgroundSymbol,
  xColor,
  yColor,
}: {
  input: MultiLine;
  graph: Graph;
  plotWidth: number;
  plotHeight: number;
  axis: { x: number; y: number };
  axisCenter?: MaybePoint;
  yShift: number;
  emptySymbol: string;
  axisSymbols: typeof AXIS;
  hideYAxis?: boolean;
  hideXAxis?: boolean;
  debugMode?: boolean;
  expansionX: number[];
  expansionY: number[];
  customYAxisTicks?: number[];
  customXAxisTicks?: number[];
  hideYAxisTicks?: boolean;
  hideXAxisTicks?: boolean;
  showTickLabel?: boolean;
  transformLabel: Formatter;
  xTickLabelLayout?: readonly XTickLabelLayout[];
  labelBackgroundSymbol?: string;
  xColor?: Color;
  yColor?: Color;
}) => {
  const [minY, maxY] = [Math.min(...expansionY), Math.max(...expansionY)];
  const [minX, maxX] = [Math.min(...expansionX), Math.max(...expansionX)];

  const drawYAxisTicks = getDrawYAxisTicks({
    axis,
    axisSymbols,
    debugMode,
    expansionX,
    expansionY,
    graph,
    hideYAxisTicks,
    plotHeight,
    plotWidth,
    showTickLabel: showTickLabel && !customYAxisTicks,
    transformLabel,
    yShift,
    color: yColor,
  });

  const drawXAxisTicks = getDrawXAxisTicks({
    axis,
    axisCenter,
    axisSymbols,
    debugMode,
    emptySymbol,
    expansionX,
    expansionY,
    graph,
    hideXAxisTicks,
    plotHeight,
    plotWidth,
    transformLabel,
    yShift,
    xTickLabelLayout,
    labelBackgroundSymbol,
    color: xColor,
  });

  input.forEach((line) => {
    const coords = getPlotCoords(line, plotWidth, plotHeight, expansionX, expansionY);
    line.forEach((point, index) => {
      const pointInput = [point];
      const pointCoords = [coords[index]];
      if (!hideYAxis && !customYAxisTicks) {
        drawYAxisTicks(pointInput, pointCoords);
      }

      if (!hideXAxis && !customXAxisTicks) {
        drawXAxisTicks(pointInput, pointCoords);
      }
    });
  });

  const filteredCustomYAxisTicks = (customYAxisTicks || []).filter((y) => y >= minY && y <= maxY);
  const filteredCustomXAxisTicks = (customXAxisTicks || []).filter((x) => x >= minX && x <= maxX);

  if (filteredCustomYAxisTicks.length && !hideYAxis) {
    drawYAxisTicks(filteredCustomYAxisTicks.map((y) => toPoint(undefined, y)));
  }

  if (filteredCustomXAxisTicks.length && !hideXAxis) {
    drawXAxisTicks(filteredCustomXAxisTicks.map((x) => toPoint(x)));
  }
};
