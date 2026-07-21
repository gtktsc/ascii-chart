import { THRESHOLDS } from '@constants';
import { Graph, GraphPoint, Point, Threshold } from '@types';
import { colorizeSymbol } from '@helpers/colors';
import { getPlotCoords, toPlot } from '@helpers/coordinates';
import { drawPosition } from '@services/plot/draw/position';

import type { ThresholdDrawingContext } from './types';

const drawVerticalThreshold = (
  context: ThresholdDrawingContext,
  threshold: Threshold,
  scaledX: number,
): void => {
  if (typeof threshold.x !== 'number' || !context.graph[0][scaledX]) return;
  for (let row = 0; row < context.graph.length; row++) {
    drawPosition({
      debugMode: context.debugMode,
      graph: context.graph,
      scaledX: scaledX + 1,
      scaledY: row,
      symbol: colorizeSymbol(context.thresholdSymbols.y, threshold.color),
    });
    if (context.priority !== undefined && context.cellPriorities?.[row]) {
      context.cellPriorities[row][scaledX + 1] = context.priority;
    }
  }
};

const drawHorizontalThreshold = (
  context: ThresholdDrawingContext,
  threshold: Threshold,
  scaledY: number,
): void => {
  if (typeof threshold.y !== 'number' || !context.graph[scaledY]) return;
  for (let column = 0; column < context.graph[scaledY].length; column++) {
    drawPosition({
      debugMode: context.debugMode,
      graph: context.graph,
      scaledX: column,
      scaledY: scaledY + 1,
      symbol: colorizeSymbol(context.thresholdSymbols.x, threshold.color),
    });
    if (context.priority !== undefined && context.cellPriorities?.[scaledY + 1]) {
      context.cellPriorities[scaledY + 1][column] = context.priority;
    }
  }
};

/**
 * Adds points.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {GraphPoint[]} options.points - The points.
 * @param {number} options.plotWidth - The plot width.
 * @param {number} options.plotHeight - The plot height.
 * @param {number[]} options.expansionX - The expansion x.
 * @param {number[]} options.expansionY - The expansion y.
 * @param {string} options.pointSymbol - The point symbol.
 * @param {boolean} options.debugMode - The debug mode.
 * @param {number[][]} options.cellPriorities - The cell priorities.
 * @param {number} options.priority - The priority.
 */
export const addPoints = ({
  graph,
  points,
  plotWidth,
  plotHeight,
  expansionX,
  expansionY,
  pointSymbol,
  debugMode,
  cellPriorities,
  priority,
}: {
  graph: Graph;
  points: GraphPoint[];
  plotWidth: number;
  plotHeight: number;
  expansionX: number[];
  expansionY: number[];
  pointSymbol: string;
  debugMode?: boolean;
  cellPriorities?: number[][];
  priority?: number;
}): void => {
  const coordinates = points.map(({ x, y }) => [x, y] as Point);
  const plotCoordinates = getPlotCoords(coordinates, plotWidth, plotHeight, expansionX, expansionY);
  for (let pointIndex = 0; pointIndex < plotCoordinates.length; pointIndex++) {
    const [x, y] = plotCoordinates[pointIndex];
    const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);
    drawPosition({
      debugMode,
      graph,
      scaledX: scaledX + 1,
      scaledY: scaledY + 1,
      symbol: colorizeSymbol(pointSymbol, points[pointIndex]?.color),
    });
    if (priority !== undefined && cellPriorities?.[scaledY + 1]) {
      cellPriorities[scaledY + 1][scaledX + 1] = priority;
    }
  }
};

/**
 * Adds thresholds.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {Threshold[]} options.thresholds - The thresholds.
 * @param {{ x: number; y: number }} options.axis - The axis.
 * @param {number} options.plotWidth - The plot width.
 * @param {number} options.plotHeight - The plot height.
 * @param {number[]} options.expansionX - The expansion x.
 * @param {number[]} options.expansionY - The expansion y.
 * @param {typeof THRESHOLDS} options.thresholdSymbols - The threshold symbols.
 * @param {boolean} options.debugMode - The debug mode.
 * @param {number[][]} options.cellPriorities - The cell priorities.
 * @param {number} options.priority - The priority.
 */
export const addThresholds = ({
  graph,
  thresholds,
  axis,
  plotWidth,
  plotHeight,
  expansionX,
  expansionY,
  thresholdSymbols,
  debugMode,
  cellPriorities,
  priority,
}: {
  graph: Graph;
  thresholds: Threshold[];
  axis: { x: number; y: number };
  plotWidth: number;
  plotHeight: number;
  expansionX: number[];
  expansionY: number[];
  thresholdSymbols: typeof THRESHOLDS;
  debugMode?: boolean;
  cellPriorities?: number[][];
  priority?: number;
}): void => {
  const coordinates = thresholds.map(({ x: thresholdX, y: thresholdY }) => {
    let { x, y } = axis;
    if (typeof thresholdX === 'number') x = thresholdX;
    if (typeof thresholdY === 'number') y = thresholdY;
    return [x, y] as Point;
  });

  const plotCoordinates = getPlotCoords(coordinates, plotWidth, plotHeight, expansionX, expansionY);
  const context: ThresholdDrawingContext = {
    graph,
    thresholdSymbols,
    debugMode,
    cellPriorities,
    priority,
  };
  for (let thresholdIndex = 0; thresholdIndex < plotCoordinates.length; thresholdIndex++) {
    const [x, y] = plotCoordinates[thresholdIndex];
    const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);
    const threshold = thresholds[thresholdIndex];
    drawVerticalThreshold(context, threshold, scaledX);
    drawHorizontalThreshold(context, threshold, scaledY);
  }
};
