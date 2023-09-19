import { AXIS, CHART } from '../constants';
import { CustomSymbol, Formatter, Graph, MultiLine, Point, Symbols } from '../types';
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
  axisCenter?: Point;
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
  const yShiftWhenHasAxisCenter = axisCenter ? 1 : 0;

  const graphY = yPos + yShiftWhenOccupied + yShiftWhenHasAxisCenter;
  const graphX = scaledX + yShift - i + 2 + shift;

  graph[graphY][graphX] = pointXShift[pointXShift.length - 1 - i];
  // Add X tick only for the last value
  if (pointXShift.length - 1 === i) {
    graph[yPos + signShift][scaledX + yShift + 2 + shift] = axisSymbols?.x || AXIS.x;
  }
};

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
}: {
  graph: Graph;
  scaledY: number;
  yShift: number;
  axis: { x: number; y: number };
  pointY: number;
  transformLabel: Formatter;
  axisSymbols: Symbols['axis'];
  expansionX: number[];
  expansionY: number[];
}) => {
  // make sure position is not taken already
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
  axisCenter?: Point;
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
