import { SingleLine, Point, MultiLine } from '../types';
import { EMPTY } from '../constants';

export const toEmpty = (size: number, empty?: string) => Array(size).fill(empty || EMPTY);

export const toArray = (number: number): string[] => number.toString().split('');

export const toUnique = (array: number[]) => [...new Set(array)];

export const distance = (x: number, y: number): number => Math.abs(Math.round(x) - Math.round(y));

export const toArrays = (array: MultiLine): [number[], number[]] => {
  const rangeX: number[] = [];
  const rangeY: number[] = [];

  array.flat().forEach(([x, y]) => {
    rangeX.push(x);
    rangeY.push(y);
  });
  return [toUnique(rangeX), toUnique(rangeY)];
};

export const toSorted = (array: SingleLine): SingleLine => {
  return array.sort(([x1], [x2]) => {
    if (x1 < x2) {
      return -1;
    }
    if (x1 > x2) {
      return 1;
    }
    return 0;
  });
};

export const toPlot = (plotWidth: number, plotHeight: number) => (x: number, y: number) => [
  Math.round((x / plotWidth) * plotWidth),
  plotHeight - 1 - Math.round((y / plotHeight) * plotHeight),
];

export const getExtrema = (arr: SingleLine, type: 'max' | 'min' = 'max', position = 1) => {
  return arr.reduce(
    (previous, curr) => Math[type](previous, curr[position]),
    type === 'max' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  );
};

export const getMax = (arr: number[]) => {
  return arr.reduce((previous, curr) => Math.max(previous, curr), Number.NEGATIVE_INFINITY);
};

export const getMin = (arr: number[]) => {
  return arr.reduce((previous, curr) => Math.min(previous, curr), Number.POSITIVE_INFINITY);
};

type Get = (value: number) => number;

export const scaler = ([domainMin, domainMax]: number[], [rangeMin, rangeMax]: number[]): Get => {
  const domainLength = Math.sqrt(Math.abs((domainMax - domainMin) ** 2)) || 1;
  const rangeLength = Math.sqrt((rangeMax - rangeMin) ** 2);

  return (domainValue) => rangeMin + (rangeLength * (domainValue - domainMin)) / domainLength;
};

export const toCoordinates = (
  point: Point,
  plotWidth: number,
  plotHeight: number,
  rangeX: number[],
  rangeY: number[],
): Point => {
  const getXCoord = scaler(rangeX, [0, plotWidth - 1]);
  const getYCoord = scaler(rangeY, [0, plotHeight - 1]);

  const toScale = ([x, y]: Point): Point => [getXCoord(x), getYCoord(y)];

  return toScale(point);
};

export const getPlotCoords = (
  coordinates: SingleLine,
  plotWidth: number,
  plotHeight: number,
  rangeX?: number[],
  rangeY?: number[],
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

export const getAxisCenter = (
  axisCenter: Point | void,
  plotWidth: number,
  plotHeight: number,
  rangeX: number[],
  rangeY: number[],
  initialValue: number[],
) => {
  const axis = { x: initialValue[0], y: initialValue[1] };
  // calculate axis position
  if (axisCenter) {
    const [centerX, centerY] = toCoordinates(axisCenter, plotWidth, plotHeight, rangeX, rangeY);
    const [plotCenterX, plotCenterY] = toPlot(plotWidth, plotHeight)(centerX, centerY);
    axis.x = plotCenterX;
    axis.y = plotCenterY + 1;
  }

  return axis;
};
