import { PlotCoords, Plot } from '../types';

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
  const domainLength = Math.sqrt(Math.abs((domainMax - domainMin) ** 2));
  const rangeLength = Math.sqrt((rangeMax - rangeMin) ** 2);

  return (domainValue) => rangeMin + (rangeLength * (domainValue - domainMin)) / domainLength;
};

export const getPlotCoords = (
  coordinates: PlotCoords,
  plotWidth: number,
  plotHeight: number,
): PlotCoords => {
  const [minXValue, maxXValue] = [
    getExtrema(coordinates, 'min', getExtrema(coordinates, 'max', 0, 0), 0),
    getExtrema(coordinates, 'max', 0, 0),
  ];
  const [minYValue, maxYValue] = [
    getExtrema(coordinates, 'min', getExtrema(coordinates)),
    getExtrema(coordinates),
  ];

  const getXCoord = scaler([minXValue, maxXValue], [0, plotWidth - 1]);
  const getYCoord = scaler([minYValue, maxYValue], [0, plotHeight - 1]);

  const coords: PlotCoords = coordinates.map(([x, y]) => [getXCoord(x), getYCoord(y)]);

  return coords;
};

export const plot: Plot = (coords, width, height) => {
  // set default size
  const plotWidth = width || coords.length;
  const plotHeight = height || getExtrema(coords, 'max', 0, 1) - getExtrema(coords, 'min', 0, 1) + 1;

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
  const graph = Array.from({ length: plotHeight + 2 }, () => Array(plotWidth + 2).fill(' '));

  const scaledCoords = getPlotCoords(coords, plotWidth, plotHeight).map(([x, y], index, arr) => {
    const scaledX = Math.round((x / plotWidth) * plotWidth);
    const scaledY = plotHeight - 1 - Math.round((y / plotHeight) * plotHeight);

    graph[scaledY + 1][scaledX + 1] = '━';

    // add axis stamps
    graph[graph.length - 1][scaledX + 1] = '┬';
    graph[scaledY + 1][0] = '┤';

    if (index - 1 >= 0) {
      const [prevX, prevY] = arr[index - 1];
      const [currX, currY] = arr[index];

      if (prevY > currY) {
        // increasing values
        graph[scaledY + 1][scaledX] = '┗';
        Array(Math.abs(Math.round(currY) - Math.round(prevY)))
          .fill('')
          .forEach((_, steps, array) => {
            if (steps === array.length - 1) {
              graph[scaledY - steps][scaledX] = '┓';
            } else {
              graph[scaledY - steps][scaledX] = '┃';
            }
          });
      } else {
        // decreasing values
        Array(Math.abs(Math.round(currY) - Math.round(prevY)))
          .fill('')
          .forEach((_, steps) => {
            graph[scaledY + steps + 2][scaledX] = '┛';
            graph[scaledY + steps + 1][scaledX] = '┃';
          });

        if (prevY < currY) {
          graph[scaledY + 1][scaledX] = '┏';
        } else if (prevY === currY) {
          graph[scaledY + 1][scaledX] = '━';
        }
      }
      const distanceX = Math.abs(Math.round(currX) - Math.round(prevX));
      Array(distanceX ? distanceX - 1 : 0)
        .fill('')
        .forEach((_, steps) => {
          graph[plotHeight - Math.round(prevY)][Math.round(prevX) + steps + 1] = '━';
        });
    }
    return [scaledX, scaledY];
  });

  // axis
  graph.forEach((line, index) => {
    line.forEach((char, curr) => {
      let lineChar = '';
      if (curr === 0) {
        if (index === 0) {
          lineChar = '▲';
        } else if (char === '┤') {
          return;
        } else if (index === graph.length - 1) {
          lineChar = '└';
        } else {
          lineChar = '│';
        }
      } else if (index === graph.length - 1) {
        if (curr === line.length - 1) {
          lineChar = '▶';
        } else if (char === '┬') {
          return;
        } else {
          lineChar = '─';
        }
      }

      if (lineChar) {
        // eslint-disable-next-line
        line[curr] = lineChar;
      }
    });
  });

  const xShift = Math.round(getExtrema(coords, 'max', 0, 1)).toFixed(0).split('').length;

  // shift graph
  graph.unshift(Array(plotWidth + 2).fill(' ')); // top
  graph.push(Array(plotWidth + 2).fill(' ')); // bottom
  graph.forEach((line) => {
    for (let i = 0; i <= xShift; i += 1) {
      line.unshift(' '); // left
    }
    // line.push(' '); // right
  });

  // shift coords
  coords.forEach(([pointX, pointY], index) => {
    const [x, y] = scaledCoords[index];
    const pointShift = pointY.toFixed(0).split('');
    for (let i = 0; i < pointShift.length; i += 1) {
      graph[y + 2][xShift - i] = pointShift[pointShift.length - 1 - i];
    }
    graph[graph.length - 1][x + 2 + xShift] = pointX;
  });

  return `\n${graph.map((line) => line.join('')).join('\n')}\n`;
};
