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
} from '../overrides';
import { CHART, EMPTY } from '../../constants';
import { Formatter, FormatterHelpers, Graph, Legend, Threshold } from '../../types';

describe('Graph Utility Functions', () => {
  let graph: Graph = [];
  let defaultGraph: Graph = [];
  const backgroundSymbol = EMPTY;
  const plotWidth = 10;
  const yShift = 2;

  beforeEach(() => {
    defaultGraph = Array(8).fill([...Array(plotWidth).fill(backgroundSymbol)]); // Adjusted size to 8 rows
    graph = Array(8).fill([...Array(plotWidth).fill(backgroundSymbol)]); // Adjusted size to 8 rows
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

      expect(graph[0].reverse().join('')).toContain(yLabel);
    });
  });

  describe('addLegend', () => {
    it('should add the legend correctly', () => {
      const legend = { position: 'top', series: ['A', 'B'] } as Legend;

      addLegend({ legend, graph, backgroundSymbol, input: [[]] });

      expect(graph[0].join('')).toContain('A');
      expect(graph[1].join('')).toContain('B');
    });
  });

  describe('addBorder', () => {
    it('should add the border correctly', () => {
      const borderSymbol = '#';

      addBorder({ graph, borderSymbol });

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

      addThresholds({ graph, thresholds, axis, plotWidth, plotHeight, expansionX, expansionY });
      expect(graph[2][3]).toContain(CHART.ns);
    });
    it('should add thresholds correctly - y', () => {
      const thresholds = [{ y: 5, color: 'ansiRed' }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({ graph, thresholds, axis, plotWidth, plotHeight, expansionX, expansionY });
      expect(graph[2][3]).toContain(CHART.we);
    });
    it('should add color', () => {
      const thresholds = [{ x: 1, y: 2, color: 'ansiBlue' }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({ graph, thresholds, axis, plotWidth, plotHeight, expansionX, expansionY });

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

      addThresholds({ graph, thresholds, axis, plotWidth, plotHeight, expansionX, expansionY });
      expect(graph[0][3]).toContain('\u001b[34m');
      expect(graph[0][4]).toContain('\u001b[31m');
    });

    it('should not add color if not set', () => {
      const thresholds = [{ x: 1, y: 2 }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({ graph, thresholds, axis, plotWidth, plotHeight, expansionX, expansionY });

      expect(graph[2].join('')).not.toContain('\u001b[0m');
    });
    it('should not add color if not set', () => {
      const thresholds = [{ x: undefined }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({ graph, thresholds, axis, plotWidth, plotHeight, expansionX, expansionY });

      expect(graph).toEqual(defaultGraph);
    });

    it('should not add thresholds if its outside - x', () => {
      const thresholds = [{ x: 100, color: 'ansiRed' }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({ graph, thresholds, axis, plotWidth, plotHeight, expansionX, expansionY });
      expect(graph.map((line) => line.join('')).join('')).not.toContain(CHART.ns);
    });
    it('should not add thresholds if its outside - y', () => {
      const thresholds = [{ y: 100, color: 'ansiRed' }] as Threshold[];
      const axis = { x: 0, y: 0 };
      const plotHeight = 10;
      const expansionX = [0, plotWidth];
      const expansionY = [0, plotHeight];

      addThresholds({ graph, thresholds, axis, plotWidth, plotHeight, expansionX, expansionY });
      expect(graph.map((line) => line.join('')).join('')).not.toContain(CHART.we);
    });
  });

  describe('setFillArea', () => {
    it('should set fill area correctly', () => {
      const chartSymbols = { nse: CHART.nse, wsn: CHART.wsn, we: CHART.we, area: 'A' };
      graph[1][1] = CHART.nse;

      setFillArea({ graph, chartSymbols });
      expect(graph[0][1]).toBe('A');
    });

    it('should use fill area correctly', () => {
      const chartSymbols = { nse: CHART.nse, wsn: CHART.wsn, we: CHART.we };
      graph[1][1] = CHART.nse;

      setFillArea({ graph, chartSymbols });
      expect(graph[0][1]).toBe(CHART.area);
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
