import {
  getPlotCoords,
  toArrays,
  getMax,
  getMin,
  toArray,
  toPlot,
  toSorted,
  distance,
  toEmpty,
  getAxisCenter,
} from './coords';
import { getChartSymbols, defaultFormatter } from './settings';
import { SingleLine, MultiLine, Plot, CustomSymbol, Formatter } from '../types';
import { AXIS, EMPTY } from '../constants';

export const plot: Plot = (
  rawInput,
  {
    color,
    width,
    height,
    axisCenter,
    formatter,
    lineFormatter,
    symbols,
    hideXAxis,
    hideYAxis,
  } = {},
) => {
  let input = rawInput as MultiLine;
  if (typeof input[0][0] === 'number') {
    input = [rawInput] as MultiLine;
  }

  const transformLabel: Formatter = (value, helpers) => {
    if (formatter) {
      return formatter(value, helpers);
    }
    return defaultFormatter(value, helpers);
  };

  let scaledCoords = [[0, 0]];

  const [rangeX, rangeY] = toArrays(input);

  const minX = getMin(rangeX);
  const maxX = getMax(rangeX);
  const minY = getMin(rangeY);
  const maxY = getMax(rangeY);

  const expansionX = [minX, maxX];
  const expansionY = [minY, maxY];

  // set default size
  const plotWidth = width || rangeX.length;

  let plotHeight = Math.round(height || maxY - minY + 1);

  // for small values without height
  if (!height && plotHeight < 3) {
    plotHeight = rangeY.length;
  }

  // create placeholder
  const callback = () => toEmpty(plotWidth + 2, symbols?.empty);
  const graph = Array.from({ length: plotHeight + 2 }, callback);

  const axis = getAxisCenter(axisCenter, plotWidth, plotHeight, expansionX, expansionY, [
    0,
    graph.length - 1,
  ]);

  const axisSymbols = symbols?.axis || AXIS;
  const emptySymbols = symbols?.empty || EMPTY;

  input.forEach((coords: SingleLine, series) => {
    const chartSymbols = getChartSymbols(color, series, symbols?.chart);

    // sort input by the first value
    const sortedCoords = toSorted(coords);

    scaledCoords = getPlotCoords(sortedCoords, plotWidth, plotHeight, expansionX, expansionY).map(
      ([x, y], index, arr) => {
        const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);

        if (!lineFormatter) {
          if (index - 1 >= 0) {
            const [prevX, prevY] = arr[index - 1];
            const [currX, currY] = arr[index];

            Array(distance(currY, prevY))
              .fill('')
              .forEach((_, steps, array) => {
                if (Math.round(prevY) > Math.round(currY)) {
                  graph[scaledY + 1][scaledX] = chartSymbols.nse;
                  if (steps === array.length - 1) {
                    graph[scaledY - steps][scaledX] = chartSymbols.wns;
                  } else {
                    graph[scaledY - steps][scaledX] = chartSymbols.ns;
                  }
                } else {
                  graph[scaledY + steps + 2][scaledX] = chartSymbols.wsn;
                  graph[scaledY + steps + 1][scaledX] = chartSymbols.ns;
                }
              });

            if (Math.round(prevY) < Math.round(currY)) {
              graph[scaledY + 1][scaledX] = chartSymbols.sne;
            } else if (Math.round(prevY) === Math.round(currY)) {
              graph[scaledY + 1][scaledX] = chartSymbols.we;
            }

            const distanceX = distance(currX, prevX);
            Array(distanceX ? distanceX - 1 : 0)
              .fill('')
              .forEach((_, steps) => {
                const thisY = plotHeight - Math.round(prevY);
                graph[thisY][Math.round(prevX) + steps + 1] = chartSymbols.we;
              });
          }

          // plot the last coordinate
          if (arr.length - 1 === index) {
            graph[scaledY + 1][scaledX + 1] = chartSymbols.we;
          }
        } else {
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
        }

        return [scaledX, scaledY];
      },
    );
  });

  // axis
  graph.forEach((line, index) => {
    line.forEach((_, curr) => {
      let lineChar = '';

      if (curr === axis.x && !hideYAxis) {
        if (index === 0) {
          lineChar = axisSymbols.n;
        } else if (index === graph.length - 1 && !axisCenter && !(hideYAxis || hideXAxis)) {
          lineChar = axisSymbols.nse;
        } else {
          lineChar = axisSymbols.ns;
        }
      } else if (index === axis.y && !hideXAxis) {
        if (curr === line.length - 1) {
          lineChar = axisSymbols.e;
        } else {
          lineChar = axisSymbols.we;
        }
      }

      if (lineChar) {
        // eslint-disable-next-line
        line[curr] = lineChar;
      }
    });
  });

  // labels
  const xShift = toArray(maxX).length;
  const yShift = toArray(maxY).length;
  // shift graph
  graph.unshift(toEmpty(plotWidth + 2, symbols?.empty)); // top
  graph.push(toEmpty(plotWidth + 2, symbols?.empty)); // bottom

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
  if (hasToBeMoved) graph.push(toEmpty(plotWidth + 1, symbols?.empty));
  graph.forEach((line) => {
    for (let i = 0; i <= yShift; i += 1) {
      line.unshift(emptySymbols); // left
    }
  });

  // shift coords
  input.forEach((current) => {
    const coord = getPlotCoords(current, plotWidth, plotHeight, expansionX, expansionY);
    current.forEach(([pointX, pointY], index) => {
      const [x, y] = coord[index];

      const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);
      if (!hideYAxis) {
        const pointYShift = toArray(
          transformLabel(pointY, { axis: 'y', xRange: expansionX, yRange: expansionY }),
        );
        for (let i = 0; i < pointYShift.length; i += 1) {
          graph[scaledY + 2][axis.x + yShift - i] = pointYShift[pointYShift.length - 1 - i];
        }
        graph[scaledY + 2][axis.x + yShift + 1] = axisSymbols.y;
      }

      if (!hideXAxis) {
        const pointXShift = toArray(
          transformLabel(pointX, { axis: 'x', xRange: expansionX, yRange: expansionY }),
        );
        let yPos = graph.length - 1;
        const shift = axisCenter ? -1 : 0;
        for (let i = 0; i < pointXShift.length; i += 1) {
          let overflowShift = index % 2 && hasToBeMoved ? -1 : 0;
          let signShift = -1;
          if (hasToBeMoved) {
            signShift = -2;
          }
          if (axisCenter) {
            overflowShift = index % 2 && hasToBeMoved ? 1 : 0;
            yPos = axis.y + 2;
          }
          const graphY = yPos + overflowShift;
          const graphX = scaledX + yShift - i + 2 + shift;
          graph[graphY][graphX] = pointXShift[pointXShift.length - 1 - i];
          graph[yPos + signShift][scaledX + yShift + 2 + shift] = axisSymbols.x;
        }
      }
    });
  });

  return `\n${graph.map((line) => line.join('')).join('\n')}\n`;
};
