import { plot, renderChart } from '@ascii-chart';
import { Coloring, GraphMode } from '@types';
import { interpolateLinearPoints } from '@services/plot/draw/series';

const hiddenAxes = {
  xAxis: { domain: [0, 4] as const, hidden: true, hideTicks: true },
  yAxis: { domain: [0, 4] as const, hidden: true, hideTicks: true },
};

describe('interpolation', () => {
  const data = [
    [0, 0],
    [4, 4],
  ] as const;

  it('keeps step interpolation as the default', () => {
    const settings = { width: 5, height: 5, ...hiddenAxes };

    expect(plot(data, settings)).toBe(plot(data, { ...settings, interpolation: 'step' }));
  });

  it('distributes a linear slope across intermediate columns', () => {
    const settings = {
      width: 5,
      height: 5,
      ...hiddenAxes,
      symbols: {
        chart: { we: 'L', wns: 'L', ns: 'L', nse: 'L', wsn: 'L', sne: 'L', area: 'F' },
      },
    };

    const step = plot(data, { ...settings, interpolation: 'step' });
    const linear = plot(data, { ...settings, interpolation: 'linear' });

    expect(linear).not.toBe(step);
    expect(linear.split('\n').filter((row) => row.includes('L')).length).toBeGreaterThan(2);
  });

  it('keeps equivalent plot and structured configurations identical', () => {
    const settings = { width: 5, height: 5, ...hiddenAxes, interpolation: 'linear' as const };

    expect(
      renderChart({
        width: 5,
        height: 5,
        series: [{ id: 'series', data, interpolation: 'linear' }],
        ...hiddenAxes,
      }),
    ).toBe(plot(data, settings));
  });

  it.each([
    [
      'flat',
      [
        [0, 2],
        [4, 2],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
      ],
    ],
    [
      'ascending',
      [
        [0, 0],
        [4, 4],
      ],
      [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ],
    ],
    [
      'descending',
      [
        [0, 4],
        [4, 0],
      ],
      [
        [0, 4],
        [1, 3],
        [2, 2],
        [3, 1],
        [4, 0],
      ],
    ],
    [
      'shallow',
      [
        [0, 0],
        [4, 2],
      ],
      [
        [0, 0],
        [1, 0.5],
        [2, 1],
        [3, 1.5],
        [4, 2],
      ],
    ],
    [
      'same column',
      [
        [1, 0],
        [1, 4],
      ],
      [
        [1, 0],
        [1, 4],
      ],
    ],
  ] as const)('samples %s scaled segments', (_name, input, expected) => {
    expect(interpolateLinearPoints(input.map(([x, y]) => [x, y]))).toEqual(expected);
  });

  it('preserves empty and single-point lines', () => {
    expect(interpolateLinearPoints([])).toEqual([]);
    expect(interpolateLinearPoints([[1, 2]])).toEqual([[1, 2]]);
  });
});

describe('dynamic coloring', () => {
  it('uses conditional colors per rendered cell with static fallback', () => {
    const contexts: Array<{ series: number; mode: GraphMode; plotX: number; plotY: number }> = [];
    const chart = plot(
      [
        [0, 0],
        [4, 4],
      ],
      {
        width: 5,
        height: 5,
        ...hiddenAxes,
        color: 'ansiBlue',
        coloring: {
          type: 'conditional',
          getColor: ({ series, mode, x, plotX, plotY }) => {
            contexts.push({ series, mode, plotX, plotY });
            return x >= 2 ? 'ansiRed' : undefined;
          },
        },
      },
    );

    expect(chart).toContain('\u001b[31m');
    expect(chart).toContain('\u001b[34m');
    expect(contexts.length).toBeGreaterThan(0);
    expect(contexts.every(({ series, mode }) => series === 0 && mode === 'line')).toBe(true);
    expect(contexts.every(({ plotX, plotY }) => plotX >= 0 && plotY >= 0)).toBe(true);
  });

  it('maps resolved x values through equal-width gradient bands', () => {
    const chart = renderChart({
      width: 5,
      height: 5,
      series: [
        {
          id: 'gradient',
          data: [
            [0, 2],
            [4, 2],
          ],
          coloring: {
            type: 'gradient',
            by: 'x',
            colors: ['ansiRed', 'ansiBlue'],
          },
        },
      ],
      ...hiddenAxes,
    });

    expect(chart).toContain('\u001b[31m');
    expect(chart).toContain('\u001b[34m');
  });

  it('clamps an explicit gradient domain and uses first color for zero-span inference', () => {
    const clamped = plot(
      [
        [0, 2],
        [4, 2],
      ],
      {
        width: 5,
        height: 5,
        ...hiddenAxes,
        coloring: {
          type: 'gradient',
          by: 'x',
          colors: ['ansiRed', 'ansiBlue'],
          domain: [1, 3],
        },
      },
    );
    const zeroSpan = plot([[2, 2]], {
      mode: 'point',
      coloring: { type: 'gradient', by: 'x', colors: ['ansiGreen', 'ansiYellow'] },
    });

    expect(clamped).toContain('\u001b[31m');
    expect(clamped).toContain('\u001b[34m');
    expect(zeroSpan).toContain('\u001b[32m●\u001b[0m');
    expect(zeroSpan).not.toContain('\u001b[33m●\u001b[0m');
  });

  it('preserves original indexes across multi-series gaps', () => {
    const seen = new Set<number>();
    const coloring: Coloring = {
      type: 'conditional',
      getColor: ({ series }) => {
        seen.add(series);
        return series === 0 ? 'ansiRed' : 'ansiBlue';
      },
    };

    plot(
      [
        [
          [0, 0],
          [1, null],
          [4, 4],
        ],
        [
          [0, 4],
          [4, 0],
        ],
      ],
      {
        width: 5,
        height: 5,
        ...hiddenAxes,
        coloring: [coloring, coloring],
      },
    );

    expect(seen).toEqual(new Set([0, 1]));
  });

  it.each(['point', 'bar', 'horizontalBar'] as const)(
    'colors every occupied %s series cell',
    (mode) => {
      const chart = renderChart({
        width: 5,
        height: 5,
        series: [
          {
            id: mode,
            data: [[2, 2]],
            mode,
            coloring: {
              type: 'conditional',
              getColor: () => 'ansiMagenta',
            },
          },
        ],
        ...hiddenAxes,
      });

      expect(chart).toContain('\u001b[35m');
    },
  );

  it.each(['grouped', 'stacked'] as const)(
    'colors advanced %s bars by original series',
    (barLayout) => {
      const chart = renderChart({
        width: 8,
        height: 6,
        series: [
          {
            id: 'red',
            data: [[1, 1]],
            mode: 'bar',
            coloring: { type: 'conditional', getColor: () => 'ansiRed' },
          },
          {
            id: 'blue',
            data: [[1, 1]],
            mode: 'bar',
            coloring: { type: 'conditional', getColor: () => 'ansiBlue' },
          },
        ],
        barLayout,
        axisCenter: [1, 0],
        xAxis: { domain: [0, 2], hidden: true, hideTicks: true },
        yAxis: { domain: [0, 3], hidden: true, hideTicks: true },
      });

      expect(chart).toContain('\u001b[31m');
      expect(chart).toContain('\u001b[34m');
    },
  );

  it('colors stacked horizontal bars and falls back to static color per cell', () => {
    const chart = plot([[[2, 1]], [[2, 1]]], {
      mode: 'horizontalBar',
      barLayout: 'stacked',
      width: 8,
      height: 5,
      color: ['ansiYellow', 'ansiBlue'],
      coloring: [
        {
          type: 'conditional',
          getColor: ({ x }) => (x >= 1 ? 'ansiCyan' : undefined),
        },
        { type: 'conditional', getColor: () => undefined },
      ],
      axisCenter: [0, 0],
      xAxis: { domain: [0, 5], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 2], hidden: true, hideTicks: true },
      valueLabels: true,
    });

    expect(chart).toContain('\u001b[36m');
    expect(chart).toContain('\u001b[34m');
  });

  it('colors filled areas and custom formatter output', () => {
    const filled = renderChart({
      width: 5,
      height: 5,
      series: [
        {
          id: 'filled',
          data: [
            [0, 2],
            [4, 2],
          ],
          fillArea: true,
          coloring: { type: 'gradient', by: 'y', colors: ['ansiGreen', 'ansiYellow'] },
        },
      ],
      ...hiddenAxes,
    });
    const custom = renderChart({
      width: 5,
      height: 5,
      series: [
        {
          id: 'custom',
          data: [[2, 2]],
          lineFormatter: ({ plotX, plotY }) => ({ x: plotX, y: plotY, symbol: 'X' }),
          coloring: { type: 'conditional', getColor: () => 'ansiCyan' },
        },
      ],
      ...hiddenAxes,
    });

    expect(filled).toContain('\u001b[32m');
    expect(filled).toContain('\u001b[33m');
    expect(custom).toContain('\u001b[36mX\u001b[0m');
  });

  it('uses the first gradient color for a gradient-only legend marker', () => {
    const chart = renderChart({
      width: 5,
      height: 5,
      series: [
        {
          id: 'gradient',
          name: 'Gradient',
          data: [[2, 2]],
          coloring: { type: 'gradient', by: 'x', colors: ['ansiRed', 'ansiBlue'] },
        },
      ],
      legend: { position: 'bottom' },
      ...hiddenAxes,
    });

    expect(chart).toContain('\u001b[31m█\u001b[0m Gradient');
  });

  it('prefers static legend color and leaves conditional-only markers uncolored', () => {
    const chart = renderChart({
      width: 5,
      height: 5,
      series: [
        {
          id: 'static',
          name: 'Static',
          data: [[1, 1]],
          color: 'ansiBlue',
          coloring: { type: 'gradient', by: 'x', colors: ['ansiRed', 'ansiYellow'] },
        },
        {
          id: 'conditional',
          name: 'Conditional',
          data: [[3, 3]],
          coloring: { type: 'conditional', getColor: () => 'ansiGreen' },
        },
      ],
      legend: { position: 'bottom' },
      ...hiddenAxes,
    });

    expect(chart).toContain('\u001b[34m█\u001b[0m Static');
    expect(chart).toContain('█ Conditional');
  });

  it('uses gradient and static fallback colors in plot legends', () => {
    const gradient = plot([[0, 0]], {
      mode: 'point',
      coloring: { type: 'gradient', by: 'x', colors: ['ansiRed', 'ansiYellow'] },
      legend: { series: 'Gradient' },
    });
    const fallback = plot([[0, 0]], {
      mode: 'point',
      color: 'ansiBlue',
      coloring: { type: 'gradient', by: 'x', colors: ['ansiRed', 'ansiYellow'] },
      legend: { series: 'Fallback' },
    });

    expect(gradient).toContain('\u001b[31m█\u001b[0m Gradient');
    expect(fallback).toContain('\u001b[34m█\u001b[0m Fallback');
  });
});

describe('dynamic coloring validation', () => {
  it.each([
    [{ interpolation: 'curve' }, 'settings.interpolation'],
    [{ coloring: { type: 'unknown' } }, 'settings.coloring.type'],
    [{ coloring: { type: 'conditional' } }, 'settings.coloring.getColor'],
    [
      { coloring: { type: 'gradient', by: 'z', colors: ['ansiRed', 'ansiBlue'] } },
      'settings.coloring.by',
    ],
    [{ coloring: { type: 'gradient', by: 'x', colors: ['ansiRed'] } }, 'settings.coloring.colors'],
    [{ coloring: { type: 'gradient', by: 'x', colors: 'ansiRed' } }, 'settings.coloring.colors'],
    [
      { coloring: { type: 'gradient', by: 'x', colors: ['ansiRed', 'cyan'] } },
      'settings.coloring.colors[1]',
    ],
    [
      {
        coloring: {
          type: 'gradient',
          by: 'x',
          colors: ['ansiRed', 'ansiBlue'],
          domain: [1, 1],
        },
      },
      'settings.coloring.domain',
    ],
    [
      {
        coloring: {
          type: 'gradient',
          by: 'x',
          colors: ['ansiRed', 'ansiBlue'],
          domain: [1],
        },
      },
      'settings.coloring.domain',
    ],
  ])('rejects invalid plot settings at %s', (settings, path) => {
    expect(() => plot([[0, 0]], settings as never)).toThrow(path as string);
  });

  it('validates conditional callback results with their structured path', () => {
    expect(() =>
      renderChart({
        series: [
          {
            id: 'invalid',
            data: [[0, 0]],
            coloring: { type: 'conditional', getColor: (() => 'cyan') as never },
          },
        ],
      }),
    ).toThrow('series[0].coloring.result');
  });

  it('validates indexed plot callback results with their original series path', () => {
    expect(() =>
      plot([[[0, 0]], [[0, 1]]], {
        coloring: [undefined, { type: 'conditional', getColor: (() => null) as never }],
      }),
    ).toThrow('settings.coloring[1].result');
  });

  it('validates shared plot callback result types', () => {
    expect(() =>
      plot([[0, 0]], {
        coloring: { type: 'conditional', getColor: (() => null) as never },
      }),
    ).toThrow('settings.coloring.result');
  });
});
