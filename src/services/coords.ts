import { SingleLine, Point } from '../types';

export const getExtrema = (arr: SingleLine, type: 'max' | 'min' = 'max', position = 1) => {
  return arr.reduce(
    (previous, curr) => Math[type](previous, curr[position]),
    type === 'max' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  );
};

export const getHighest = (arr: number[], type: 'max' | 'min' = 'max') => {
  return arr.reduce(
    (previous, curr) => Math[type](previous, curr),
    type === 'max' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  );
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

export const toPlot = (plotWidth: number, plotHeight: number) => ([x, y]: Point) => [
  Math.round((x / plotWidth) * plotWidth),
  plotHeight - 1 - Math.round((y / plotHeight) * plotHeight),
];

export const getPlotCoords = (
  coordinates: SingleLine,
  plotWidth: number,
  plotHeight: number,
  rangeX?: [number, number],
  rangeY?: [number, number],
): SingleLine => {
  const getXCoord = scaler(
    rangeX || [getExtrema(coordinates, 'min', 0), getExtrema(coordinates, 'max', 0)],
    [0, plotWidth - 1],
  );
  const getYCoord = scaler(rangeY || [getExtrema(coordinates, 'min'), getExtrema(coordinates)], [
    0,
    plotHeight - 1,
  ]);

  const toScale = ([x, y]: Point): Point => [getXCoord(x), getYCoord(y)];

  return coordinates.map(toScale);
};
