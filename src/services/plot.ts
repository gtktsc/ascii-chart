import { getPlotCoords, getHighest } from './coords';
import { getAnsiColor } from './settings';

import {
  SingleLine, MultiLine, Plot, Color,
} from '../types';
import { stamps } from '../constants';

export const plot: Plot = (rawInput, { color, width, height } = {}) => {
  let graph = [['']];
  let input = rawInput as MultiLine;
  if (typeof input[0][0] === 'number') {
    input = [rawInput] as MultiLine;
  }

  let scaledCoords = [[0, 0]];
  let rangeX: number[] = [];
  let rangeY: number[] = [];

  input.forEach((series) => {
    series.forEach(([x, y]) => {
      rangeX.push(x);
      rangeY.push(y);
    });
  });

  const minX = getHighest(rangeX, 'min');
  const maxX = getHighest(rangeX, 'max');
  const minY = getHighest(rangeY, 'min');
  const maxY = getHighest(rangeY, 'max');

  rangeX = [...new Set(rangeX)];
  rangeY = [...new Set(rangeY)];

  // set default size
  const plotWidth = width || rangeX.length;

  let plotHeight = Math.round(height || maxY - minY + 1);

  // for small values without height
  if (!height && plotHeight < 3) {
    plotHeight = rangeY.length;
  }

  input.forEach((coords: SingleLine, series) => {
    const symbols = JSON.parse(JSON.stringify(stamps));
    if (color) {
      let currentColor = '';
      if (Array.isArray(color)) {
        currentColor = color[series];
      } else {
        currentColor = color;
      }

      type ChartKeys = keyof typeof stamps.chart;

      Object.entries(stamps.chart).forEach(([key, sign]) => {
        symbols.chart[key as ChartKeys] = `${getAnsiColor(currentColor as Color)}${sign}\u001b[0m`;
      });
    }

    // sort input by the first value
    coords.sort(([x1], [x2]) => {
      if (x1 < x2) {
        return -1;
      }
      if (x1 > x2) {
        return 1;
      }
      return 0;
    });

    // create empty graph
    if (series === 0) {
      const fillWidth = () => Array(plotWidth + 2).fill(symbols.empty);
      graph = Array.from({ length: plotHeight + 2 }, fillWidth);
    }

    scaledCoords = getPlotCoords(coords, plotWidth, plotHeight, [minX, maxX], [minY, maxY]).map(
      ([x, y], index, arr) => {
        const scaledX = Math.round((x / plotWidth) * plotWidth);
        const scaledY = plotHeight - 1 - Math.round((y / plotHeight) * plotHeight);
        // add axis stamps

        graph[graph.length - 1][scaledX + 1] = symbols.axis.x;
        graph[scaledY + 1][0] = symbols.axis.y;

        if (index - 1 >= 0) {
          const [prevX, prevY] = arr[index - 1];
          const [currX, currY] = arr[index];

          if (Math.round(prevY) > Math.round(currY)) {
            // increasing values
            graph[scaledY + 1][scaledX] = symbols.chart.nse;
            Array(Math.abs(Math.round(currY) - Math.round(prevY)))
              .fill('')
              .forEach((_, steps, array) => {
                if (steps === array.length - 1) {
                  graph[scaledY - steps][scaledX] = symbols.chart.wns;
                } else {
                  graph[scaledY - steps][scaledX] = symbols.chart.ns;
                }
              });
          } else {
            // decreasing values
            Array(Math.abs(Math.round(currY) - Math.round(prevY)))
              .fill('')
              .forEach((_, steps) => {
                graph[scaledY + steps + 2][scaledX] = symbols.chart.wsn;
                graph[scaledY + steps + 1][scaledX] = symbols.chart.ns;
              });

            if (Math.round(prevY) < Math.round(currY)) {
              graph[scaledY + 1][scaledX] = symbols.chart.sne;
            } else if (Math.round(prevY) === Math.round(currY)) {
              graph[scaledY + 1][scaledX] = symbols.chart.we;
            }
          }
          const distanceX = Math.abs(Math.round(currX) - Math.round(prevX));
          Array(distanceX ? distanceX - 1 : 0)
            .fill('')
            .forEach((_, steps) => {
              const thisY = plotHeight - Math.round(prevY);
              graph[thisY][Math.round(prevX) + steps + 1] = symbols.chart.we;
            });
        }

        // plot the last coordinate
        if (arr.length - 1 === index) {
          graph[scaledY + 1][scaledX + 1] = symbols.chart.we;
        }
        return [scaledX, scaledY];
      },
    );
  });

  // axis
  graph.forEach((line, index) => {
    line.forEach((char, curr) => {
      let lineChar = '';
      if (curr === 0) {
        if (index === 0) {
          lineChar = stamps.axis.n;
        } else if (char === stamps.axis.y) {
          return;
        } else if (index === graph.length - 1) {
          lineChar = stamps.axis.nse;
        } else {
          lineChar = stamps.axis.ns;
        }
      } else if (index === graph.length - 1) {
        if (curr === line.length - 1) {
          lineChar = stamps.axis.e;
        } else if (char === stamps.axis.x) {
          return;
        } else {
          lineChar = stamps.axis.we;
        }
      }
      if (lineChar) {
        // eslint-disable-next-line
        line[curr] = lineChar;
      }
    });
  });

  const xShift = maxX.toString().split('').length;
  const yShift = maxY.toString().split('').length;
  // shift graph
  graph.unshift(Array(plotWidth + 2).fill(stamps.empty)); // top
  graph.push(Array(plotWidth + 2).fill(stamps.empty)); // bottom

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
  if (hasToBeMoved) graph.push(Array(plotWidth + 1).fill(stamps.empty));
  graph.forEach((line) => {
    for (let i = 0; i <= yShift; i += 1) {
      line.unshift(stamps.empty); // left
    }
  });

  // shift coords
  input.forEach((current) => {
    const coord = getPlotCoords(current, plotWidth, plotHeight, [minX, maxX], [minY, maxY]);
    current.forEach(([pointX, pointY], index) => {
      const [x, y] = coord[index];
      const scaledY = plotHeight - 1 - Math.round((y / plotHeight) * plotHeight);
      const scaledX = Math.round((x / plotWidth) * plotWidth);

      const pointYShift = pointY.toString().split('');

      for (let i = 0; i < pointYShift.length; i += 1) {
        graph[scaledY + 2][yShift - i] = pointYShift[pointYShift.length - 1 - i];
      }
      const pointXShift = pointX.toString().split('');
      for (let i = 0; i < pointXShift.length; i += 1) {
        const yPos = index % 2 && hasToBeMoved ? graph.length - 2 : graph.length - 1;

        graph[yPos][scaledX + yShift - i + 2] = pointXShift[pointXShift.length - 1 - i];
      }
    });
  });

  return `\n${graph.map((line) => line.join('')).join('\n')}\n`;
};
