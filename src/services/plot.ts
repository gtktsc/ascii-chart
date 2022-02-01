import { PlotCoords, Plot, PlotColor } from '../types';
import { stamps } from '../constants';

export const getExtrema = (
  arr: PlotCoords,
  type: 'max' | 'min' = 'max',
  start = 0,
  position = 1,
) => {
  return arr.reduce((previous, curr) => Math[type](previous, curr[position]), start);
};

type Get = (value: number) => number;

export const scaler = (
  [domainMin, domainMax]: [number, number],
  [rangeMin, rangeMax]: [number, number],
): Get => {
  const domainLength = Math.sqrt(Math.abs((domainMax - domainMin) ** 2)) || 1;
  const rangeLength = Math.sqrt((rangeMax - rangeMin) ** 2);

  return (domainValue) => rangeMin + (rangeLength * (domainValue - domainMin)) / domainLength;
};

export const getPlotCoords = (
  coordinates: PlotCoords,
  plotWidth: number,
  plotHeight: number,
  xRange?: [number, number],
  yRange?: [number, number],
): PlotCoords => {
  const getXCoord = scaler(
    xRange || [
      getExtrema(coordinates, 'min', getExtrema(coordinates, 'max', 0, 0), 0),
      getExtrema(coordinates, 'max', 0, 0),
    ],
    [0, plotWidth - 1],
  );
  const getYCoord = scaler(
    yRange || [getExtrema(coordinates, 'min', getExtrema(coordinates)), getExtrema(coordinates)],
    [0, plotHeight - 1],
  );

  const coords: PlotCoords = coordinates.map(([x, y]) => [getXCoord(x), getYCoord(y)]);

  return coords;
};

const getAnsiColor = (color: PlotColor): string => {
  switch (color) {
    case 'ansiBlack':
      return '\u001b[30m';
    case 'ansiRed':
      return '\u001b[31m';
    case 'ansiGreen':
      return '\u001b[32m';
    case 'ansiYellow':
      return '\u001b[33m';
    case 'ansiBlue':
      return '\u001b[34m';
    case 'ansiMagenta':
      return '\u001b[35m';
    case 'ansiCyan':
      return '\u001b[36m';
    case 'ansiWhite':
    default:
      return '\u001b[37m';
  }
};

export const plot: Plot = (coords, width, height, { color } = {}) => {
  const maxX = getExtrema(coords, 'max', 0, 0);
  const minX = getExtrema(coords, 'min', maxX, 0);

  const maxY = getExtrema(coords, 'max', 0, 1);
  const minY = getExtrema(coords, 'min', maxY, 1);
  // set default size
  const plotWidth = width || coords.length;
  const plotHeight = Math.round(height || maxY - minY + 1);

  if (color) {
    type ChartKeys = keyof typeof stamps.chart;
    Object.entries(stamps.chart).forEach(([key, sign]) => {
      stamps.chart[key as ChartKeys] = `${getAnsiColor(color)}${sign}\u001b[0m`;
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
  const fillWidth = () => Array(plotWidth + 2).fill(stamps.empty);
  const graph = Array.from({ length: plotHeight + 2 }, fillWidth);
  const scaledCoords = getPlotCoords(coords, plotWidth, plotHeight, [minX, maxX], [minY, maxY]).map(
    ([x, y], index, arr) => {
      const scaledX = Math.round((x / plotWidth) * plotWidth);
      const scaledY = plotHeight - 1 - Math.round((y / plotHeight) * plotHeight);
      // add axis stamps
      graph[graph.length - 1][scaledX + 1] = stamps.axis.x;
      graph[scaledY + 1][0] = stamps.axis.y;

      if (index - 1 >= 0) {
        const [prevX, prevY] = arr[index - 1];
        const [currX, currY] = arr[index];

        if (Math.round(prevY) > Math.round(currY)) {
          // increasing values
          graph[scaledY + 1][scaledX] = stamps.chart.nse;
          Array(Math.abs(Math.round(currY) - Math.round(prevY)))
            .fill('')
            .forEach((_, steps, array) => {
              if (steps === array.length - 1) {
                graph[scaledY - steps][scaledX] = stamps.chart.wns;
              } else {
                graph[scaledY - steps][scaledX] = stamps.chart.ns;
              }
            });
        } else {
          // decreasing values
          Array(Math.abs(Math.round(currY) - Math.round(prevY)))
            .fill('')
            .forEach((_, steps) => {
              graph[scaledY + steps + 2][scaledX] = stamps.chart.wsn;
              graph[scaledY + steps + 1][scaledX] = stamps.chart.ns;
            });

          if (Math.round(prevY) < Math.round(currY)) {
            graph[scaledY + 1][scaledX] = stamps.chart.sne;
          } else if (Math.round(prevY) === Math.round(currY)) {
            graph[scaledY + 1][scaledX] = stamps.chart.we;
          }
        }
        const distanceX = Math.abs(Math.round(currX) - Math.round(prevX));
        Array(distanceX ? distanceX - 1 : 0)
          .fill('')
          .forEach((_, steps) => {
            graph[plotHeight - Math.round(prevY)][Math.round(prevX) + steps + 1] = stamps.chart.we;
          });
      }

      // plot the last coordinate
      if (arr.length - 1 === index) {
        graph[scaledY + 1][scaledX + 1] = stamps.chart.we;
      }
      return [scaledX, scaledY];
    },
  );

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
  coords.forEach(([pointX, pointY], index) => {
    const [x, y] = scaledCoords[index];
    const pointYShift = pointY.toString().split('');

    for (let i = 0; i < pointYShift.length; i += 1) {
      graph[y + 2][yShift - i] = pointYShift[pointYShift.length - 1 - i];
    }
    const pointXShift = pointX.toString().split('');
    for (let i = 0; i < pointXShift.length; i += 1) {
      const yPos = index % 2 && hasToBeMoved ? graph.length - 2 : graph.length - 1;
      graph[yPos][x + yShift - i + 2] = pointXShift[pointXShift.length - 1 - i];
    }
  });

  return `\n${graph.map((line) => line.join('')).join('\n')}\n`;
};
