import { AXIS, CHART } from '../constants';
import {
  CustomSymbol,
  Formatter,
  Graph,
  LineFormatterArgs,
  MaybePoint,
  MultiLine,
  Point,
  Symbols,
} from '../types';
import { distance, toArray, toEmpty } from './coords';

/**
 * Places a symbol at a specific position on the graph.
 * @param {Object} params - Object containing parameters.
 * @param {Graph} params.graph - The graph matrix where the symbol will be drawn.
 * @param {number} params.scaledX - X-coordinate on the graph (scaled).
 * @param {number} params.scaledY - Y-coordinate on the graph (scaled).
 * @param {string} params.symbol - Symbol to draw on the graph.
 */
export const drawPosition = ({
  graph,
  scaledX,
  scaledY,
  symbol,
  debugMode = false,
}: {
  graph: Graph;
  scaledX: number;
  scaledY: number;
  symbol: string;
  debugMode?: boolean;
}) => {
  if (debugMode) {
    // Handle out-of-bounds for Y
    if (scaledY >= graph.length || scaledY < 0) {
      console.log(`Drawing at [${scaledX}, ${scaledY}]`, 'Error: out of bounds Y', {
        graph,
        scaledX,
        scaledY,
      });
      return;
    }
    // Handle out-of-bounds for X
    if (scaledX >= graph[scaledY].length || scaledX < 0) {
      console.log(`Drawing at [${scaledX}, ${scaledY}]`, 'Error: out of bounds X', {
        graph,
        scaledX,
        scaledY,
      });
      return;
    }
  }

  // Draw the symbol if within bounds
  try {
    graph[scaledY][scaledX] = symbol;
  } catch (error) {
    // Fail silently without logging if debugMode is false
  }
};

/**
 * Draws a tick mark at the end of the X-axis, handling bounds and axis center.
 * @param {Object} params - Configuration options for drawing the X-axis tick.
 * @param {boolean} params.hasPlaceToRender - True if there is enough space to render the tick.
 * @param {Point | [number | undefined, number | undefined]} [params.axisCenter] - Coordinates of the axis center (optional).
 * @param {number} params.yPos - The Y-position of the tick mark.
 * @param {Graph} params.graph - The graph matrix being drawn on.
 * @param {number} params.yShift - The Y-axis shift offset.
 * @param {number} params.i - The current iteration index.
 * @param {number} params.scaledX - The scaled X-position for rendering the tick.
 * @param {number} params.shift - X-axis offset to adjust tick positioning.
 * @param {number} params.signShift - Additional shift based on the sign of the axis.
 * @param {Symbols['axis']} params.axisSymbols - Symbols used for the axis rendering.
 * @param {string[]} params.pointXShift - Array of characters representing the X-axis labels.
 */
export const drawXAxisEnd = ({
  hasPlaceToRender,
  axisCenter,
  yPos,
  graph,
  yShift,
  i,
  scaledX,
  shift,
  signShift,
  axisSymbols,
  pointXShift,
  debugMode,
}: {
  hasPlaceToRender: boolean;
  axisCenter?: Point | [number | undefined, number | undefined];
  yPos: number;
  graph: Graph;
  yShift: number;
  i: number;
  scaledX: number;
  shift: number;
  signShift: number;
  axisSymbols: Symbols['axis'];
  pointXShift: string[];
  debugMode?: boolean;
}) => {
  // Adjusts Y position based on render space and axis center presence
  const yShiftWhenOccupied = hasPlaceToRender ? -1 : 0;
  const yShiftWhenHasAxisCenter = axisCenter && axisCenter[1] !== undefined ? 1 : 0;
  let graphY = yPos + yShiftWhenOccupied + yShiftWhenHasAxisCenter;

  // Ensure graphY stays within valid bounds
  if (graphY < 0) graphY = 0;
  else if (graphY >= graph.length) graphY = graph.length - 1;

  // Adjust X position for rendering the tick
  let graphX = scaledX + yShift - i + 2 + shift;
  if (graphX < 0) graphX = 0;
  else if (graphX >= graph[graphY].length) graphX = graph[graphY].length - 1;

  // Draw the tick label
  drawPosition({
    debugMode,
    graph,
    scaledX: graphX,
    scaledY: graphY,
    symbol: pointXShift[pointXShift.length - 1 - i],
  });

  // If it's the last tick, draw the tick mark
  if (pointXShift.length - 1 === i) {
    const xTickY = yPos + signShift;
    const xTickX = scaledX + yShift + 2 + shift;
    if (xTickY >= 0 && xTickY < graph.length && xTickX >= 0 && xTickX < graph[xTickY].length) {
      drawPosition({
        debugMode,
        graph,
        scaledX: xTickX,
        scaledY: xTickY,
        symbol: axisSymbols?.x || AXIS.x,
      });
    }
  }
};

/**
 * Draws tick marks for the Y-axis based on axis configurations and scales.
 * @param {Object} params - Configuration options for drawing the Y-axis ticks.
 * @param {Graph} params.graph - The graph matrix.
 * @param {number} params.scaledY - Scaled Y-coordinate.
 * @param {number} params.yShift - Shift applied to the Y-axis.
 * @param {Object} params.axis - Object defining the axis position.
 * @param {MaybePoint} [params.axisCenter] - Optional axis center coordinates.
 * @param {number} params.pointY - The actual Y-coordinate of the point.
 * @param {Formatter} params.transformLabel - Function to format the label for the Y-axis.
 * @param {Symbols['axis']} params.axisSymbols - Symbols used for drawing the axis.
 * @param {number[]} params.expansionX - Array of X-axis expansion factors.
 * @param {number[]} params.expansionY - Array of Y-axis expansion factors.
 * @param {number} params.plotHeight - The height of the plot.
 * @param {boolean} [params.showTickLabel] - If true, displays tick labels for all points.
 */
export const drawYAxisEnd = ({
  graph,
  scaledY,
  yShift,
  axis,
  axisCenter,
  pointY,
  transformLabel,
  axisSymbols,
  expansionX,
  expansionY,
  plotHeight,
  showTickLabel,
  debugMode,
}: {
  graph: Graph;
  scaledY: number;
  yShift: number;
  plotHeight: number;
  axis: { x: number; y: number };
  axisCenter?: MaybePoint;
  pointY: number;
  transformLabel: Formatter;
  axisSymbols: Symbols['axis'];
  expansionX: number[];
  expansionY: number[];
  showTickLabel?: boolean;
  debugMode?: boolean;
}) => {
  if (showTickLabel) {
    const yMax = Math.max(...expansionY);
    const yMin = Math.min(...expansionY);
    const numTicks = plotHeight;
    const yStep = (yMax - yMin) / numTicks;

    // Draw ticks for each label
    for (let i = 0; i <= numTicks; i++) {
      const yValue = Math.round(yMax - i * yStep); // Ensure whole numbers
      const scaledYPos = ((yMax - yValue) / (yMax - yMin)) * (plotHeight - 1);
      const graphYPos = Math.floor(scaledYPos) + 1;

      // Ensure the Y position is within bounds
      if (graphYPos >= 0 && graphYPos < graph.length) {
        const pointYShift = toArray(
          transformLabel(yValue, { axis: 'y', xRange: expansionX, yRange: expansionY }),
        );
        for (let j = 0; j < pointYShift.length; j++) {
          const colIndex = axis.x + yShift - j;
          if (colIndex >= 0 && colIndex < graph[graphYPos].length) {
            drawPosition({
              debugMode,
              graph,
              scaledX: colIndex,
              scaledY: graphYPos,
              symbol: pointYShift[pointYShift.length - 1 - j],
            });
          }
        }
        const tickMarkIndex = axis.x + yShift + 1;
        if (tickMarkIndex >= 0 && tickMarkIndex < graph[graphYPos].length) {
          drawPosition({
            debugMode,
            graph,
            scaledX: tickMarkIndex,
            scaledY: graphYPos,
            symbol: axisSymbols?.y || AXIS.y,
          });
        }
      }
    }
    return;
  }

  // Render ticks for specific data values
  if (graph[scaledY + 1][axis.x + yShift + 1] !== axisSymbols?.y) {
    const pointYShift = toArray(
      transformLabel(pointY, { axis: 'y', xRange: expansionX, yRange: expansionY }),
    );
    for (let i = 0; i < pointYShift.length; i++) {
      drawPosition({
        debugMode,
        graph,
        scaledX: axis.x + yShift - i,
        scaledY: scaledY + 1,
        symbol: pointYShift[pointYShift.length - 1 - i],
      });
    }
    drawPosition({
      debugMode,
      graph,
      scaledX: axis.x + yShift + 1,
      scaledY: scaledY + 1,
      symbol: axisSymbols?.y || AXIS.y,
    });
  }
};

/**
 * Draws both X and Y axes on the graph according to visibility and center configurations.
 * @param {Object} params - Configuration options for drawing axes.
 * @param {Graph} params.graph - The graph matrix.
 * @param {boolean} [params.hideXAxis] - If true, hides the X-axis.
 * @param {boolean} [params.hideYAxis] - If true, hides the Y-axis.
 * @param {MaybePoint} [params.axisCenter] - Optional axis center coordinates.
 * @param {Symbols['axis']} params.axisSymbols - Symbols used for axis rendering.
 * @param {Object} params.axis - Object defining the axis position (x and y coordinates).
 */
export const drawAxis = ({
  graph,
  hideXAxis,
  hideYAxis,
  axisCenter,
  axisSymbols,
  axis,
  debugMode,
}: {
  graph: Graph;
  axis: { x: number; y: number };
  hideXAxis?: boolean;
  axisCenter?: MaybePoint;
  hideYAxis?: boolean;
  axisSymbols: Symbols['axis'];
  debugMode?: boolean;
}) => {
  graph.forEach((line, index) => {
    line.forEach((_, curr) => {
      let lineChar = '';

      if (curr === axis.x && !hideYAxis) {
        if (index === 0) {
          lineChar = axisSymbols?.n || AXIS.n;
        } else if (index === graph.length - 1 && !axisCenter && !(hideYAxis || hideXAxis)) {
          lineChar = axisSymbols?.nse || AXIS.nse;
        } else {
          lineChar = axisSymbols?.ns || AXIS.ns;
        }
      } else if (index === axis.y && !hideXAxis) {
        if (curr === line.length - 1) {
          lineChar = axisSymbols?.e || AXIS.e;
        } else {
          lineChar = axisSymbols?.we || AXIS.we;
        }
      }

      if (lineChar) {
        drawPosition({ debugMode, graph, scaledX: curr, scaledY: index, symbol: lineChar });
      }
    });
  });
};

/**
 * Initializes an empty graph based on plot dimensions and a given symbol.
 * @param {Object} params - Configuration options for the graph.
 * @param {number} params.plotWidth - Width of the plot area.
 * @param {number} params.plotHeight - Height of the plot area.
 * @param {string} params.emptySymbol - Symbol used to fill empty cells.
 * @returns {Graph} - An initialized empty graph matrix.
 */
export const drawGraph = ({
  plotWidth,
  plotHeight,
  emptySymbol,
}: {
  plotWidth: number;
  plotHeight: number;
  emptySymbol: string;
}) => {
  const callback = () => toEmpty(plotWidth + 2, emptySymbol);
  return Array.from({ length: plotHeight + 2 }, callback);
};

/**
 * Renders the graph into a string format for output.
 * @param {Object} params - Configuration options for rendering the graph.
 * @param {Graph} params.graph - The graph matrix to render.
 * @returns {string} - The rendered graph as a string.
 */
export const drawChart = ({ graph }: { graph: Graph }) =>
  `\n${graph.map((line) => line.join('')).join('\n')}\n`;

/**
 * Renders a custom line on the graph based on formatter specifications.
 * @param {Object} params - Configuration options for rendering custom lines.
 * @param {Point[]} params.sortedCoords - Sorted list of coordinates.
 * @param {number} params.scaledX - X-axis scaling.
 * @param {number} params.scaledY - Y-axis scaling.
 * @param {number} params.minY - Minimum Y value.
 * @param {number} params.minX - Minimum X value.
 * @param {MultiLine} params.input - Input data points.
 * @param {number[]} params.expansionX - X-axis expansion range.
 * @param {number[]} params.expansionY - Y-axis expansion range.
 * @param {function} params.toPlotCoordinates - Function to convert coordinates to plot positions.
 * @param {number} params.index - Current index in the coordinate array.
 * @param {function} params.lineFormatter - Custom function for line formatting.
 * @param {Graph} params.graph - The graph matrix to modify.
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
    customSymbols.forEach(({ x: symbolX, y: symbolY, symbol }: CustomSymbol) => {
      drawPosition({ debugMode, graph, scaledX: symbolX, scaledY: symbolY, symbol });
    });
  } else {
    drawPosition({
      debugMode,
      graph,
      scaledX: customSymbols.x,
      scaledY: customSymbols.y,
      symbol: customSymbols.symbol,
    });
  }
};

/**
 * Renders a line between two points on the graph using defined chart symbols.
 * @param {Object} params - Configuration options for drawing a line.
 * @param {number} params.index - Current index in the coordinate array.
 * @param {Point[]} params.arr - List of points for the line.
 * @param {Graph} params.graph - The graph matrix to modify.
 * @param {number} params.scaledX - X-axis scaling.
 * @param {number} params.scaledY - Y-axis scaling.
 * @param {boolean} params.horizontalBarChart - Whether to fill the width of the bars.
 * @param {boolean} params.barChart - Whether to fill the width of the bars.
 * @param {number} params.plotHeight - Height of the plot area.
 * @param {string} params.emptySymbol - Symbol used to fill empty cells.
 * @param {Object} params.axis - Axis position.
 * @param {MaybePoint} axisCenter - Axis position selected by user.
 * @param {Symbols['chart']} params.chartSymbols - Symbols used for chart rendering.
 */
export const drawLine = ({
  index,
  arr,
  graph,
  scaledX,
  scaledY,
  plotHeight,
  emptySymbol,
  chartSymbols,
  horizontalBarChart,
  barChart,
  axisCenter,
  debugMode,
  axis,
}: {
  index: number;
  arr: Point[];
  graph: Graph;
  scaledX: number;
  scaledY: number;
  plotHeight: number;
  emptySymbol: string;
  chartSymbols: Symbols['chart'];
  horizontalBarChart?: boolean;
  barChart?: boolean;
  axisCenter: MaybePoint;
  axis: { x: number; y: number };
  debugMode?: boolean;
}) => {
  const [currX, currY] = arr[index];
  if (barChart || horizontalBarChart) {
    const positions: [number, number][] = [];
    const axisCenterShift = axisCenter ? 0 : 1;
    // For vertical bar chart
    if (barChart) {
      let i;
      // Check if the value is positive or negative
      if (scaledY >= axis.y) {
        // For positive values, draw from the value down to the axis
        i = scaledY;
        while (i >= axis.y) {
          positions.push([i, scaledX + axisCenterShift]);
          i -= 1;
        }
      } else {
        // For negative values, draw from the value up to the axis
        i = scaledY;
        while (i <= axis.y) {
          positions.push([i, scaledX + axisCenterShift]);
          i += 1;
        }
      }
    }

    // For horizontal bar chart
    if (horizontalBarChart) {
      let i;
      if (scaledX >= axis.x) {
        // For positive values, draw rightward from the value to the axis
        i = scaledX;
        while (i >= axis.x) {
          positions.push([scaledY + 1, i]);
          i -= 1;
        }
      } else {
        // For negative values, draw leftward from the value to the axis
        i = scaledX;
        while (i <= axis.x) {
          positions.push([scaledY + 1, i]);
          i += 1;
        }
      }
    }

    // Draw all calculated positions
    positions.forEach(([y, x]) => {
      drawPosition({
        debugMode,
        graph,
        scaledX: x,
        scaledY: y,
        symbol: chartSymbols?.area || CHART.area,
      });
    });

    return;
  }

  if (index - 1 >= 0) {
    const [prevX, prevY] = arr[index - 1];
    Array(distance(currY, prevY))
      .fill('')
      .forEach((_, steps, array) => {
        if (Math.round(prevY) > Math.round(currY)) {
          drawPosition({
            debugMode,
            graph,
            scaledX,
            scaledY: scaledY + 1,
            symbol: chartSymbols?.nse || CHART.nse,
          });
          if (steps === array.length - 1) {
            drawPosition({
              debugMode,
              graph,
              scaledX,
              scaledY: scaledY - steps,
              symbol: chartSymbols?.wns || CHART.wns,
            });
          } else {
            drawPosition({
              debugMode,
              graph,
              scaledX,
              scaledY: scaledY - steps,
              symbol: chartSymbols?.ns || CHART.ns,
            });
          }
        } else {
          drawPosition({
            debugMode,
            graph,
            scaledX,
            scaledY: scaledY + steps + 2,
            symbol: chartSymbols?.wsn || CHART.wsn,
          });

          drawPosition({
            debugMode,
            graph,
            scaledX,
            scaledY: scaledY + steps + 1,
            symbol: chartSymbols?.ns || CHART.ns,
          });
        }
      });

    if (Math.round(prevY) < Math.round(currY)) {
      drawPosition({
        debugMode,
        graph,
        scaledX,
        scaledY: scaledY + 1,
        symbol: chartSymbols?.sne || CHART.sne,
      });
    } else if (Math.round(prevY) === Math.round(currY)) {
      if (graph[scaledY + 1][scaledX] === emptySymbol) {
        drawPosition({
          debugMode,
          graph,
          scaledX,
          scaledY: scaledY + 1,
          symbol: chartSymbols?.we || CHART.we,
        });
      }
    }

    const distanceX = distance(currX, prevX);
    Array(distanceX ? distanceX - 1 : 0)
      .fill('')
      .forEach((_, steps) => {
        const thisY = plotHeight - Math.round(prevY);
        drawPosition({
          debugMode,
          graph,
          scaledX: Math.round(prevX) + steps + 1,
          scaledY: thisY,
          symbol: chartSymbols?.we || CHART.we,
        });
      });
  }

  if (arr.length - 1 === index) {
    drawPosition({
      debugMode,
      graph,
      scaledX: scaledX + 1,
      scaledY: scaledY + 1,
      symbol: chartSymbols?.we || CHART.we,
    });
  }
};

/**
 * Applies shifts to the graph and adjusts empty symbols and scaling factors.
 * @param {Object} params - Configuration options for applying shifts.
 * @param {Graph} params.graph - The graph matrix.
 * @param {number} params.plotWidth - The width of the plot area.
 * @param {string} params.emptySymbol - The symbol used to fill empty cells.
 * @param {number[][]} params.scaledCoords - Scaled coordinates for shifting.
 * @param {number} params.xShift - X-axis shift offset.
 * @param {number} params.yShift - Y-axis shift offset.
 * @returns {Object} - An object indicating if the graph needs to be moved.
 */
export const drawShift = ({
  graph,
  plotWidth,
  emptySymbol,
  scaledCoords,
  xShift,
  yShift,
}: {
  graph: Graph;
  plotWidth: number;
  emptySymbol: string;
  scaledCoords: number[][];
  xShift: number;
  yShift: number;
}) => {
  graph.push(toEmpty(plotWidth + 2, emptySymbol)); // bottom shift

  let step = plotWidth;
  scaledCoords.forEach(([x], index) => {
    if (scaledCoords[index - 1]) {
      const current = x - scaledCoords[index - 1][0];
      step = current <= step ? current : step;
    }
  });

  // x coords overlap
  const hasToBeMoved = step < xShift;
  if (hasToBeMoved) graph.push(toEmpty(plotWidth + 1, emptySymbol));

  graph.forEach((line) => {
    for (let i = 0; i <= yShift; i += 1) {
      line.unshift(emptySymbol); // left shift
    }
  });
  return { hasToBeMoved };
};
