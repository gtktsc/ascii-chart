import { getSymbols, getLabelShift, getInput, getChartSize, getLegendData } from '../../services/defaults';
import { AXIS, EMPTY, POINT, THRESHOLDS } from '../../constants';
import { Coordinates, MultiLine, Symbols } from '../../types';

describe('Chart Helper Functions', () => {
  describe('getLegendData', () => {
    const input = [
      [
        [1, 2],
        [3, 4],
      ],
      [
        [5, 6],
        [7, 8],
      ],
    ] as MultiLine;

    const points = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    const thresholds = [{ x: 5 }, { y: 6 }];

    it('normalizes string inputs to arrays', () => {
      const result = getLegendData({
        input,
        points,
        thresholds,
        dataSeries: 'S',
        pointsSeries: 'P',
        thresholdsSeries: 'T',
      });

      expect(result.series).toEqual(['S', '']);
      expect(result.points).toEqual(['P', '']);
      expect(result.thresholds).toEqual(['T', '']);
    });

    it('pads short legend arrays with empty strings', () => {
      const result = getLegendData({
        input,
        points,
        thresholds,
        dataSeries: ['A'],
        pointsSeries: ['X'],
        thresholdsSeries: ['T1'],
      });

      expect(result.series).toEqual(['A', '']);
      expect(result.points).toEqual(['X', '']);
      expect(result.thresholds).toEqual(['T1', '']);
    });

    it('trims long legend arrays', () => {
      const result = getLegendData({
        input,
        points,
        thresholds,
        dataSeries: ['S1', 'S2', 'S3'],
        pointsSeries: ['P1', 'P2', 'P3'],
        thresholdsSeries: ['T1', 'T2', 'T3'],
      });

      expect(result.series).toEqual(['S1', 'S2']);
      expect(result.points).toEqual(['P1', 'P2']);
      expect(result.thresholds).toEqual(['T1', 'T2']);
    });

    it('returns empty arrays if series are not provided', () => {
      const result = getLegendData({
        input,
        points,
        thresholds,
      });

      expect(result.series).toEqual([]);
      expect(result.points).toEqual([]);
      expect(result.thresholds).toEqual([]);
    });

    it('returns empty arrays when input data is missing', () => {
      const result = getLegendData({
        input,
        dataSeries: undefined,
        pointsSeries: undefined,
        thresholdsSeries: undefined,
      });

      expect(result).toEqual({
        series: [],
        points: [],
        thresholds: [],
      });
    });
  });

  describe('getSymbols', () => {
    it('should return default symbols when none are provided', () => {
      const symbols = getSymbols({});
      expect(symbols).toEqual({
        axisSymbols: AXIS,
        emptySymbol: EMPTY,
        backgroundSymbol: EMPTY,
        borderSymbol: undefined,
        thresholdSymbols: {
          x: THRESHOLDS.x,
          y: THRESHOLDS.y,
        },
        pointSymbol: POINT,
      });
    });

    it('should override default symbols when provided', () => {
      const customSymbols: Symbols = {
        axis: { x: 'X', y: 'Y' },
        empty: '-',
        background: '=',
        border: '#',
        thresholds: {
          x: 'X',
          y: 'Y',
        },
        point: 'o',
      };

      const symbols = getSymbols({ symbols: customSymbols });
      expect(symbols).toEqual({
        axisSymbols: { ...AXIS, ...customSymbols.axis },
        emptySymbol: customSymbols.empty,
        backgroundSymbol: customSymbols.background,
        borderSymbol: customSymbols.border,
        thresholdSymbols: customSymbols.thresholds,
        pointSymbol: customSymbols.point,
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
        minY: 2,
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
        minY: 2,
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
        minY: 2,
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
        minY: -2,
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
        showTickLabel: false,
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
