import { plot } from '../index';
import { THRESHOLDS } from '../constants';
import {
  fromPlot,
  getExtrema,
  padOrTrim,
  toCoordinates,
  toSorted,
} from '../services/coords';
import { getChartSize, getLegendData } from '../services/defaults';
import { drawCustomLine, drawGraph, drawPosition } from '../services/draw';
import { addLegend, addPoints } from '../services/overrides';
import { getChartSymbols } from '../services/settings';
import { Graph, GraphPoint, MultiLine, Point, Threshold } from '../types';

const toText = (graph: Graph) => graph.map((row) => row.join('')).join('\n');

describe('snapshot branch coverage', () => {
  it('covers plot with function color, points and thresholds options', () => {
    const output = plot(
      [
        [-1, 2],
        [0, 1],
        [1, 3],
      ],
      {
        width: 12,
        height: 6,
        color: (series) => (series === 0 ? 'ansiGreen' : 'ansiRed'),
        showTickLabel: true,
        points: [{ x: 0, y: 2, color: 'ansiBlue' }],
        thresholds: [{ x: 0, color: 'ansiYellow' }, { y: 0, color: 'ansiMagenta' }],
        symbols: { thresholds: { x: '-', y: '|' } },
        legend: {
          position: 'bottom',
          series: ['line'],
          points: ['focus'],
          thresholds: ['zero-x', 'zero-y'],
        },
      },
    );

    expect(output).toMatchSnapshot();
  });

  it('covers empty-input early return path', () => {
    expect(plot([])).toMatchSnapshot();
  });

  it('covers coordinate helper branches', () => {
    const result = {
      trim: padOrTrim(['a', 'b', 'c'], 2),
      pad: padOrTrim(['a'], 3),
      same: padOrTrim(['x'], 1),
      sortedWithEqualX: toSorted([
        [1, 4],
        [1, 2],
        [0, 0],
      ]),
      fromPlot: {
        leftTop: fromPlot(10, 8)(0, 0),
        mid: fromPlot(10, 8)(4.4, 2.2),
      },
      extrema: {
        maxX: getExtrema(
          [
            [0, 2],
            [3, 1],
            [2, 4],
          ],
          'max',
          0,
        ),
        minY: getExtrema(
          [
            [0, 2],
            [3, 1],
            [2, 4],
          ],
          'min',
          1,
        ),
      },
      toCoordinates: toCoordinates([5, 50], 10, 10, [0, 10], [0, 100]),
    };

    expect(result).toMatchSnapshot();
  });

  it('covers chart-size and legend normalization branches', () => {
    const input: MultiLine = [
      [
        [1, 2],
        [2, 3],
      ],
    ];
    const points: GraphPoint[] = [{ x: 1, y: 2 }];
    const thresholds: Threshold[] = [{ x: 0 }];

    const snapshot = {
      tinyRangeSize: getChartSize({ input }),
      legendData: getLegendData({
        input,
        points,
        thresholds,
        dataSeries: 'series',
        pointsSeries: 'point',
        thresholdsSeries: 'threshold',
      }),
      legendWithoutSeries: getLegendData({ input, points, thresholds }),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('covers drawPosition debug bounds checks', () => {
    const graph = drawGraph({ plotWidth: 2, plotHeight: 2, emptySymbol: '.' });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    drawPosition({ graph, scaledX: 1, scaledY: 10, symbol: 'Y', debugMode: true });
    drawPosition({ graph, scaledX: 10, scaledY: 1, symbol: 'X', debugMode: true });

    expect(consoleSpy.mock.calls).toMatchSnapshot();
    consoleSpy.mockRestore();
  });

  it('covers drawCustomLine single-symbol formatter branch', () => {
    const graph = drawGraph({ plotWidth: 2, plotHeight: 2, emptySymbol: '.' });

    drawCustomLine({
      sortedCoords: [[1, 1]] as Point[],
      scaledX: 1,
      scaledY: 1,
      input: [[[1, 1]]] as MultiLine,
      index: 0,
      minY: 0,
      minX: 0,
      expansionX: [0, 1],
      expansionY: [0, 1],
      toPlotCoordinates: () => [1, 1] as Point,
      lineFormatter: () => ({ x: 1, y: 1, symbol: 'X' }),
      graph,
    });

    expect(toText(graph)).toMatchSnapshot();
  });

  it('covers legend rendering branches for left/right/top with colored labels', () => {
    const baseInput: MultiLine = [[[0, 0]]];
    const points: GraphPoint[] = [{ x: 1, y: 1, color: 'ansiRed' }];
    const thresholds: Threshold[] = [{ x: 0, color: 'ansiBlue' }];
    const legend = {
      series: ['series-1'],
      thresholds: ['threshold-1'],
      points: ['point-1'],
    };

    const leftGraph = drawGraph({ plotWidth: 8, plotHeight: 6, emptySymbol: '.' });
    addLegend({
      graph: leftGraph,
      legend: { ...legend, position: 'left' },
      backgroundSymbol: '.',
      input: baseInput,
      pointSymbol: '*',
      points,
      thresholds,
    });

    const rightGraph = drawGraph({ plotWidth: 8, plotHeight: 6, emptySymbol: '.' });
    addLegend({
      graph: rightGraph,
      legend: { ...legend, position: 'right' },
      backgroundSymbol: '.',
      input: baseInput,
      pointSymbol: '*',
      points,
      thresholds,
    });

    const topGraph = drawGraph({ plotWidth: 8, plotHeight: 6, emptySymbol: '.' });
    addLegend({
      graph: topGraph,
      legend: { ...legend, position: 'top' },
      backgroundSymbol: '.',
      input: baseInput,
      pointSymbol: '*',
      points,
      thresholds,
    });

    expect({
      left: toText(leftGraph),
      right: toText(rightGraph),
      top: toText(topGraph),
    }).toMatchSnapshot();
  });

  it('covers addPoints branch with colored point symbols', () => {
    const graph = drawGraph({ plotWidth: 5, plotHeight: 5, emptySymbol: '.' });
    addPoints({
      graph,
      points: [
        { x: 1, y: 1 },
        { x: 4, y: 4, color: 'ansiCyan' },
      ],
      plotWidth: 5,
      plotHeight: 5,
      expansionX: [0, 5],
      expansionY: [0, 5],
      pointSymbol: 'P',
    });

    expect(toText(graph)).toMatchSnapshot();
  });

  it('covers threshold rendering for zero x/y with custom symbols', () => {
    const output = plot(
      [
        [-1, -1],
        [0, 0],
        [1, 1],
      ],
      {
        width: 10,
        height: 5,
        mode: 'point',
        thresholds: [{ x: 0 }, { y: 0 }],
        symbols: { thresholds: { y: 'V', x: 'H' } },
      },
    );

    expect(output).toContain('V');
    expect(output).toContain('H');
    expect(output).toMatchSnapshot();
  });

  it('covers settings color getter branch directly', () => {
    const chartSymbols = getChartSymbols(
      (series) => (series === 0 ? 'ansiGreen' : 'ansiYellow'),
      1,
      undefined,
      [[[0, 0]]],
    );
    expect(chartSymbols.we).toContain('\u001b[33m');
    expect(chartSymbols).toMatchSnapshot();
  });

  it('has a snapshot for a single explicit option toggle', () => {
    const output = plot(
      [
        [0, 0],
        [1, 1],
        [2, 0],
      ],
      {
        width: 8,
        height: 4,
        hideXAxisTicks: true,
        symbols: { thresholds: THRESHOLDS },
      },
    );
    expect(output).toMatchSnapshot();
  });
});
