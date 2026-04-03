import {
  drawXAxisEnd,
  drawXAxisTick,
  drawYAxisEnd,
  drawAxis,
  drawGraph,
  drawChart,
  drawCustomLine,
  drawLine,
  drawShift,
  drawPosition,
} from '../../services/draw';
import { AXIS, CHART } from '../../constants';
import { GraphMode, MultiLine, Point } from '../../types';

describe('Drawing functions', () => {
  describe('drawPosition', () => {
    it('should correctly draw a symbol at the specified position in the graph', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      drawPosition({ graph, scaledX: 1, scaledY: 1, symbol: 'X' });
      expect(graph[1][1]).toEqual('X');
    });

    it('should draw when debugMode is enabled and coordinates are within bounds', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      drawPosition({ graph, scaledX: 1, scaledY: 1, symbol: 'X', debugMode: true });
      expect(graph[1][1]).toEqual('X');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle out-of-bounds Y position in debug mode', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      drawPosition({ graph, scaledX: 1, scaledY: 3, symbol: 'X', debugMode: true });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Drawing at [1, 3]',
        'Error: out of bounds Y',
        expect.objectContaining({
          graph,
          scaledX: 1,
          scaledY: 3,
        }),
      );
      consoleSpy.mockRestore();
    });

    it('should handle out-of-bounds X position in debug mode', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      drawPosition({ graph, scaledX: 4, scaledY: 1, symbol: 'X', debugMode: true });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Drawing at [4, 1]',
        'Error: out of bounds X',
        expect.objectContaining({
          graph,
          scaledX: 4,
          scaledY: 1,
        }),
      );
      consoleSpy.mockRestore();
    });

    it('should handle negative out-of-bounds X position in debug mode', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      drawPosition({ graph, scaledX: -1, scaledY: 1, symbol: 'X', debugMode: true });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Drawing at [-1, 1]',
        'Error: out of bounds X',
        expect.objectContaining({
          graph,
          scaledX: -1,
          scaledY: 1,
        }),
      );
      consoleSpy.mockRestore();
    });

    it('should not log any errors if debugMode is off and out-of-bounds error occurs', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      drawPosition({ graph, scaledX: 4, scaledY: 1, symbol: 'X' });
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

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
        plotHeight: 3,
        scaledX: 1,
        shift: 0,
        signShift: 0,
        axisSymbols: AXIS,
        pointXShift: ['1'],
      };
      drawXAxisEnd(args);
      expect(graph[0][4]).toEqual('1');
    });

    it('clamps out-of-bounds X/Y to valid graph limits', () => {
      const graph = [
        [' ', ' '],
        [' ', ' '],
      ];

      drawXAxisEnd({
        hasPlaceToRender: true,
        yPos: 0,
        graph,
        yShift: 0,
        i: 0,
        scaledX: 0,
        pointXShift: ['A'],
      });

      expect(graph[0][1]).toEqual('A');
    });

    it('clamps negative X and too-large Y coordinates', () => {
      const graph = [
        [' ', ' '],
        [' ', ' '],
      ];

      drawXAxisEnd({
        hasPlaceToRender: false,
        yPos: 10,
        graph,
        yShift: 0,
        i: 5,
        scaledX: 0,
        pointXShift: ['B', 'C', 'D', 'E', 'F', 'G'],
      });

      expect(graph[1][0]).toEqual('B');
    });

    it('should draw Y axis end', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', 'A', ' '],
      ];
      const params = {
        graph,
        scaledY: 1,
        yShift: 0,
        axis: { x: 0, y: 0 },
        pointY: 1,
        plotHeight: 3,
        transformLabel: (value: number) => value.toString(),
        axisSymbols: { y: 'Y', ns: 'A', we: 'B' },
        expansionX: [0],
        expansionY: [0, 1, 2],
        coordsGetter: () => [0, 0] as Point,
        plotGetter: () => [0, 0] as Point,
      };

      drawYAxisEnd(params);

      expect(graph[2][1]).toBe('Y');
    });
  });

  describe('drawXAxisTick', () => {
    it('uses fallback AXIS.x symbol when custom tick symbol is missing', () => {
      const graph = [['|', '|', '|']];
      drawXAxisTick({
        axis: { x: 0, y: 0 },
        graph,
        xPosition: 1,
        axisSymbols: { ns: '|', we: '-' },
      });

      expect(graph[0][1]).toEqual(AXIS.x);
    });

    it('does not draw when x ticks are hidden', () => {
      const graph = [['|', '|', '|']];
      drawXAxisTick({
        axis: { x: 0, y: 0 },
        graph,
        xPosition: 1,
        axisSymbols: { ns: '|', we: '-', x: 'X' },
        hideXAxisTicks: true,
      });

      expect(graph[0][1]).toEqual('|');
    });
  });

  describe('drawYAxisEnd', () => {
    it('should draw tick labels for each step when showTickLabel is true', () => {
      const graph = [
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
      ];
      const args = {
        graph,
        scaledY: 1,
        yShift: 1,
        axis: { x: 1, y: 1 },
        pointY: 2,
        plotHeight: 4,
        transformLabel: (value: number) => value.toString(),
        axisSymbols: { y: 'Y' },
        expansionX: [0],
        expansionY: [0, 1, 2, 3],
        showTickLabel: true,
      };
      drawYAxisEnd(args);

      // Expect Y-axis labels to be drawn starting from [1][2], not [0][2]
      expect(graph[1][2]).toEqual('3'); // Top of the axis (Y value 3)
      expect(graph[2][2]).toEqual('2'); // Mid Y value (Y value 2)
      expect(graph[3][2]).toEqual('1'); // Near bottom (Y value 1)
      // The bottom Y value '0' might not be drawn, depending on the graph size
    });

    it('uses fallback AXIS.y in showTickLabel mode when custom y tick symbol is missing', () => {
      const graph = [
        [' ', '|', ' '],
        [' ', '|', ' '],
        [' ', '|', ' '],
        [' ', '|', ' '],
      ];
      drawYAxisEnd({
        graph,
        scaledY: 1,
        yShift: 0,
        axis: { x: 0, y: 1 },
        pointY: 2,
        plotHeight: 3,
        transformLabel: (value: number) => value.toString(),
        axisSymbols: { ns: '|', we: '-' },
        expansionX: [0],
        expansionY: [0, 3],
        showTickLabel: true,
      });

      expect(graph.flat().join('')).toContain(AXIS.y);
    });

    it('should draw the Y-axis end correctly', () => {
      const graph = [
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', AXIS.ns],
      ];
      const args = {
        graph,
        scaledY: 1,
        yShift: 1,
        axis: { x: 1, y: 1 },
        pointY: 2,
        plotHeight: 2,
        transformLabel: (value: number) => value.toString(),
        axisSymbols: AXIS,
        expansionX: [],
        expansionY: [],
        coordsGetter: () => [0, 0] as Point,
        plotGetter: () => [0, 0] as Point,
      };
      drawYAxisEnd(args);

      expect(graph[2][3]).toEqual(AXIS.y);
      expect(graph[2][2]).toEqual('2');
    });

    it('uses fallback AXIS.y in standard mode when custom y tick symbol is missing', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', '|', ' '],
      ];
      drawYAxisEnd({
        graph,
        scaledY: 1,
        yShift: 0,
        axis: { x: 0, y: 0 },
        pointY: 1,
        plotHeight: 3,
        transformLabel: (value: number) => value.toString(),
        axisSymbols: { ns: '|', we: '-' },
        expansionX: [0],
        expansionY: [0, 1, 2],
      });

      expect(graph[2][1]).toEqual(AXIS.y);
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

    it('draws right arrow on x-axis end', () => {
      const graph = [
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
      ];
      drawAxis({
        graph,
        axis: { x: 1, y: 1 },
        axisSymbols: AXIS,
      });

      expect(graph[1][3]).toEqual(AXIS.e);
    });

    it('respects hidden axes flags', () => {
      const graph = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ];
      drawAxis({
        graph,
        axis: { x: 1, y: 1 },
        axisSymbols: AXIS,
        hideXAxis: true,
        hideYAxis: true,
      });

      expect(graph).toEqual([
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
      ]);
    });

    it('uses fallback axis symbols when custom symbols are missing', () => {
      const graph = [
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
      ];
      drawAxis({
        graph,
        axis: { x: 1, y: 1 },
        axisSymbols: {} as typeof AXIS,
      });

      expect(graph[0][1]).toEqual(AXIS.n);
      expect(graph[1][0]).toEqual(AXIS.we);
      expect(graph[1][3]).toEqual(AXIS.e);
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
        minY: 0,
        minX: 0,
        expansionX: [0],
        expansionY: [0],
        lineFormatter: () => ({ x: 1, y: 1, symbol: 'X' }),
        toPlotCoordinates: () => [1, 1] as Point,
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
        mode: 'line' as GraphMode,
        scaledX: 1,
        axis: { x: 0, y: 5 },
        axisCenter: undefined,
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

    it('draws point mode using POINT symbol', () => {
      const graph = Array.from({ length: 4 }, () => Array(4).fill(' '));
      drawLine({
        index: 0,
        arr: [[0, 0]] as Point[],
        graph,
        mode: 'point',
        scaledX: 1,
        axis: { x: 0, y: 0 },
        axisCenter: undefined,
        scaledY: 1,
        plotHeight: 3,
        emptySymbol: ' ',
        chartSymbols: CHART,
      });

      expect(graph[2][2]).toEqual('●');
    });

    it('draws vertical bars in bar mode in both directions', () => {
      const graph = Array.from({ length: 7 }, () => Array(7).fill(' '));

      drawLine({
        index: 0,
        arr: [[0, 0]] as Point[],
        graph,
        mode: 'bar',
        scaledX: 1,
        axis: { x: 0, y: 2 },
        axisCenter: undefined,
        scaledY: 5,
        plotHeight: 6,
        emptySymbol: ' ',
        chartSymbols: {} as typeof CHART,
      });

      drawLine({
        index: 0,
        arr: [[0, 0]] as Point[],
        graph,
        mode: 'bar',
        scaledX: 3,
        axis: { x: 0, y: 4 },
        axisCenter: undefined,
        scaledY: 2,
        plotHeight: 6,
        emptySymbol: ' ',
        chartSymbols: {} as typeof CHART,
      });

      expect(graph.flat().join('')).toContain(CHART.area);
    });

    it('draws horizontal bars in horizontalBar mode in both directions', () => {
      const graph = Array.from({ length: 5 }, () => Array(8).fill(' '));

      drawLine({
        index: 0,
        arr: [[0, 0]] as Point[],
        graph,
        mode: 'horizontalBar',
        scaledX: 6,
        axis: { x: 2, y: 0 },
        axisCenter: undefined,
        scaledY: 1,
        plotHeight: 4,
        emptySymbol: ' ',
        chartSymbols: {} as typeof CHART,
      });

      drawLine({
        index: 0,
        arr: [[0, 0]] as Point[],
        graph,
        mode: 'horizontalBar',
        scaledX: 1,
        axis: { x: 4, y: 0 },
        axisCenter: undefined,
        scaledY: 2,
        plotHeight: 4,
        emptySymbol: ' ',
        chartSymbols: {} as typeof CHART,
      });

      expect(graph.flat().join('')).toContain(CHART.area);
    });

    it('uses fallback line symbols for descending segment', () => {
      const graph = Array.from({ length: 6 }, () => Array(6).fill(' '));
      drawLine({
        index: 1,
        arr: [
          [0, 3],
          [1, 1],
        ] as Point[],
        graph,
        mode: 'line',
        scaledX: 1,
        axis: { x: 0, y: 0 },
        axisCenter: undefined,
        scaledY: 1,
        plotHeight: 4,
        emptySymbol: ' ',
        chartSymbols: {} as typeof CHART,
      });

      const output = graph.flat().join('');
      expect(output).toContain(CHART.nse);
      expect(output).toContain(CHART.wns);
    });

    it('uses fallback line symbols for ascending segment', () => {
      const graph = Array.from({ length: 8 }, () => Array(8).fill(' '));
      drawLine({
        index: 1,
        arr: [
          [0, 1],
          [1, 3],
        ] as Point[],
        graph,
        mode: 'line',
        scaledX: 1,
        axis: { x: 0, y: 0 },
        axisCenter: undefined,
        scaledY: 2,
        plotHeight: 6,
        emptySymbol: ' ',
        chartSymbols: {} as typeof CHART,
      });

      const output = graph.flat().join('');
      expect(output).toContain(CHART.wsn);
      expect(output).toContain(CHART.ns);
      expect(output).toContain(CHART.sne);
    });

    it('uses fallback line symbols for equal-y horizontal segment', () => {
      const graph = Array.from({ length: 5 }, () => Array(7).fill(' '));
      drawLine({
        index: 1,
        arr: [
          [0, 1],
          [3, 1],
        ] as Point[],
        graph,
        mode: 'line',
        scaledX: 3,
        axis: { x: 0, y: 0 },
        axisCenter: undefined,
        scaledY: 1,
        plotHeight: 4,
        emptySymbol: ' ',
        chartSymbols: {} as typeof CHART,
      });

      expect(graph.flat().join('')).toContain(CHART.we);
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
