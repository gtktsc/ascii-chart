import { AXIS, CHART, POINT } from '../constants';
import {
  CustomSymbol,
  Formatter,
  Graph,
  GraphMode,
  LineFormatterArgs,
  MaybePoint,
  MultiLine,
  Point,
  Symbols,
} from '../types';
import { distance, getPlotCoords, toArray, toEmpty, toPlot, toPoint } from './coords';

/**
 * Places a symbol at a specific position on the graph.
 * @param {Object} params - Object containing parameters.
 * @param {Graph} params.graph - The graph matrix where the symbol will be drawn.
 * @param {number} params.scaledX - X-coordinate on the graph (scaled).
 * @param {number} params.scaledY - Y-coordinate on the graph (scaled).
 * @param {string} params.symbol - Symbol to draw on the graph.
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
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
 * @param {boolean} [params.hideXAxisTicks] - If true, hides the X-axis ticks.
 * @param {number} params.signShift - Additional shift based on the sign of the axis.
 * @param {Symbols['axis']} params.axisSymbols - Symbols used for the axis rendering.
 * @param {string[]} params.pointXShift - Array of characters representing the X-axis labels.
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
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
}) => {
  if (hideXAxisTicks) {
    return;
  }

  // Adjusts Y position based on render space and axis center presence
  const yShiftWhenOccupied = hasPlaceToRender ? -1 : 0;
  const yShiftWhenHasAxisCenter = 0;

  let graphY = yPos + yShiftWhenOccupied + yShiftWhenHasAxisCenter;

  // Ensure graphY stays within valid bounds
  if (graphY < 0) graphY = 0;
  else if (graphY >= graph.length) graphY = graph.length - 1;

  // Adjust X position for rendering the tick
  let graphX = scaledX + yShift - i + (axisCenter ? 1 : 2);
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
};

export const drawXAxisTick = ({
  graph,
  xPosition,
  hideXAxisTicks,
  axisSymbols,
  debugMode,
  axis,
}: {
  axis: { x: number; y: number };
  graph: Graph;
  hideXAxisTicks?: boolean;
  xPosition: number;
  axisSymbols: Symbols['axis'];
  debugMode?: boolean;
}) => {
  if (hideXAxisTicks) {
    return;
  }

  if (
    graph[axis.y][xPosition] === axisSymbols?.ns ||
    graph[axis.y][xPosition] === axisSymbols?.we
  ) {
    drawPosition({
      debugMode,
      graph,
      scaledX: xPosition,
      scaledY: axis.y,
      symbol: axisSymbols?.x || AXIS.x,
    });
  }
};

/**
 * Draws tick marks for the Y-axis based on axis configurations and scales.
 * @param {Object} params - Configuration options for drawing the Y-axis ticks.
 * @param {Graph} params.graph - The graph matrix.
 * @param {number} params.scaledY - Scaled Y-coordinate.
 * @param {number} params.yShift - Shift applied to the Y-axis.
 * @param {Object} params.axis - Object defining the axis position.
 * @param {number} params.pointY - The actual Y-coordinate of the point.
 * @param {Formatter} params.transformLabel - Function to format the label for the Y-axis.
 * @param {Symbols['axis']} params.axisSymbols - Symbols used for drawing the axis.
 * @param {number[]} params.expansionX - Array of X-axis expansion factors.
 * @param {number[]} params.expansionY - Array of Y-axis expansion factors.
 * @param {number} params.plotHeight - The height of the plot.
 * @param {boolean} [params.showTickLabel] - If true, displays tick labels for all points.
 * @param {number} params.axis.x - X-position of the Y-axis on the graph.
 * @param {number} params.axis.y - Y-position of the X-axis on the graph.
 * @param {boolean} [params.hideYAxisTicks] - If true, hides Y-axis ticks.
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
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
}: {
  graph: Graph;
  scaledY: number;
  yShift: number;
  plotHeight: number;
  axis: { x: number; y: number };
  pointY: number;
  transformLabel: Formatter;
  axisSymbols: Symbols['axis'];
  expansionX: number[];
  expansionY: number[];
  hideYAxisTicks?: boolean;
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
          if (
            graph[graphYPos][tickMarkIndex] === axisSymbols?.ns ||
            graph[graphYPos][tickMarkIndex] === axisSymbols?.we
          ) {
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
    }
    return;
  }

  if (hideYAxisTicks) {
    return;
  }

  // make sure that values are within bounds
  const row = scaledY + 1;
  const col = axis.x + yShift + 1;

  // Render ticks for specific data values
  if (
    row >= 0 &&
    row < graph.length &&
    col >= 0 &&
    graph[row] &&
    col < graph[row].length &&
    graph[row][col] !== axisSymbols?.y
  ) {
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
    if (
      graph[scaledY + 1][axis.x + yShift + 1] === axisSymbols?.ns ||
      graph[scaledY + 1][axis.x + yShift + 1] === axisSymbols?.we
    ) {
      drawPosition({
        debugMode,
        graph,
        scaledX: axis.x + yShift + 1,
        scaledY: scaledY + 1,
        symbol: axisSymbols?.y || AXIS.y,
      });
    }
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
 * @param {number} params.axis.x - X-position of the Y-axis on the graph.
 * @param {number} params.axis.y - Y-position of the X-axis on the graph.
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
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
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
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
 * @param {number} params.plotHeight - Height of the plot area.
 * @param {string} params.emptySymbol - Symbol used to fill empty cells.
 * @param {Object} params.axis - Axis position.
 * @param {Symbols['chart']} params.chartSymbols - Symbols used for chart rendering.
 * @param {MaybePoint} params.axisCenter - Axis position selected by user.
 * @param {number} params.axis.x - X-position of the Y-axis on the graph.
 * @param {number} params.axis.y - Y-position of the X-axis on the graph.
 * @param {string} params.mode - Graph mode (e.g., 'line', 'point').
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
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
  axisCenter,
  debugMode,
  axis,
  mode,
}: {
  index: number;
  arr: Point[];
  graph: Graph;
  scaledX: number;
  scaledY: number;
  plotHeight: number;
  emptySymbol: string;
  chartSymbols: Symbols['chart'];
  axisCenter: MaybePoint;
  axis: { x: number; y: number };
  debugMode?: boolean;
  mode: GraphMode;
}) => {
  const [currX, currY] = arr[index];
  if (mode === 'bar' || mode === 'horizontalBar') {
    const positions: [number, number][] = [];
    const axisCenterShift = axisCenter ? 0 : 1;
    // For vertical bar chart
    if (mode === 'bar') {
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
    if (mode === 'horizontalBar') {
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

  if (mode === 'point') {
    drawPosition({
      debugMode,
      graph,
      scaledX: scaledX + 1,
      scaledY: scaledY + 1,
      symbol: POINT,
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
  let realYShift = 0;
  graph.push(toEmpty(plotWidth + 2, emptySymbol)); // bottom shift
  realYShift += 1;

  let step = plotWidth;
  scaledCoords.forEach(([x], index) => {
    if (scaledCoords[index - 1]) {
      const current = x - scaledCoords[index - 1][0];
      step = current <= step ? current : step;
    }
  });

  const hasToBeMoved = step < xShift;
  if (hasToBeMoved) {
    realYShift += 1;
    graph.push(toEmpty(plotWidth + 1, emptySymbol));
  }

  const realXShift = yShift + 1;

  graph.forEach((line) => {
    for (let i = 0; i <= yShift; i++) {
      line.unshift(emptySymbol);
    }
  });

  return { hasToBeMoved, realYShift, realXShift };
};

/**
 * Draws ticks on the Y-axis based on axis configurations and scaling.
 * @param {Object} params - Configuration options for drawing the Y-axis ticks.
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
 * @param {boolean} [params.showTickLabel] - If true, shows tick labels for all points.
 * @param {boolean} [params.hideYAxisTicks] - If true, hides the Y-axis ticks.
 * @param {number} params.plotHeight - The height of the plot area.
 * @param {Graph} params.graph - The graph matrix.
 * @param {number} params.plotWidth - The width of the plot area.
 * @param {number} params.yShift - Shift applied to the Y-axis.
 * @param {Object} params.axis - Object defining the axis position.
 * @param {number} params.axis.x - X-position of the Y-axis on the graph.
 * @param {number} params.axis.y - Y-position of the X-axis on the graph.
 * @param {function} params.transformLabel - Function to format the label for the ticks.
 * @param {Symbols['axis']} params.axisSymbols - Symbols used for axis rendering.
 * @param {number[]} params.expansionX - X-axis expansion range.
 * @param {number[]} params.expansionY - Y-axis expansion range.
 * @returns {Void} - Applies the drawing of Y-axis ticks.
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
    axisSymbols: Symbols['axis'];
    expansionX: number[];
    expansionY: number[];
  }) =>
  (points: Point[]) => {
    const coords = getPlotCoords(points, plotWidth, plotHeight, expansionX, expansionY);
    points.forEach(([_, pointY], i) => {
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
      });
    });
  };

/**
 * Draws ticks on the X-axis based on axis configurations and scaling.
 * @param {Object} params - Configuration options for drawing the X-axis ticks.
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
 * @param {boolean} [params.hideXAxisTicks] - If true, hides the X-axis ticks.
 * @param {number} params.plotWidth - The width of the plot area.
 * @param {number} params.plotHeight - The height of the plot area.
 * @param {number} params.yShift - Shift applied to the Y-axis.
 * @param {Graph} params.graph - The graph matrix.
 * @param {MaybePoint} [params.axisCenter] - Optional axis center coordinates.
 * @param {string} params.emptySymbol - Symbol used to fill empty cells.
 * @param {Point[]} params.points - List of points for the X-axis.
 * @param {Symbols['axis']} params.axisSymbols - Symbols used for axis rendering.
 * @param {boolean} [params.hasToBeMoved] - If true, indicates that the graph needs to be moved.
 * @param {Object} params.axis - Object defining the axis position.
 * @param {number} params.axis.x - X-position of the Y-axis on the graph.
 * @param {number} params.axis.y - Y-position of the X-axis on the graph.
 * @param {function} params.transformLabel - Function to format the label for the ticks.
 * @param {number[]} params.expansionX - X-axis expansion range.
 * @param {number[]} params.expansionY - Y-axis expansion range.
 * @param {boolean} [params.hideXAxis] - If true, hides the X-axis.
 * @returns {Void} - Applies the drawing of X-axis ticks.
 */
export const getDrawXAxisTicks =
  ({
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
  }: {
    debugMode?: boolean;
    hideXAxisTicks?: boolean;
    plotWidth: number;
    plotHeight: number;
    emptySymbol: string;
    yShift: number;
    graph: Graph;
    axisCenter?: MaybePoint;
    axis: { x: number; y: number };
    transformLabel: Formatter;
    axisSymbols: typeof AXIS;
    expansionX: number[];
    expansionY: number[];
  }) =>
  (points: Point[]) => {
    const coords = getPlotCoords(points, plotWidth, plotHeight, expansionX, expansionY);
    points.forEach(([pointX], i) => {
      const [x, y] = coords[i];
      const [scaledX] = toPlot(plotWidth, plotHeight)(x, y);
      const pointXShift = toArray(
        transformLabel(pointX, { axis: 'x', xRange: expansionX, yRange: expansionY }),
      );
      const yPos = axisCenter ? axis.y + 1 : graph.length - 1;

      const tickXPosition = scaledX + yShift + (axisCenter ? 1 : 2);

      const hasPlaceToRender = pointXShift.every((_, j) =>
        [emptySymbol, axisSymbols.ns].includes(graph[yPos - 1][scaledX + yShift - j + 2]),
      );

      for (let j = 0; j < pointXShift.length; j++) {
        const isOccupied = graph[yPos - 2][tickXPosition] === axisSymbols.x;

        if (isOccupied) break;

        drawXAxisEnd({
          debugMode,
          hasPlaceToRender,
          yPos,
          graph,
          axisCenter,
          yShift,
          i: j,
          scaledX,
          hideXAxisTicks,
          pointXShift,
        });
      }

      drawXAxisTick({
        debugMode,
        axis,
        xPosition: tickXPosition,
        graph,
        hideXAxisTicks,
        axisSymbols,
      });
    });
  };

/**
 * Draws ticks on the graph based on the provided configuration.
 * @param {Object} params - Configuration options for drawing ticks.
 * @param {MultiLine} params.input - Input data points.
 * @param {Graph} params.graph - The graph matrix.
 * @param {number} params.plotWidth - The width of the plot area.
 * @param {number} params.plotHeight - The height of the plot area.
 * @param {Object} params.axis - Object defining the axis position.
 * @param {number} params.axis.x - X-position of the Y-axis on the graph.
 * @param {number} params.axis.y - Y-position of the X-axis on the graph.
 * @param {MaybePoint} [params.axisCenter] - Optional axis center coordinates.
 * @param {number} params.yShift - Shift applied to the Y-axis.
 * @param {string} params.emptySymbol - Symbol used to fill empty cells.
 * @param {boolean} [params.debugMode=false] - If true, logs errors for out-of-bounds access.
 * @param {boolean} [params.hideXAxis] - If true, hides the X-axis.
 * @param {boolean} [params.hideYAxis] - If true, hides the Y-axis.
 * @param {number[]} params.expansionX - X-axis expansion range.
 * @param {number[]} params.expansionY - Y-axis expansion range.
 * @param {number[]} [params.customYAxisTicks] - Custom Y-axis ticks.
 * @param {number[]} [params.customXAxisTicks] - Custom X-axis ticks.
 * @param {boolean} [params.hideYAxisTicks] - If true, hides Y-axis ticks.
 * @param {boolean} [params.hideXAxisTicks] - If true, hides X-axis ticks.
 * @param {boolean} [params.showTickLabel] - If true, displays tick labels for all points.
 * @param {function} params.transformLabel - Function to format the label for the ticks.
 * @param {Symbols['axis']} params.axisSymbols - Symbols used for axis rendering.
 * @param {boolean} [params.hasToBeMoved] - If true, indicates that the graph needs to be moved.
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
}) => {
  const [minY, maxY] = [Math.min(...expansionY), Math.max(...expansionY)];
  const [minX, maxX] = [Math.min(...expansionX), Math.max(...expansionX)];

  // draw ticks
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
    showTickLabel,
    transformLabel,
    yShift,
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
  });

  // Main ticks logic
  input.forEach((line) => {
    line.forEach(([pointX, pointY]) => {
      if (!hideYAxis && !customYAxisTicks) {
        drawYAxisTicks([[pointX, pointY]]);
      }

      if (!hideXAxis && !customXAxisTicks) {
        drawXAxisTicks([[pointX, pointY]]);
      }
    });
  });

  // if outside the bounds, do not draw
  const filteredCustomYAxisTicks = (customYAxisTicks || []).filter((y) => y >= minY && y <= maxY);
  const filteredCustomXAxisTicks = (customXAxisTicks || []).filter((x) => x >= minX && x <= maxX);

  if (filteredCustomYAxisTicks.length && !hideYAxis) {
    drawYAxisTicks(filteredCustomYAxisTicks.map((y) => toPoint(undefined, y)));
  }

  if (filteredCustomXAxisTicks.length && !hideXAxis) {
    drawXAxisTicks(filteredCustomXAxisTicks.map((x) => toPoint(x)));
  }
};

export const drawAxisCenter = ({
  graph,
  realXShift,
  axis,
  debugMode,
  axisSymbols,
  emptySymbol,
  backgroundSymbol,
}: {
  graph: Graph;
  axis: { x: number; y: number };
  realXShift: number;
  axisSymbols: typeof AXIS;
  debugMode?: boolean;
  emptySymbol: string;
  backgroundSymbol: string;
}) => {
  const positionX = axis.x + realXShift;
  const positionY = axis.y;

  graph.forEach((line, indexY) => {
    line.forEach((_, indexX) => {
      if (indexX === positionX && indexY === positionY) {
        let symbol = axisSymbols.nse;

        const get = (x: number, y: number) => graph[y]?.[x];

        const isEmpty = (value: string) =>
          !Object.values(axisSymbols).includes(value) ||
          value === backgroundSymbol ||
          value === emptySymbol;

        const emptyOnLeft = isEmpty(get(indexX - 1, indexY));
        const emptyOnBottom = isEmpty(get(indexX, indexY + 1));
        const emptyOnRight = isEmpty(get(indexX + 1, indexY));
        const emptyOnTop = isEmpty(get(indexX, indexY - 1));

        if (emptyOnLeft && emptyOnRight && !emptyOnBottom && !emptyOnTop) {
          symbol = axisSymbols.ns;
        } else if (emptyOnLeft && !emptyOnTop && !emptyOnBottom && !emptyOnRight) {
          symbol = axisSymbols.intersectionY;
        } else if (!emptyOnBottom && !emptyOnLeft && !emptyOnTop && !emptyOnRight) {
          symbol = axisSymbols.intersectionXY;
        } else if (emptyOnLeft && emptyOnTop && !emptyOnRight && emptyOnBottom) {
          symbol = axisSymbols.we;
        } else if (emptyOnLeft && emptyOnBottom && emptyOnRight && !emptyOnTop) {
          symbol = axisSymbols.ns;
        }

        // empty on all sides, do not draw
        if (emptyOnBottom && emptyOnLeft && emptyOnRight && emptyOnTop) {
          return;
        }

        drawPosition({
          graph,
          scaledX: indexX,
          scaledY: indexY,
          symbol,
          debugMode,
        });
      }
    });
  });
};
