import { AXIS, EMPTY } from '../constants';
import { Symbols, MultiLine, Formatter, Coordinates } from '../types';
import { toArrays, getMin, getMax, toArray } from './coords';

export const getSymbols = ({ symbols }: { symbols?: Symbols }) => {
  const axisSymbols = { ...AXIS, ...symbols?.axis };
  const emptySymbol = symbols?.empty || EMPTY;
  const backgroundSymbol = symbols?.background || emptySymbol;
  const borderSymbol = symbols?.border;
  return {
    axisSymbols,
    emptySymbol,
    backgroundSymbol,
    borderSymbol,
  };
};

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

  // set default size
  const plotWidth = width || rangeX.length;

  let plotHeight = Math.round(height || maxY - minY + 1);

  // for small values without height
  if (!height && plotHeight < 3) {
    plotHeight = rangeY.length;
  }

  return {
    minX,
    plotWidth,
    plotHeight,
    expansionX,
    expansionY,
  };
};

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

  // calculate shift for x and y labels, take the longest number
  // but first format it properly because it can be trimmed
  const formattedMinX = transformLabel(minX, {
    axis: 'x',
    xRange: expansionX,
    yRange: expansionY,
  });

  // first x0 label might be longer than the yShift
  // -2 is for the symbol.nse and symbol.x - at least two places for the label
  const x0Shift = toArray(formattedMinX).length - 2;
  const yShift = Math.max(x0Shift, longestY);

  return {
    xShift,
    yShift,
  };
};

export const getInput = ({ rawInput }: { rawInput: Coordinates }) => {
  // Multiline
  let input = rawInput;

  // Singleline
  if (typeof input[0]?.[0] === 'number') {
    input = [rawInput] as MultiLine;
  }
  return input as MultiLine;
};
