import { AXIS, EMPTY, POINT, THRESHOLDS } from '../constants';
import { Symbols, MultiLine, Formatter, Coordinates, GraphPoint, Threshold } from '../types';
import { toArrays, getMin, getMax, toArray, padOrTrim, normalize } from './coords';

/**
 * Merges custom symbols with default axis symbols and defines plot symbols.
 * @param {object} options - An object containing optional custom symbols.
 * @param {Symbols} options.symbols - Custom symbols for the plot.
 * @returns {object} - Object containing the merged axis symbols, and defined symbols for empty, background, and border.
 */
export const getSymbols = ({ symbols }: { symbols?: Symbols }) => {
  const emptySymbol = symbols?.empty || EMPTY;
  return {
    axisSymbols: { ...AXIS, ...symbols?.axis },
    emptySymbol,
    backgroundSymbol: symbols?.background || emptySymbol,
    borderSymbol: symbols?.border,
    thresholdSymbols: {
      x: symbols?.thresholds?.x || THRESHOLDS.x,
      y: symbols?.thresholds?.y || THRESHOLDS.y,
    },
    pointSymbol: symbols?.point || POINT,
  };
};

/**
 * Determines plot size and range based on provided data and dimensions.
 * @param {object} options - An object containing input data and optional dimensions.
 * @param {MultiLine} options.input - The multiline array of points.
 * @param {number} [options.width] - Optional width of the plot.
 * @param {number} [options.height] - Optional height of the plot.
 * @param {[number, number]} [options.yRange] - Optional range for the y-axis.
 * @returns {object} - Object containing min x value, plot width, plot height, and x and y expansions.
 */
export const getChartSize = ({
  input,
  width,
  height,
  yRange,
}: {
  input: MultiLine;
  width?: number;
  height?: number;
  yRange?: [number, number];
}) => {
  const [rangeX, rangeY] = toArrays(input);

  const minX = getMin(rangeX);
  const maxX = getMax(rangeX);
  const minY = getMin(rangeY);
  const maxY = getMax(rangeY);

  const expansionX = [minX, maxX];
  const expansionY = yRange || [minY, maxY];

  // Set default plot dimensions if not provided
  const plotWidth = width || rangeX.length;

  let plotHeight = Math.round(height || maxY - minY + 1);

  // Adjust plot height for small value ranges if no height is provided
  if (!height && plotHeight < 3) {
    plotHeight = rangeY.length;
  }

  return {
    minX,
    minY,
    plotWidth,
    plotHeight,
    expansionX,
    expansionY,
  };
};

/**
 * Calculates shifts for x and y labels, based on the longest label length.
 * @param {object} options - The input data and formatting options.
 * @param {MultiLine} options.input - The multiline array of points.
 * @param {Formatter} options.transformLabel - A function to transform label values.
 * @param {number[]} options.expansionX - The x-axis range.
 * @param {number[]} options.expansionY - The y-axis range.
 * @param {number} options.minX - The minimum x value for label calculation.
 * @returns {object} - Object containing the calculated xShift and yShift.
 */
export const getLabelShift = ({
  input,
  transformLabel,
  expansionX,
  expansionY,
  minX,
}: {
  input: MultiLine;
  transformLabel: Formatter;
  expansionX: number[];
  expansionY: number[];
  minX: number;
}) => {
  let xShift = 0;
  let longestY = 0;

  // Find the longest labels for x and y axes
  input.forEach((current) => {
    current.forEach(([pointX, pointY]) => {
      xShift = Math.max(
        toArray(
          transformLabel(pointX, {
            axis: 'x',
            xRange: expansionX,
            yRange: expansionY,
          }),
        ).length,
        xShift,
      );

      longestY = Math.max(
        toArray(
          transformLabel(pointY, {
            axis: 'y',
            xRange: expansionX,
            yRange: expansionY,
          }),
        ).length,
        longestY,
      );
    });
  });

  // Calculate shift for x and y labels based on the longest formatted label
  const formattedMinX = transformLabel(minX, {
    axis: 'x',
    xRange: expansionX,
    yRange: expansionY,
  });

  // Adjust x-axis shift; -2 ensures space for labels and axis symbols
  const x0Shift = toArray(formattedMinX).length - 2;
  const yShift = Math.max(x0Shift, longestY);

  return {
    xShift,
    yShift,
  };
};

/**
 * Normalizes raw input data into a consistent multi-line format.
 * @param {object} options - Contains the raw input data.
 * @param {Coordinates} options.rawInput - Input coordinates, either single or multi-line.
 * @returns {MultiLine} - The formatted data as a multi-line array of points.
 */
export const getInput = ({ rawInput }: { rawInput: Coordinates }) => {
  let input = rawInput;

  // Convert single-line data to a multi-line format if needed
  if (typeof input[0]?.[0] === 'number') {
    input = [rawInput] as MultiLine;
  }

  return input as MultiLine;
};

/**
 * Generates legend data based on the provided points, thresholds, and series.
 * @param {object} options - Contains points, thresholds, and series data.
 * @param {Coordinates} options.points - The coordinates of the points.
 * @param {THRESHOLDS} options.thresholds - The thresholds for the plot.
 * @param {string[]} options.series - The series names for the plot.
 * @param {string[]} options.pointsSeries - The series names for the points.
 * @param {string[]} options.thresholdsSeries - The series names for the thresholds.
 * @param {string[]} options.dataSeries - The series names for the data.
 * @param {MultiLine} options.input - The input data for the plot.
 * @returns {object} - Object containing the series, points, and thresholds for the legend.
 *
 */
export const getLegendData = ({
  input,
  thresholds,
  points,
  pointsSeries,
  thresholdsSeries,
  dataSeries,
}: {
  input: MultiLine;
  points?: GraphPoint[];
  thresholds?: Threshold[];
  pointsSeries?: string[] | string;
  thresholdsSeries?: string[] | string;
  dataSeries?: string[] | string;
}) => {
  const legendSeries = dataSeries && input ? padOrTrim(normalize(dataSeries), input.length) : [];

  const legendPoints =
    pointsSeries && points ? padOrTrim(normalize(pointsSeries), points.length) : [];

  const legendThresholds =
    thresholdsSeries && thresholds ? padOrTrim(normalize(thresholdsSeries), thresholds.length) : [];

  return {
    series: legendSeries,
    points: legendPoints,
    thresholds: legendThresholds,
  };
};
