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
import { getChartSymbols } from './settings';
import { SingleLine, MultiLine, Plot } from '../types';
import { AXIS, EMPTY } from '../constants';

export const plot: Plot = (rawInput, {
  color, width, height, axisCenter, formatter,
} = {}) => {
  let input = rawInput as MultiLine;
  if (typeof input[0][0] === 'number') {
    input = [rawInput] as MultiLine;
  }
  const transformLabel = (number: number) => {
    if (formatter) {
      return formatter(number);
    }
    return Number(number.toFixed(3));
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
  const graph = Array.from({ length: plotHeight + 2 }, () => toEmpty(plotWidth + 2));

  const axis = getAxisCenter(axisCenter, plotWidth, plotHeight, expansionX, expansionY, [
    0,
    graph.length - 1,
  ]);

  input.forEach((coords: SingleLine, series) => {
    const chart = getChartSymbols(color, series);

    // sort input by the first value
    const sortedCoords = toSorted(coords);

    scaledCoords = getPlotCoords(sortedCoords, plotWidth, plotHeight, expansionX, expansionY).map(
      ([x, y], index, arr) => {
        const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);

        if (index - 1 >= 0) {
          const [prevX, prevY] = arr[index - 1];
          const [currX, currY] = arr[index];

          Array(distance(currY, prevY))
            .fill('')
            .forEach((_, steps, array) => {
              if (Math.round(prevY) > Math.round(currY)) {
                graph[scaledY + 1][scaledX] = chart.nse;
                if (steps === array.length - 1) {
                  graph[scaledY - steps][scaledX] = chart.wns;
                } else {
                  graph[scaledY - steps][scaledX] = chart.ns;
                }
              } else {
                graph[scaledY + steps + 2][scaledX] = chart.wsn;
                graph[scaledY + steps + 1][scaledX] = chart.ns;
              }
            });

          if (Math.round(prevY) < Math.round(currY)) {
            graph[scaledY + 1][scaledX] = chart.sne;
          } else if (Math.round(prevY) === Math.round(currY)) {
            graph[scaledY + 1][scaledX] = chart.we;
          }

          const distanceX = distance(currX, prevX);
          Array(distanceX ? distanceX - 1 : 0)
            .fill('')
            .forEach((_, steps) => {
              const thisY = plotHeight - Math.round(prevY);
              graph[thisY][Math.round(prevX) + steps + 1] = chart.we;
            });
        }

        // plot the last coordinate
        if (arr.length - 1 === index) {
          graph[scaledY + 1][scaledX + 1] = chart.we;
        }
        return [scaledX, scaledY];
      },
    );
  });

  // axis
  graph.forEach((line, index) => {
    line.forEach((char, curr) => {
      let lineChar = '';

      if (curr === axis.x) {
        if (index === 0) {
          lineChar = AXIS.n;
        } else if (char === AXIS.y) {
          return;
        } else if (index === graph.length - 1 && !axisCenter) {
          lineChar = AXIS.nse;
        } else {
          lineChar = AXIS.ns;
        }
      } else if (index === axis.y) {
        if (curr === line.length - 1) {
          lineChar = AXIS.e;
        } else if (char === AXIS.x) {
          return;
        } else {
          lineChar = AXIS.we;
        }
      }

      if (lineChar) {
        // eslint-disable-next-line
        line[curr] = lineChar;
      }
    });
  });

  const xShift = toArray(maxX).length;
  const yShift = toArray(maxY).length;
  // shift graph
  graph.unshift(toEmpty(plotWidth + 2)); // top
  graph.push(toEmpty(plotWidth + 2)); // bottom

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
  if (hasToBeMoved) graph.push(toEmpty(plotWidth + 1));
  graph.forEach((line) => {
    for (let i = 0; i <= yShift; i += 1) {
      line.unshift(EMPTY); // left
    }
  });

  // shift coords
  input.forEach((current) => {
    const coord = getPlotCoords(current, plotWidth, plotHeight, expansionX, expansionY);
    current.forEach(([pointX, pointY], index) => {
      const [x, y] = coord[index];

      const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);
      // add axis stamps

      const pointYShift = toArray(transformLabel(pointY));
      for (let i = 0; i < pointYShift.length; i += 1) {
        graph[scaledY + 2][axis.x + yShift - i] = pointYShift[pointYShift.length - 1 - i];
      }
      graph[scaledY + 2][axis.x + yShift + 1] = AXIS.y;

      const pointXShift = toArray(transformLabel(pointX));
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
        graph[yPos + signShift][scaledX + yShift + 2 + shift] = AXIS.x;
      }
    });
  });

  return `\n${graph.map((line) => line.join('')).join('\n')}\n`;
};
