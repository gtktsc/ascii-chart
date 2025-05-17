import { SingleLine, Point, MultiLine } from '../types/index';
import { EMPTY } from '../constants/index';

/**
 * Normalizes the input value to an array of strings.
 * @param value - The value to normalize, which can be a string, an array of strings, or undefined.
 * @returns {string[]} - An array of strings. If the input is undefined, an empty array is returned.
 */
export const normalize = (value?: string[] | string): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * Pads or trims an array of labels to a specified target length.
 * @param {string[]} labels - The array of labels to pad or trim.
 * @param {number} targetLength - The target length for the array.
 * @returns {string[]} - The padded or trimmed array of labels.
 */
export const padOrTrim = (labels: string[], targetLength: number): string[] => {
  if (labels.length > targetLength) return labels.slice(0, targetLength);
  if (labels.length < targetLength)
    return [...labels, ...Array(targetLength - labels.length).fill('')];
  return labels;
};

/**
 * Creates an array filled with a specified string.
 * @param {number} size - The size of the array.
 * @param {string} empty - The value to fill the array with (default: EMPTY).
 * @returns {string[]} - An array filled with the specified string.
 */
export const toEmpty = (size: number, empty: string = EMPTY): string[] =>
  Array(size >= 0 ? size : 0).fill(empty);

/**
 * Converts a number or string to an array of its characters.
 * @param {number | string} input - The input to convert.
 * @returns {string[]} - An array of characters.
 */
export const toArray = (input: number | string): string[] => {
  return input.toString().split('');
};

/**
 * Removes duplicate values from an array.
 * @param {number[]} array - The array of numbers.
 * @returns {number[]} - An array containing only unique values.
 */
export const toUnique = (array: number[]): number[] => [...new Set(array)];

/**
 * Calculates the distance between two integer coordinates by rounding to the nearest integers.
 * @param {number} x - The x-coordinate of the first point.
 * @param {number} y - The y-coordinate of the second point.
 * @returns {number} - The absolute distance between the rounded points.
 */
export const distance = (x: number, y: number): number => Math.abs(Math.round(x) - Math.round(y));

/**
 * Flattens a multi-line array of points into a single array of points.
 * @param {MultiLine} array - The multi-line array.
 * @returns {Point[]} - A flat array of points.
 */
export const toFlat = (array: MultiLine): Point[] => ([] as Point[]).concat(...array);

/**
 * Converts a multi-line array into arrays of unique x and y values.
 * @param {MultiLine} array - The multi-line array.
 * @returns {[number[], number[]]} - Arrays of unique x and y values.
 */
export const toArrays = (array: MultiLine): [number[], number[]] => {
  const rangeX: number[] = [];
  const rangeY: number[] = [];

  toFlat(array).forEach(([x, y]) => {
    rangeX.push(x);
    rangeY.push(y);
  });

  return [toUnique(rangeX), toUnique(rangeY)];
};

/**
 * Sorts a single-line array of points in ascending order based on the x-coordinate.
 * @param {SingleLine} array - The single-line array to sort.
 * @returns {SingleLine} - The sorted array.
 */
export const toSorted = (array: SingleLine): SingleLine =>
  array.sort(([x1], [x2]) => {
    if (x1 < x2) return -1;
    if (x1 > x2) return 1;
    return 0;
  });

/**
 * Converts a number or undefined value to a point represented as an array.
 * @param {number} [x] - The x-coordinate (default: 0).
 * @param {number} [y] - The y-coordinate (default: 0).
 * @returns {Point} - The point represented as an array [x, y].
 */
export const toPoint = (x?: number, y?: number): Point => [x ?? 0, y ?? 0];

/**
 * Returns a function that converts a coordinate (x, y) to scaled plot coordinates.
 * @param {number} plotWidth - The width of the plot.
 * @param {number} plotHeight - The height of the plot.
 * @returns {function} - A function that takes (x, y) and returns scaled plot coordinates [scaledX, scaledY].
 */
export const toPlot =
  (plotWidth: number, plotHeight: number) =>
  (x: number, y: number): Point => [
    Math.round((x / plotWidth) * plotWidth),
    plotHeight - 1 - Math.round((y / plotHeight) * plotHeight),
  ];

/**
 * Returns a function that converts scaled plot coordinates (scaledX, scaledY) back to the original coordinates.
 * @param {number} plotWidth - The width of the plot.
 * @param {number} plotHeight - The height of the plot.
 * @returns {function} - A function that takes (scaledX, scaledY) and returns original coordinates [x, y].
 */
export const fromPlot =
  (plotWidth: number, plotHeight: number) =>
  (scaledX: number, scaledY: number): [number, number] => {
    const x = (scaledX / plotWidth) * plotWidth;
    const y = plotHeight - 1 - (scaledY / plotHeight) * (plotHeight - 1);
    return [Math.round(x), Math.round(y)];
  };

/**
 * Finds the maximum or minimum value in a single-line array of points.
 * @param {SingleLine} arr - The single-line array to search for extrema.
 * @param {'max' | 'min'} type - 'max' to find the maximum value, 'min' for minimum (default is 'max').
 * @param {number} position - The position of the value within each point (default is 1).
 * @returns {number} - The maximum or minimum value found in the array.
 */
export const getExtrema = (arr: SingleLine, type: 'max' | 'min' = 'max', position = 1) =>
  arr.reduce(
    (previous, curr) => Math[type](previous, curr[position]),
    type === 'max' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  );

/**
 * Finds the maximum value in an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} - The maximum value in the array.
 */
export const getMax = (arr: number[]) =>
  arr.reduce((previous, curr) => Math.max(previous, curr), Number.NEGATIVE_INFINITY);

/**
 * Finds the minimum value in an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} - The minimum value in the array.
 */
export const getMin = (arr: number[]) =>
  arr.reduce((previous, curr) => Math.min(previous, curr), Number.POSITIVE_INFINITY);

/**
 * Returns a function that scales coordinates to fit within a specified range.
 * @param {[number, number]} domain - The original value range (min and max).
 * @param {[number, number]} range - The range to scale the values into.
 * @returns {(value: number) => number} - A function for scaling coordinates.
 */
export const scaler = ([domainMin, domainMax]: number[], [rangeMin, rangeMax]: number[]) => {
  const domainLength = Math.sqrt(Math.abs((domainMax - domainMin) ** 2)) || 1;
  const rangeLength = Math.sqrt((rangeMax - rangeMin) ** 2);

  return (domainValue: number) =>
    rangeMin + (rangeLength * (domainValue - domainMin)) / domainLength;
};

/**
 * Scales a point's coordinates to fit within the specified plot dimensions.
 * @param {Point} point - The point to scale.
 * @param {number} plotWidth - The width of the plot.
 * @param {number} plotHeight - The height of the plot.
 * @param {number[]} rangeX - The range of x values.
 * @param {number[]} rangeY - The range of y values.
 * @returns {Point} - The scaled point.
 */
export const toCoordinates = (
  point: Point,
  plotWidth: number,
  plotHeight: number,
  rangeX: number[],
  rangeY: number[],
): Point => {
  const getXCoord = scaler(rangeX, [0, plotWidth - 1]);
  const getYCoord = scaler(rangeY, [0, plotHeight - 1]);

  return [Math.round(getXCoord(point[0])), Math.round(getYCoord(point[1]))];
};

/**
 * Scales a list of coordinates to fit within the specified plot dimensions.
 * @param {SingleLine} coordinates - The list of coordinates to scale.
 * @param {number} plotWidth - The width of the plot.
 * @param {number} plotHeight - The height of the plot.
 * @param {number[]} [rangeX] - The range of x values (defaults to min and max from coordinates).
 * @param {number[]} [rangeY] - The range of y values (defaults to min and max from coordinates).
 * @returns {SingleLine} - The scaled list of coordinates.
 */
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

  return coordinates.map(([x, y]) => [getXCoord(x), getYCoord(y)]);
};

/**
 * Computes the axis center point based on specified plot dimensions and ranges.
 * @param {MaybePoint} axisCenter - The center point for the axis.
 * @param {number} plotWidth - The width of the plot.
 * @param {number} plotHeight - The height of the plot.
 * @param {number[]} rangeX - The range of x values.
 * @param {number[]} rangeY - The range of y values.
 * @param {number[]} initialValue - The initial axis values.
 * @returns {Point} - The center point of the axis.
 */
export const getAxisCenter = (
  axisCenter: Point | [number | undefined, number | undefined] | undefined,
  plotWidth: number,
  plotHeight: number,
  rangeX: number[],
  rangeY: number[],
  initialValue: [number, number],
): { x: number; y: number } => {
  const axis = { x: initialValue[0], y: initialValue[1] };

  if (axisCenter) {
    const [x, y] = axisCenter;

    if (typeof x === 'number') {
      const xScaler = scaler(rangeX, [0, plotWidth - 1]);
      axis.x = Math.round(xScaler(x));
    }

    if (typeof y === 'number') {
      const yScaler = scaler(rangeY, [0, plotHeight - 1]);
      axis.y = plotHeight - Math.round(yScaler(y));
    }
  }

  return axis;
};
