import { AXIS, CHART } from '../constants';
import { CustomSymbol, Formatter, Graph, MaybePoint, MultiLine, Point, Symbols } from '../types';
import { distance, toArray, toEmpty } from './coords';

/**
 * Draws an X-axis tick mark at the end of each label.
 * @param {object} options - Configuration options.
 * @param {boolean} options.hasPlaceToRender - Indicates if there is space available for rendering.
 * @param {Point | [number | undefined, number | undefined]} [options.axisCenter] - Optional axis center coordinates.
 * @param {number} options.yPos - Y position for the axis tick.
 * @param {Graph} options.graph - The graph array where ticks will be rendered.
 * @param {number} options.yShift - Y-axis shift offset.
 * @param {number} options.i - Current index for iteration.
 * @param {number} options.scaledX - Scaled X position for the tick.
 * @param {number} options.shift - X-axis shift offset.
 * @param {number} options.signShift - Sign shift adjustment.
 * @param {Symbols['axis']} options.axisSymbols - Symbols used for the axis.
 * @param {string[]} options.pointXShift - Shifted X-axis points for tick display.
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
}) => {
  const yShiftWhenOccupied = hasPlaceToRender ? -1 : 0;
  const yShiftWhenHasAxisCenter = axisCenter && axisCenter[1] !== undefined ? 1 : 0;

  let graphY = yPos + yShiftWhenOccupied + yShiftWhenHasAxisCenter;

  // Boundary check
  if (graphY < 0) {
    graphY = 0;
  } else if (graphY >= graph.length) {
    graphY = graph.length - 1;
  }

  let graphX = scaledX + yShift - i + 2 + shift;

  // Ensure graphX is within bounds
  if (graphX < 0) {
    graphX = 0;
  } else if (graphX >= graph[graphY].length) {
    graphX = graph[graphY].length - 1;
  }

  graph[graphY][graphX] = pointXShift[pointXShift.length - 1 - i];

  // Add tick mark only for the last value in the X-axis
  if (pointXShift.length - 1 === i) {
    const xTickY = yPos + signShift;
    const xTickX = scaledX + yShift + 2 + shift;

    if (xTickY >= 0 && xTickY < graph.length && xTickX >= 0 && xTickX < graph[xTickY].length) {
      graph[xTickY][xTickX] = axisSymbols?.x || AXIS.x;
    }
  }
};

/**
 * Draws Y-axis tick marks based on scale and axis configurations.
 * @param {object} options - Configuration options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {number} options.scaledY - Scaled Y position for the tick.
 * @param {number} options.yShift - Y-axis shift offset.
 * @param {object} options.axis - The axis position.
 * @param {MaybePoint} [options.axisCenter] - Optional axis center coordinates.
 * @param {number} options.pointY - Y-coordinate for the current point.
 * @param {Formatter} options.transformLabel - Label transformation function.
 * @param {Symbols['axis']} options.axisSymbols - Symbols used for the axis.
 * @param {number[]} options.expansionX - X-axis expansion range.
 * @param {number[]} options.expansionY - Y-axis expansion range.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {boolean} [options.showTickLabel] - Whether to display all tick labels.
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
}) => {
  // Render all tick labels if showTickLabel is true
  if (showTickLabel) {
    const yMax = Math.max(...expansionY);
    const yMin = Math.min(...expansionY);
    const numTicks = plotHeight;
    const yStep = (yMax - yMin) / numTicks;

    for (let i = 0; i <= numTicks; i += 1) {
      const yValue = yMax - i * yStep;
      const scaledYPos = ((yMax - yValue) / (yMax - yMin)) * (plotHeight - 1);
      const labelShift = axisCenter?.[1] !== undefined && axisCenter?.[1] > 0 ? 1 : 0;
      const graphYPos = Math.floor(scaledYPos) + 1 + labelShift;

      if (graphYPos >= 0 && graphYPos < graph.length) {
        if (graph[graphYPos][axis.x + yShift + 1] !== axisSymbols?.y) {
          const pointYShift = toArray(
            transformLabel(yValue, { axis: 'y', xRange: expansionX, yRange: expansionY }),
          );

          for (let j = 0; j < pointYShift.length; j += 1) {
            const colIndex = axis.x + yShift - j;
            if (colIndex >= 0 && colIndex < graph[graphYPos].length) {
              graph[graphYPos][colIndex] = pointYShift[pointYShift.length - 1 - j];
            }
          }

          const tickMarkIndex = axis.x + yShift + 1;
          if (tickMarkIndex >= 0 && tickMarkIndex < graph[graphYPos].length) {
            graph[graphYPos][tickMarkIndex] = axisSymbols?.y || AXIS.y;
          }
        }
      }
    }
    return;
  }

  // Render specific values present in the data
  if (graph[scaledY + 1][axis.x + yShift + 1] !== axisSymbols?.y) {
    const pointYShift = toArray(
      transformLabel(pointY, { axis: 'y', xRange: expansionX, yRange: expansionY }),
    );
    for (let i = 0; i < pointYShift.length; i += 1) {
      graph[scaledY + 1][axis.x + yShift - i] = pointYShift[pointYShift.length - 1 - i];
    }
    graph[scaledY + 1][axis.x + yShift + 1] = axisSymbols?.y || AXIS.y;
  }
};

/**
 * Draws both X and Y axes on the graph according to visibility and center configurations.
 * @param {object} options - Configuration options.
 * @param {Graph} options.graph - The graph array where axes will be drawn.
 * @param {boolean} [options.hideXAxis] - If true, hides the X-axis.
 * @param {boolean} [options.hideYAxis] - If true, hides the Y-axis.
 * @param {MaybePoint} [options.axisCenter] - Optional axis center coordinates.
 * @param {Symbols['axis']} options.axisSymbols - Symbols used for the axis.
 * @param {object} options.axis - The axis position.
 */
export const drawAxis = ({
  graph,
  hideXAxis,
  hideYAxis,
  axisCenter,
  axisSymbols,
  axis,
}: {
  graph: Graph;
  axis: { x: number; y: number };
  hideXAxis?: boolean;
  axisCenter?: MaybePoint;
  hideYAxis?: boolean;
  axisSymbols: Symbols['axis'];
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
        line[curr] = lineChar;
      }
    });
  });
};

/**
 * Initializes an empty graph based on plot dimensions and a given symbol.
 * @param {object} options - Configuration options.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {string} options.emptySymbol - Symbol used to fill empty cells.
 * @returns {Graph} - An initialized empty graph array.
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
 * Renders the graph array into a single string.
 * @param {object} options - Configuration options.
 * @param {Graph} options.graph - The graph array to render.
 * @returns {string} - The rendered graph.
 */
export const drawChart = ({ graph }: { graph: Graph }) =>
  `\n${graph.map((line) => line.join('')).join('\n')}\n`;

/**
 * Renders a custom line on the graph based on formatter specifications.
 * @param {object} options - Configuration options.
 * @param {Point[]} options.sortedCoords - Sorted list of coordinates.
 * @param {number} options.scaledX - X-axis scaling.
 * @param {number} options.scaledY - Y-axis scaling.
 * @param {MultiLine} options.input - Input data points.
 * @param {number} options.index - Current index in the coordinate array.
 * @param {function} options.lineFormatter - Custom function for line formatting.
 * @param {Graph} options.graph - The graph array to modify.
 */
export const drawCustomLine = ({
  sortedCoords,
  scaledX,
  scaledY,
  input,
  index,
  lineFormatter,
  graph,
}: {
  sortedCoords: Point[];
  scaledX: number;
  scaledY: number;
  input: MultiLine;
  index: number;
  lineFormatter: (args: {
    x: number;
    y: number;
    plotX: number;
    plotY: number;
    index: number;
    input: Point[];
  }) => CustomSymbol | CustomSymbol[];
  graph: Graph;
}) => {
  const lineFormatterArgs = {
    x: sortedCoords[index][0],
    y: sortedCoords[index][1],
    plotX: scaledX + 1,
    plotY: scaledY + 1,
    index,
    input: input[0],
  };
  const customSymbols = lineFormatter(lineFormatterArgs);
  if (Array.isArray(customSymbols)) {
    customSymbols.forEach(({ x: symbolX, y: symbolY, symbol }: CustomSymbol) => {
      graph[symbolY][symbolX] = symbol;
    });
  } else {
    graph[customSymbols.y][customSymbols.x] = customSymbols.symbol;
  }
};

/**
 * Renders a line between two points on the graph using defined chart symbols.
 * @param {object} options - Configuration options.
 * @param {number} options.index - Current index in the coordinate array.
 * @param {Point[]} options.arr - List of points for the line.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {number} options.scaledX - X-axis scaling.
 * @param {number} options.scaledY - Y-axis scaling.
 * @param {number} options.plotHeight - Height of the plot.
 * @param {string} options.emptySymbol - Symbol used to fill empty cells.
 * @param {Symbols['chart']} options.chartSymbols - Symbols used for the chart.
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
}: {
  index: number;
  arr: Point[];
  graph: Graph;
  scaledX: number;
  scaledY: number;
  plotHeight: number;
  emptySymbol: string;
  chartSymbols: Symbols['chart'];
}) => {
  if (index - 1 >= 0) {
    const [prevX, prevY] = arr[index - 1];
    const [currX, currY] = arr[index];

    Array(distance(currY, prevY))
      .fill('')
      .forEach((_, steps, array) => {
        if (Math.round(prevY) > Math.round(currY)) {
          graph[scaledY + 1][scaledX] = chartSymbols?.nse || CHART.nse;
          if (steps === array.length - 1) {
            graph[scaledY - steps][scaledX] = chartSymbols?.wns || CHART.wns;
          } else {
            graph[scaledY - steps][scaledX] = chartSymbols?.ns || CHART.ns;
          }
        } else {
          graph[scaledY + steps + 2][scaledX] = chartSymbols?.wsn || CHART.wsn;
          graph[scaledY + steps + 1][scaledX] = chartSymbols?.ns || CHART.ns;
        }
      });

    if (Math.round(prevY) < Math.round(currY)) {
      graph[scaledY + 1][scaledX] = chartSymbols?.sne || CHART.sne;
    } else if (Math.round(prevY) === Math.round(currY)) {
      if (graph[scaledY + 1][scaledX] === emptySymbol) {
        graph[scaledY + 1][scaledX] = chartSymbols?.we || CHART.we;
      }
    }

    const distanceX = distance(currX, prevX);
    Array(distanceX ? distanceX - 1 : 0)
      .fill('')
      .forEach((_, steps) => {
        const thisY = plotHeight - Math.round(prevY);
        graph[thisY][Math.round(prevX) + steps + 1] = chartSymbols?.we || CHART.we;
      });
  }

  if (arr.length - 1 === index) {
    graph[scaledY + 1][scaledX + 1] = chartSymbols?.we || CHART.we;
  }
};

/**
 * Applies shifts to the graph and adjusts empty symbols and scaling factors.
 * @param {object} options - Configuration options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {string} options.emptySymbol - Symbol used to fill empty cells.
 * @param {number[][]} options.scaledCoords - Scaled coordinates for shifting.
 * @param {number} options.xShift - X-axis shift offset.
 * @param {number} options.yShift - Y-axis shift offset.
 * @returns {object} - Indicates whether graph movement is required.
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
      line.unshift(emptySymbol); // left
    }
  });
  return { hasToBeMoved };
};
