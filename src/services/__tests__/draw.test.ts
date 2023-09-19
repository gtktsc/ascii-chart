import {
  drawXAxisEnd,
  drawYAxisEnd,
  drawAxis,
  drawGraph,
  drawChart,
  drawCustomLine,
  drawLine,
  drawShift,
} from '../draw';
import { AXIS, CHART } from '../../constants';
import { MultiLine, Point } from '../../types';

describe('Drawing functions', () => {
  describe('drawXAxisEnd', () => {
    it('should draw the X-axis end correctly', () => {
      const graph = [
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
      ];
      const args = {
        hasPlaceToRender: true,
        yPos: 1,
        graph,
        yShift: 1,
        i: 0,
        scaledX: 1,
        shift: 0,
        signShift: 0,
        axisSymbols: AXIS,
        pointXShift: ['1'],
      };
      drawXAxisEnd(args);
      expect(graph[0][4]).toEqual('1');
      expect(graph[1][4]).toEqual(AXIS.x);
    });
    it('should draw Y axis end', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const params = {
        graph,
        scaledY: 1,
        yShift: 0,
        axis: { x: 0, y: 0 },
        pointY: 1,
        transformLabel: (value: number) => value.toString(),
        axisSymbols: { y: 'Y' },
        expansionX: [0],
        expansionY: [0, 1, 2],
      };

      drawYAxisEnd(params);
      expect(graph[2][1]).toBe('Y');
    });
  });

  describe('drawYAxisEnd', () => {
    it('should draw the Y-axis end correctly', () => {
      const graph = [
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
      ];
      const args = {
        graph,
        scaledY: 1,
        yShift: 1,
        axis: { x: 1, y: 1 },
        pointY: 2,
        transformLabel: (value: number) => value.toString(),
        axisSymbols: AXIS,
        expansionX: [],
        expansionY: [],
      };
      drawYAxisEnd(args);
      expect(graph[2][3]).toEqual(AXIS.y);
      expect(graph[2][2]).toEqual('2');
    });
  });

  describe('drawAxis', () => {
    it('should draw the main axis', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const args = {
        graph,
        axis: { x: 1, y: 1 },
        axisSymbols: AXIS,
      };
      drawAxis(args);
      expect(graph[0][1]).toEqual(AXIS.n);
      expect(graph[1][1]).toEqual(AXIS.ns);
      expect(graph[2][1]).toEqual(AXIS.nse);
    });
  });

  describe('drawGraph', () => {
    it('should draw an empty graph correctly', () => {
      const result = drawGraph({
        plotWidth: 3,
        plotHeight: 2,
        emptySymbol: ' ',
      });
      expect(result).toEqual([
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
      ]);
    });
  });

  describe('drawChart', () => {
    it('should return the graph as a string', () => {
      const graph = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i'],
      ];
      const result = drawChart({ graph });
      expect(result).toEqual('\nabc\ndef\nghi\n');
    });
  });

  describe('drawCustomLine', () => {
    it('should draw a custom line', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const args = {
        sortedCoords: [[1, 1]] as Point[],
        scaledX: 1,
        scaledY: 1,
        input: [[1, 1]] as unknown as MultiLine,
        index: 0,
        lineFormatter: () => ({ x: 1, y: 1, symbol: 'X' }),
        graph,
      };
      drawCustomLine(args);
      expect(graph[1][1]).toEqual('X');
    });
  });

  describe('drawLine', () => {
    it('should draw a line', () => {
      const graph = [
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
      ];
      const args = {
        index: 1,
        arr: [
          [0, 0],
          [1, 1],
        ] as Point[],
        graph,
        scaledX: 1,
        scaledY: 1,
        plotHeight: 3,
        emptySymbol: ' ',
        chartSymbols: CHART,
      };
      drawLine(args);
      expect(graph[3][1]).toEqual('┛');
      expect(graph[2][2]).toEqual('━');
      expect(graph[3][2]).toEqual(' ');
    });
  });

  describe('drawShift', () => {
    it('should shift the graph', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const result = drawShift({
        graph,
        plotWidth: 2,
        emptySymbol: ' ',
        scaledCoords: [
          [0, 0],
          [1, 1],
        ],
        xShift: 1,
        yShift: 1,
      });
      expect(result.hasToBeMoved).toBe(false);
    });
  });
});
