import {
  setTitle,
  addXLable,
  addYLabel,
  addLegend,
  addBorder,
  addBackgroundSymbol,
  addThresholds,
  setFillArea,
  removeEmptyLines,
  getTransformLabel,
  addPoints,
} from '../../services/overrides';
import { CHART, EMPTY, THRESHOLDS, POINT } from '../../constants';
import { Formatter, FormatterHelpers, Graph, Legend, Threshold, GraphPoint } from '../../types';

describe('Graph Utility Functions', () => {
  let graph: Graph = [];
  let defaultGraph: Graph = [];
  const backgroundSymbol = EMPTY;
  const plotWidth = 10;
  const plotHeight = 8;
  const yShift = 2;
  const thresholdSymbols = {
    x: THRESHOLDS.x,
    y: THRESHOLDS.y,
  };
  const expansionX = [0, plotWidth];
  const expansionY = [0, plotHeight];

  beforeEach(() => {
    defaultGraph = Array.from({ length: plotHeight }, () =>
      Array(plotWidth).fill(backgroundSymbol),
    );
    graph = Array.from({ length: plotHeight }, () => Array(plotWidth).fill(backgroundSymbol));
  });

  describe('addPoints', () => {
    const pointSymbol = POINT;

    it('should add a single point to the graph', () => {
      const points: GraphPoint[] = [{ x: 5, y: 5 }];
      addPoints({
        graph,
        points,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
        pointSymbol,
      });

      const flattened = graph.flat().join('');
      expect(flattened).toContain(pointSymbol);
    });

    it('should add multiple points to the graph', () => {
      const points: GraphPoint[] = [
        { x: 1, y: 1 },
        { x: 3, y: 3 },
        { x: 8, y: 8 },
      ];

      addPoints({
        graph,
        points,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
        pointSymbol: 'A',
      });

      expect(graph[1][8]).toBe('A');
      expect(graph[5][4]).toBe('A');
      expect(graph[7][2]).toBe('A');
    });

    it('should not fail for empty points array', () => {
      expect(() =>
        addPoints({
          graph,
          points: [],
          plotWidth,
          plotHeight,
          expansionX,
          expansionY,
          pointSymbol,
        }),
      ).not.toThrow();
    });

    it('should respect graph boundaries', () => {
      const points: GraphPoint[] = [{ x: 100, y: 100 }];
      addPoints({
        graph,
        points,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
        pointSymbol,
      });

      const flattened = graph.flat().join('');
      expect(flattened).not.toContain(pointSymbol); // point is outside
    });
  });

  describe('setTitle', () => {
    it('should set the title correctly', () => {
      const title = 'TestTitle';

      setTitle({ title, graph, backgroundSymbol, plotWidth, yShift });

      expect(graph[0].join('')).toContain(title);
    });
  });

  describe('addXLable', () => {
    it('should add the xLabel correctly', () => {
      const xLabel = 'XLabel';

      addXLable({ xLabel, graph, backgroundSymbol, plotWidth, yShift });

      expect(graph[graph.length - 1].join('')).toContain(xLabel);
    });
  });
  describe('addYLabel', () => {
    it('should add the yLabel correctly', () => {
      const yLabel = 'YLabel';
      addYLabel({ yLabel, graph, backgroundSymbol });

      const firstCol = graph.map((row) => row[0]).join('');
      expect(firstCol).toContain(yLabel);
    });
  });

  describe('addLegend', () => {
    it('should add the legend correctly', () => {
      const legend = { position: 'top', series: ['A', 'B'] } as Legend;

      addLegend({
        pointSymbol: 'A',
        legend,
        graph,
        backgroundSymbol,
        input: [[]],
      });

      expect(graph[0].join('')).toContain('A');
      expect(graph[1].join('')).toContain('B');
    });
    const baseOptions = {
      pointSymbol: '•',
      backgroundSymbol: '.',
      input: [[]],
    };

    it('adds top legend correctly with series only', () => {
      const legend: Legend = { position: 'top', series: ['S1', 'S2'] };
      const graph: Graph = Array(3)
        .fill(null)
        .map(() => Array(10).fill('.'));

      addLegend({ ...baseOptions, legend, graph });

      expect(graph[0].join('')).toContain('S1');
      expect(graph[1].join('')).toContain('S2');
    });

    it('adds bottom legend with points and thresholds', () => {
      const legend: Legend = {
        position: 'bottom',
        series: ['S'],
        points: ['P1'],
        thresholds: ['T1'],
      };
      const graph: Graph = Array(3)
        .fill(null)
        .map(() => Array(10).fill('.'));
      const thresholds = [{ x: 1, color: 'ansiBlue' }] as Threshold[];
      const points = [{ x: 2, y: 1, color: 'ansiRed' }] as GraphPoint[];

      addLegend({ ...baseOptions, legend, graph, thresholds, points });

      const bottom = graph
        .slice(-3)
        .map((row) => row.join(''))
        .join('\n');
      expect(bottom).toMatch(/S/);
      expect(bottom).toMatch(/T1/);
      expect(bottom).toMatch(/P1/);
    });

    it('adds left legend with spacers between types', () => {
      const legend: Legend = {
        position: 'left',
        series: ['S'],
        thresholds: ['T'],
        points: ['P'],
      };
      const graph: Graph = Array(10)
        .fill(null)
        .map(() => Array(10).fill('.'));

      addLegend({ ...baseOptions, legend, graph });

      const left = graph.map((row) => row.slice(0, 6).join('')).join('\n');
      expect(left).toMatch(/S/);
      expect(left).toMatch(/T/);
      expect(left).toMatch(/P/);
      expect(left).toMatch(/\n\.+\n/); // spacer
    });

    it('adds right legend and does not overwrite chart content', () => {
      const legend: Legend = {
        position: 'right',
        series: ['R1', 'R2'],
      };
      const graph: Graph = Array(5)
        .fill(null)
        .map(() => Array(10).fill('.'));
      graph[2][5] = 'X'; // Simulate chart content

      addLegend({ ...baseOptions, legend, graph });

      expect(graph[2][5]).toBe('X'); // Unchanged
      const right = graph.map((row) => row.slice(-5).join('')).join('\n');
      expect(right).toMatch(/R1/);
      expect(right).toMatch(/R2/);
    });
  });

  describe('addBorder', () => {
    it('should add the border correctly', () => {
      const borderSymbol = '#';

      addBorder({ graph, borderSymbol, backgroundSymbol });

      expect(graph[0][0]).toBe(borderSymbol);
      expect(graph[0][graph[0].length - 1]).toBe(borderSymbol);
      expect(graph[graph.length - 1][0]).toBe(borderSymbol);
      expect(graph[graph.length - 1][graph[0].length - 1]).toBe(borderSymbol);
    });
  });

  describe('addBackgroundSymbol', () => {
    it('should replace empty symbols with background symbols', () => {
      const emptySymbol = ' ';
      graph[1][1] = emptySymbol;

      addBackgroundSymbol({ graph, backgroundSymbol, emptySymbol });

      expect(graph[1][1]).toBe(backgroundSymbol);
    });
  });

  describe('addThresholds', () => {
    it('should add thresholds correctly', () => {
      const thresholds = [{ x: 2, color: 'ansiRed' }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({
        thresholdSymbols,
        graph,
        thresholds,
        axis,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
      });
      expect(graph[2][3]).toContain(CHART.ns);
    });
    it('should add thresholds correctly - y', () => {
      const thresholds = [{ y: 5 }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({
        thresholdSymbols,
        graph,
        thresholds,
        axis,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
      });

      expect(graph[5]).toEqual(Array(plotWidth).fill(CHART.we));
    });
    it('should add color', () => {
      const thresholds = [{ x: 1, y: 2, color: 'ansiBlue' }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({
        thresholdSymbols,
        graph,
        thresholds,
        axis,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
      });

      expect(graph[2].join('')).toContain('\u001b[34m');
    });
    it('should add two thresholds ', () => {
      const thresholds = [
        { x: 2, color: 'ansiBlue' },
        { x: 3, color: 'ansiRed' },
      ] as Threshold[];

      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({
        thresholdSymbols,
        graph,
        thresholds,
        axis,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
      });
      expect(graph[0][3]).toContain('\u001b[34m');
      expect(graph[0][4]).toContain('\u001b[31m');
    });

    it('should not add color if not set', () => {
      const thresholds = [{ x: 1, y: 2 }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({
        thresholdSymbols,
        graph,
        thresholds,
        axis,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
      });

      expect(graph[2].join('')).not.toContain('\u001b[0m');
    });
    it('should not add color if not set', () => {
      const thresholds = [{ x: undefined }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({
        thresholdSymbols,
        graph,
        thresholds,
        axis,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
      });

      expect(graph).toEqual(defaultGraph);
    });

    it('should not add thresholds if its outside - x', () => {
      const thresholds = [{ x: 100, color: 'ansiRed' }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({
        thresholdSymbols,
        graph,
        thresholds,
        axis,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
      });
      expect(graph.map((line) => line.join('')).join('')).not.toContain(CHART.ns);
    });
    it('should not add thresholds if its outside - y', () => {
      const thresholds = [{ y: 100, color: 'ansiRed' }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({
        thresholdSymbols,
        graph,
        thresholds,
        axis,
        plotWidth,
        plotHeight,
        expansionX,
        expansionY,
      });
      expect(graph.map((line) => line.join('')).join('')).not.toContain(CHART.we);
    });
  });

  describe('setFillArea', () => {
    it('should set fill area correctly', () => {
      const chartSymbols = { nse: CHART.nse, wsn: CHART.wsn, we: CHART.we, area: 'A' };
      graph[1][1] = CHART.nse;

      setFillArea({ graph, chartSymbols });

      for (let y = 2; y < graph.length; y++) {
        expect(graph[y][1]).toBe('A');
      }
    });

    it.only('should use fill area correctly', () => {
      const chartSymbols = { nse: CHART.nse, wsn: CHART.wsn, we: CHART.we };
      graph[1][1] = CHART.nse;
      setFillArea({ graph, chartSymbols });

      for (let y = 2; y < graph.length; y++) {
        expect(graph[y][1]).toBe(CHART.area);
      }
    });
  });

  describe('removeEmptyLines', () => {
    it('should remove empty lines correctly', () => {
      const currentGraph = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i'],
        [...Array(plotWidth).fill(backgroundSymbol)],
      ];

      removeEmptyLines({ graph: currentGraph, backgroundSymbol });

      expect(currentGraph.length).toBe(3);
      expect(currentGraph).toEqual([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i'],
      ]);
    });
  });

  describe('getTransformLabel', () => {
    it('should return a formatter function', () => {
      const formatter = getTransformLabel({});

      expect(formatter).toBeInstanceOf(Function);
    });

    it('should format labels correctly with a custom formatter', () => {
      const customFormatter: Formatter = (value) => `Custom: ${value}`;
      const formatter = getTransformLabel({ formatter: customFormatter });

      expect(formatter(1, {} as FormatterHelpers)).toBe('Custom: 1');
    });
  });
});
