import { SingleLine } from '../../types';
import { scaler, getExtrema, getPlotCoords } from '../coords';

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
