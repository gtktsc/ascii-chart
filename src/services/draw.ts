import { AXIS, CHART } from '../constants';
import { CustomSymbol, Formatter, Graph, MaybePoint, MultiLine, Point, Symbols } from '../types';
import { distance, toArray, toEmpty } from './coords';

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

  // Add X tick only for the last value
  if (pointXShift.length - 1 === i) {
    const xTickY = yPos + signShift;
    const xTickX = scaledX + yShift + 2 + shift;

    // Ensure xTickY and xTickX are within bounds
    if (xTickY >= 0 && xTickY < graph.length && xTickX >= 0 && xTickX < graph[xTickY].length) {
      graph[xTickY][xTickX] = axisSymbols?.x || AXIS.x;
    }
  }
};

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
  // Show all labels when showTickLabel is true
  if (showTickLabel) {
    const yMax = Math.max(...expansionY);
    const yMin = Math.min(...expansionY);

    // Decide the number of ticks you want on the Y-axis
    const numTicks = plotHeight; // You can adjust this number as needed

    // Calculate the step size for each tick
    const yStep = (yMax - yMin) / numTicks;

    for (let i = 0; i <= numTicks; i += 1) {
      // Calculate the Y value for this tick
      const yValue = yMax - i * yStep;

      // Map the Y value to a graph Y position
      const scaledYPos = ((yMax - yValue) / (yMax - yMin)) * (plotHeight - 1);

      const labelShift = axisCenter?.[1] !== undefined && axisCenter?.[1] > 0 ? 1 : 0;

      // Round to get the exact row index in the graph array
      const graphYPos = Math.floor(scaledYPos) + 1 + labelShift;

      // Ensure the graphYPos is within the bounds of the graph array
      if (graphYPos >= 0 && graphYPos < graph.length) {
        // Check if the position is not already occupied
        if (graph[graphYPos][axis.x + yShift + 1] !== axisSymbols?.y) {
          const pointYShift = toArray(
            transformLabel(yValue, { axis: 'y', xRange: expansionX, yRange: expansionY }),
          );

          // Place the tick label on the graph
          for (let j = 0; j < pointYShift.length; j += 1) {
            const colIndex = axis.x + yShift - j;

            // Ensure colIndex is within bounds
            if (colIndex >= 0 && colIndex < graph[graphYPos].length) {
              graph[graphYPos][colIndex] = pointYShift[pointYShift.length - 1 - j];
            }
          }

          const tickMarkIndex = axis.x + yShift + 1;

          // Ensure tickMarkIndex is within bounds
          if (tickMarkIndex >= 0 && tickMarkIndex < graph[graphYPos].length) {
            graph[graphYPos][tickMarkIndex] = axisSymbols?.y || AXIS.y;
          }
        }
      }
    }
    return;
  }

  // Existing code for showing only values that are present
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
        // eslint-disable-next-line
        line[curr] = lineChar;
      }
    });
  });
};

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

export const drawChart = ({ graph }: { graph: Graph }) =>
  `\n${graph.map((line) => line.join('')).join('\n')}\n`;

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
  // custom line formatter
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
      // The same Y values
    } else if (Math.round(prevY) === Math.round(currY)) {
      // Add line only if space is not occupied already - valid case for small similar Y
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

  // plot the last coordinate
  if (arr.length - 1 === index) {
    graph[scaledY + 1][scaledX + 1] = chartSymbols?.we || CHART.we;
  }
};

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
  // shift graph
  graph.push(toEmpty(plotWidth + 2, emptySymbol)); // bottom

  // check step
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
