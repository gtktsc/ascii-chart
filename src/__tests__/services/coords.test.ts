import { Point, SingleLine } from '../../types/index';
import {
  toCoordinates,
  fromPlot,
  scaler,
  getExtrema,
  getPlotCoords,
  toSorted,
  toEmpty,
  normalize,
  padOrTrim,
} from '../../services/coords';

describe('normalize', () => {
  it('should return empty array for undefined input', () => {
    expect(normalize(undefined)).toEqual([]);
  });

  it('should wrap string input in an array', () => {
    expect(normalize('hello')).toEqual(['hello']);
  });

  it('should return array as-is if input is already an array', () => {
    expect(normalize(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });
});

describe('padOrTrim', () => {
  it('should return the same array if already correct length', () => {
    const input = ['a', 'b', 'c'];
    expect(padOrTrim(input, 3)).toEqual(['a', 'b', 'c']);
  });

  it('should trim the array if it is too long', () => {
    const input = ['a', 'b', 'c', 'd'];
    expect(padOrTrim(input, 2)).toEqual(['a', 'b']);
  });

  it('should pad the array with empty strings if too short', () => {
    const input = ['a'];
    expect(padOrTrim(input, 3)).toEqual(['a', '', '']);
  });

  it('should return an array of empty strings if original is empty', () => {
    expect(padOrTrim([], 3)).toEqual(['', '', '']);
  });

  it('should return an empty array if target length is 0', () => {
    expect(padOrTrim(['a', 'b'], 0)).toEqual([]);
  });
});

describe('toCoordinates', () => {
  const plotWidth = 10;
  const plotHeight = 10;

  it('should scale point to coordinates within the plot dimensions', () => {
    const rangeX = [0, 100];
    const rangeY = [0, 100];
    const point: Point = [50, 50];

    const [x, y] = toCoordinates(point, plotWidth, plotHeight, rangeX, rangeY);
    expect(x).toBeCloseTo(5); // midpoint of rangeX scaled to plot width
    expect(y).toBeCloseTo(5); // midpoint of rangeY scaled to plot height
  });

  it('should handle a point at the origin', () => {
    const rangeX = [0, 100];
    const rangeY = [0, 100];
    const point: Point = [0, 0];

    const [x, y] = toCoordinates(point, plotWidth, plotHeight, rangeX, rangeY);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
  });

  it('should handle a point at the maximum range', () => {
    const rangeX = [0, 100];
    const rangeY = [0, 100];
    const point: Point = [100, 100];

    const [x, y] = toCoordinates(point, plotWidth, plotHeight, rangeX, rangeY);
    expect(x).toBeCloseTo(plotWidth - 1);
    expect(y).toBeCloseTo(plotHeight - 1);
  });

  it('should correctly map a point with negative coordinates', () => {
    const rangeX = [-50, 50];
    const rangeY = [-50, 50];
    const point: Point = [0, 0];

    const [x, y] = toCoordinates(point, plotWidth, plotHeight, rangeX, rangeY);
    expect(x).toBeCloseTo(5); // midpoint of plot width
    expect(y).toBeCloseTo(5); // midpoint of plot height
  });

  it('should map fractional points accurately', () => {
    const rangeX = [0, 1];
    const rangeY = [0, 1];
    const point: Point = [0.5, 0.5];

    const [x, y] = toCoordinates(point, plotWidth, plotHeight, rangeX, rangeY);
    expect(x).toBeCloseTo(5);
    expect(y).toBeCloseTo(5);
  });
});

describe('fromPlot', () => {
  const plotWidth = 10;
  const plotHeight = 10;
  const reverseCoords = fromPlot(plotWidth, plotHeight);

  it('should correctly convert scaled coordinates at (0, 0)', () => {
    const [x, y] = reverseCoords(0, 0);
    expect(x).toBe(0);
    expect(y).toBe(9);
  });

  it('should correctly convert scaled coordinates at maximum width and height', () => {
    const [x, y] = reverseCoords(10, 10);
    expect(x).toBe(10);
    expect(y).toBe(0);
  });

  it('should correctly convert scaled coordinates at midpoint', () => {
    const [x, y] = reverseCoords(5, 5);
    expect(x).toBe(5);
    expect(y).toBe(5);
  });

  it('should handle non-integer scaled coordinates', () => {
    const [x, y] = reverseCoords(7.5, 2.5);
    expect(x).toBe(8);
    expect(y).toBe(7);
  });
});

describe('getPlotCoords', () => {
  describe.each([
    [
      'returns proper data',
      [
        [0, 0],
        [1, 1],
      ],
      2,
      2,
      [
        [0, 0],
        [1, 1],
      ],
    ],
    [
      'scales data',
      [
        [0, 0],
        [1, 1],
      ],
      4,
      4,
      [
        [0, 0],
        [3, 3],
      ],
    ],
    [
      'returns proper range',
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      6,
      6,
      [
        [0, 0],
        [2.5, 2.5],
        [5, 5],
      ],
    ],
  ])('', (variant, coords, width, height, output) => {
    it(variant, () => {
      expect(getPlotCoords(coords as SingleLine, width, height)).toStrictEqual(output);
    });
  });
});

describe('scaler', () => {
  describe.each([
    ['picks right range', [0, 1], [1, 1], 0, 1],
    ['picks right range with negative values', [-1, 1], [0, 100], -1, 0],
    ['picks right domain and range', [-1, 1], [-100, 100], -1, -100],
    ['picks right domain and range with negatives', [0, 10], [-100, 0], 10, 0],
    ['picks right domain and range from zero', [-1, 0], [-100, 100], 0, 100],
    ['picks right values from the range', [-1, 1], [-100, 100], 0.5, 50],
    ['picks right negative values', [0, 1], [-100, 0], 0.5, -50],
    ['picks fractional range', [0, 1], [0, 3], 0.5, 1.5],
  ])('', (variant, domain, range, input, output) => {
    it(variant, () => {
      expect(scaler(domain as number[], range as number[])(input)).toBe(output);
    });
  });
});

describe('getExtrema', () => {
  describe.each([
    [
      'gets max value',
      [
        [0, 1],
        [1, 1],
        [4, 1],
        [2, 1],
      ],
      'max',
      0,
      4,
    ],
    [
      'gets max value with negative values',
      [
        [-1, 1],
        [1.3, 1],
        [4, 1],
        [0, 1],
      ],
      'max',
      0,
      4,
    ],
    [
      'gets min value',
      [
        [-1, 1],
        [1.3, 1],
        [4, 1],
        [0, 1],
      ],
      'min',
      0,
      -1,
    ],
    [
      'gets min value from second row when all values are equal',
      [
        [-1, 1],
        [1.3, 1],
        [1, 1],
        [0, 1],
      ],
      'min',
      1,
      1,
    ],
    [
      'gets max value from second row',
      [
        [-1, 1],
        [1.3, 10],
        [1, -10],
        [0, 100],
      ],
      'max',
      1,
      100,
    ],
  ])('', (variant, arr, type, position, output) => {
    it(variant, () => {
      expect(getExtrema(arr as SingleLine, type as 'min' | 'max', position)).toBe(output);
    });
  });
});

describe('toSorted', () => {
  describe.each([
    [
      'picks keeps the same range',
      [
        [0, 1],
        [1, 1],
      ],
      [
        [0, 1],
        [1, 1],
      ],
    ],
    [
      'inverts range',
      [
        [1, 1],
        [0, 1],
      ],
      [
        [0, 1],
        [1, 1],
      ],
    ],
    [
      'keep same values in place',
      [
        [0, 1],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
    ],
  ])('', (variant, arr, output) => {
    it(variant, () => {
      expect(toSorted(arr as SingleLine)).toStrictEqual(output);
    });
  });
});
describe('toEmpty', () => {
  it('should return an empty array of the specified size', () => {
    const size = 5;
    const result = toEmpty(size, '');
    expect(result).toHaveLength(size);
    expect(result.every((item) => item === '')).toBe(true);
  });

  it('should return an array filled with the specified empty string', () => {
    const size = 3;
    const emptyString = 'X';
    const result = toEmpty(size, emptyString);
    expect(result).toHaveLength(size);
    expect(result.every((item) => item === emptyString)).toBe(true);
  });

  it('should return an empty array when size is 0', () => {
    const size = 0;
    const result = toEmpty(size);
    expect(result).toHaveLength(size);
  });

  it('should return an empty array when size is negative', () => {
    const size = -5;
    const result = toEmpty(size);
    expect(result).toHaveLength(0);
  });
});
