import { AXIS } from '@constants';
import {
  drawSecondaryYAxis,
  measureSecondaryYAxisWidth,
} from '@services/plot/draw/secondary-y-axis';

const createGraph = (plotWidth = 4, plotHeight = 4) =>
  Array.from({ length: plotHeight + 2 }, () => Array(plotWidth + 2).fill(' '));

describe('drawSecondaryYAxis', () => {
  it('measures visible tick and axis-label columns', () => {
    expect(
      measureSecondaryYAxisWidth({
        axis: { label: 'R', formatter: String },
        xDomain: [0, 1],
        yDomain: [0, 1000],
        ticks: [0, 1000],
      }),
    ).toBe(6);
    expect(
      measureSecondaryYAxisWidth({
        axis: { hideTicks: true, label: '🙂' },
        xDomain: [0, 1],
        yDomain: [0, 1],
        ticks: [0, 1],
      }),
    ).toBe(3);
    expect(
      measureSecondaryYAxisWidth({
        axis: { hidden: true },
        xDomain: [0, 1],
        yDomain: [0, 1],
        ticks: [0, 1],
      }),
    ).toBe(0);
  });

  it('draws dense labels and wide vertical axis text', () => {
    const graph = createGraph();

    drawSecondaryYAxis({
      graph,
      plotWidth: 4,
      plotHeight: 4,
      realXShift: 0,
      backgroundSymbol: ' ',
      axisSymbols: AXIS,
      axis: { showTickLabel: true, label: '率🙂' },
      xDomain: [0, 1],
      yDomain: [0, 4],
      ticks: [],
    });

    expect(graph[0][5]).toBe(AXIS.n);
    expect(graph[5][5]).toBe(AXIS.nsw);
    expect(graph.flat().filter((cell) => cell === AXIS.y2).length).toBeGreaterThan(1);
    expect(graph.flat().join('')).toContain('率');
    expect(graph.flat().join('')).toContain('🙂');
  });

  it('keeps a hidden axis line and ticks hidden while retaining its label', () => {
    const graph = createGraph();

    drawSecondaryYAxis({
      graph,
      plotWidth: 4,
      plotHeight: 4,
      realXShift: 0,
      backgroundSymbol: ' ',
      axisSymbols: AXIS,
      axis: { hidden: true, label: 'right' },
      xDomain: [0, 1],
      yDomain: [0, 1],
      ticks: [0, 1],
    });

    expect(graph.flat()).not.toContain(AXIS.n);
    expect(graph.flat()).not.toContain(AXIS.y2);
    expect(graph.flat()).toEqual(expect.arrayContaining(['r', 'i', 'g', 'h', 't']));
  });

  it('supports hidden ticks, custom symbols, and a zero-span inferred domain', () => {
    const hiddenTicksGraph = createGraph();
    const axisSymbols = { ...AXIS, y2: 'T', nsw: 'B' };

    drawSecondaryYAxis({
      graph: hiddenTicksGraph,
      plotWidth: 4,
      plotHeight: 4,
      realXShift: 0,
      backgroundSymbol: ' ',
      axisSymbols,
      axis: { hideTicks: true },
      xDomain: [0, 1],
      yDomain: [0, 1],
      ticks: [0, 1],
    });

    expect(hiddenTicksGraph.flat()).not.toContain('T');
    expect(hiddenTicksGraph.flat()).toContain('B');

    const constantGraph = createGraph();
    drawSecondaryYAxis({
      graph: constantGraph,
      plotWidth: 4,
      plotHeight: 4,
      realXShift: 0,
      backgroundSymbol: ' ',
      axisSymbols,
      axis: {},
      xDomain: [0, 1],
      yDomain: [5, 5],
      ticks: [5],
    });

    expect(constantGraph[4]).toContain('T');
  });

  it('attributes invalid formatter output to the secondary axis', () => {
    expect(() =>
      drawSecondaryYAxis({
        graph: createGraph(),
        plotWidth: 4,
        plotHeight: 4,
        realXShift: 0,
        backgroundSymbol: ' ',
        axisSymbols: AXIS,
        axis: { formatter: () => Number.NaN },
        xDomain: [0, 1],
        yDomain: [0, 1],
        ticks: [0, 1],
      }),
    ).toThrow(/secondaryYAxis\.formatter\.result/);
  });
});
