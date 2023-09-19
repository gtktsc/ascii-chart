import { getSymbols, getLabelShift, getInput, getChartSize } from '../defaults';
import { AXIS, EMPTY } from '../../constants';
import { Coordinates, MultiLine } from '../../types';

describe('Chart Helper Functions', () => {
  describe('getSymbols', () => {
    it('should return default symbols when none are provided', () => {
      const symbols = getSymbols({});
      expect(symbols).toEqual({
        axisSymbols: AXIS,
        emptySymbol: EMPTY,
        backgroundSymbol: EMPTY,
        borderSymbol: undefined,
      });
    });

    it('should override default symbols when provided', () => {
      const customSymbols = {
        axis: { x: 'X', y: 'Y' },
        empty: '-',
        background: '=',
        border: '#',
      };
      const symbols = getSymbols({ symbols: customSymbols });
      expect(symbols).toEqual({
        axisSymbols: { ...AXIS, ...customSymbols.axis },
        emptySymbol: customSymbols.empty,
        backgroundSymbol: customSymbols.background,
        borderSymbol: customSymbols.border,
      });
    });
  });

  describe('getChartSize', () => {
    it('should return default sizes when width and height are not provided', () => {
      const input: MultiLine = [
        [
          [1, 2],
          [2, 4],
          [3, 6],
        ],
      ];
      const size = getChartSize({ input });
      expect(size).toEqual({
        minX: 1,
        plotWidth: 3, // length of rangeX
        plotHeight: 5, // maxY - minY + 1
        expansionX: [1, 3],
        expansionY: [2, 6],
      });
    });

    it('should use provided width and height', () => {
      const input: MultiLine = [
        [
          [1, 2],
          [2, 4],
          [3, 6],
        ],
      ];

      const size = getChartSize({ input, width: 10, height: 10 });
      expect(size).toEqual({
        minX: 1,
        plotWidth: 10,
        plotHeight: 10,
        expansionX: [1, 3],
        expansionY: [2, 6],
      });
    });

    it('should adjust for small values without height', () => {
      const input: MultiLine = [
        [
          [1, 2],
          [2, 4],
        ],
      ];
      const size = getChartSize({ input });
      expect(size).toEqual({
        minX: 1,
        plotWidth: 2, // length of rangeX
        plotHeight: 3, // length of rangeY since it's less than 3 without provided height
        expansionX: [1, 2],
        expansionY: [2, 4],
      });
    });

    it('should handle a mix of positive and negative values', () => {
      const input: MultiLine = [
        [
          [-3, -2],
          [-2, 4],
          [0, 0],
          [3, -1],
        ],
      ];
      const size = getChartSize({ input });
      expect(size).toEqual({
        minX: -3,
        plotWidth: 4, // length of rangeX
        plotHeight: 7, // maxY - minY + 1
        expansionX: [-3, 3],
        expansionY: [-2, 4],
      });
    });
  });

  describe('getLabelShift', () => {
    it('should calculate label shifts correctly', () => {
      const input: MultiLine = [
        [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
      ];
      const transformLabel = (value: number) => value.toString();
      const result = getLabelShift({
        input,
        transformLabel,
        expansionX: [1, 5],
        expansionY: [2, 6],
        minX: 1,
      });

      expect(result.xShift).toBe(1);
      expect(result.yShift).toBe(1);
    });
  });

  describe('getInput', () => {
    it('should convert singleline input to multiline', () => {
      const input: Coordinates = [
        [1, 2],
        [3, 4],
      ];
      const result = getInput({ rawInput: input });
      expect(result).toEqual([input]);
    });

    it('should keep multiline input unchanged', () => {
      const input: MultiLine = [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ];
      const result = getInput({ rawInput: input });
      expect(result).toEqual(input);
    });
  });
});
