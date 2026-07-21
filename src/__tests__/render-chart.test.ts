import plot, { renderChart } from '@ascii-chart';
import { displayWidth } from '@helpers/terminal-text';

const withTerminalColumns = <T>(columns: number, run: () => T): T => {
  const descriptor = Object.getOwnPropertyDescriptor(process.stdout, 'columns');
  Object.defineProperty(process.stdout, 'columns', { configurable: true, value: columns });
  try {
    return run();
  } finally {
    if (descriptor) Object.defineProperty(process.stdout, 'columns', descriptor);
    else delete (process.stdout as { columns?: number }).columns;
  }
};

describe('renderChart', () => {
  it('renders a structured chart with fixed domains, exact ticks, color, and legend', () => {
    const chart = renderChart({
      series: [
        {
          id: 'cpu',
          name: 'CPU',
          data: [
            [0, 20],
            [1, 45],
            [2, null],
          ],
          mode: 'line',
          color: 'ansiCyan',
        },
      ],
      xAxis: { domain: [0, 60], ticks: 6 },
      yAxis: { domain: [0, 100], ticks: 5 },
      legend: { position: 'right' },
    });

    expect(chart).toContain('\u001b[36m');
    expect(chart).toContain('CPU');
    expect(chart).toContain('100');
    expect(chart).toContain('60');
    expect(chart).toMatchSnapshot();
  });

  it('keeps the default export as plot', () => {
    expect(plot([[0, 1]])).toContain('1');
  });

  it('renders each series with its own mode and color', () => {
    const chart = renderChart({
      width: 12,
      height: 6,
      series: [
        {
          id: 'line',
          data: [
            [0, 0],
            [2, 2],
          ],
          mode: 'line',
          color: 'ansiRed',
        },
        { id: 'point', data: [[1, 1]], mode: 'point', color: 'ansiBlue' },
        { id: 'bar', data: [[2, 1]], mode: 'bar', color: 'ansiGreen' },
      ],
      xAxis: { domain: [0, 2], hideTicks: true },
      yAxis: { domain: [0, 2], hideTicks: true },
    });

    expect(chart).toContain('\u001b[31m');
    expect(chart).toContain('\u001b[34m●\u001b[0m');
    expect(chart).toContain('\u001b[32m█\u001b[0m');
  });

  it('breaks line segments at null and clipped points', () => {
    const chart = renderChart({
      width: 10,
      height: 4,
      series: [
        {
          id: 'gaps',
          data: [
            [0, 1],
            [1, null],
            [2, 1],
            [3, 99],
            [4, 1],
          ],
        },
      ],
      xAxis: { domain: [0, 4], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 2], hidden: true, hideTicks: true },
      symbols: {
        chart: { we: 'L', wns: 'L', ns: 'L', nse: 'L', wsn: 'L', sne: 'L', area: 'F' },
      },
    });

    expect(chart.match(/L/g)).toHaveLength(3);
  });

  it('does not mutate structured input while sorting by x', () => {
    const spec = {
      width: 8,
      height: 4,
      series: [
        {
          id: 'sorted',
          data: [
            [2, 2],
            [0, 0],
            [1, 1],
          ] as const,
        },
      ],
    };
    const original = JSON.parse(JSON.stringify(spec));

    renderChart(spec);

    expect(spec).toEqual(original);
  });

  it('renders an empty frame when explicit domains exist', () => {
    const chart = renderChart({
      series: [{ id: 'missing', data: [[0, null]] }],
      xAxis: { domain: [0, 10], ticks: 2 },
      yAxis: { domain: [0, 100], ticks: 2 },
      legend: { position: 'bottom' },
    });

    expect(chart).toContain('missing');
    expect(chart).toContain('100');
    expect(chart).not.toContain('\u001b[37m');
  });

  it('returns empty output when no y-domain can be inferred', () => {
    expect(renderChart({ series: [{ id: 'missing', data: [[0, null]] }] })).toBe('');
  });

  it('generates configured tick counts from inferred domains', () => {
    const chart = renderChart({
      width: 20,
      height: 6,
      series: [
        {
          id: 'values',
          data: [
            [0, 0],
            [10, 10],
          ],
        },
      ],
      xAxis: { ticks: 3 },
      yAxis: { ticks: 3 },
    });

    expect(chart).toContain('5');
    expect(chart).toContain('10');
  });

  it('renders native categories in first-seen band order', () => {
    const formatterValues: string[] = [];
    const valueLabelXValues: string[] = [];
    const chart = renderChart({
      width: 24,
      height: 6,
      series: [
        {
          id: 'sales',
          data: [
            ['Mon', 2],
            ['Wed', 4],
            ['Tue', 3],
          ],
          mode: 'bar',
        },
      ],
      xAxis: {
        scale: 'band',
        formatter: (value) => {
          formatterValues.push(value);
          return value.toUpperCase();
        },
      },
      yAxis: { domain: [0, 5] },
      points: [{ id: 'tuesday', x: 'Tue', y: 3 }],
      thresholds: [{ id: 'monday', x: 'Mon' }],
      valueLabels: {
        formatter: (value, context) => {
          valueLabelXValues.push(context.x);
          return value;
        },
      },
    });

    expect(chart).toContain('MON');
    expect(chart).toContain('WED');
    expect(chart).toContain('TUE');
    expect(formatterValues).toEqual(expect.arrayContaining(['Mon', 'Wed', 'Tue']));
    expect(valueLabelXValues).toEqual(['Mon', 'Wed', 'Tue']);
  });

  it('keeps normalized categorical bars below the 100% axis boundary', () => {
    const chart = renderChart({
      width: 16,
      height: 6,
      renderer: 'ascii',
      series: [
        { id: 'first', data: [['Q1', 1]], mode: 'bar' },
        { id: 'second', data: [['Q1', 3]], mode: 'bar' },
      ],
      xAxis: { scale: 'band' },
      yAxis: { domain: [0, 100] },
      barLayout: 'normalized',
      symbols: { chart: { area: 'B' } },
    });
    const lines = chart.split('\n');
    const maximumTickRow = lines.findIndex((line) => line.includes('100'));

    expect(maximumTickRow).toBeGreaterThan(0);
    expect(lines[maximumTickRow - 1]).not.toContain('B');
    expect(lines[maximumTickRow]).toContain('B');
  });

  it('infers band and time scales without axis configuration', () => {
    const categories = renderChart({
      width: 16,
      series: [
        {
          id: 'quarters',
          data: [
            ['Q1', 1],
            ['Q2', 2],
          ],
        },
      ],
    });
    const time = renderChart({
      width: 20,
      series: [
        {
          id: 'samples',
          data: [
            [new Date('2026-01-01T00:00:00.000Z'), 1],
            [new Date('2026-01-01T12:00:00.000Z'), 2],
          ],
        },
      ],
    });

    expect(categories).toContain('Q1');
    expect(categories).toContain('Q2');
    expect(time).toContain('00:00');
    expect(time).toContain('12:00');
  });

  it('uses an explicit category domain for band order and tick selection', () => {
    const chart = renderChart({
      width: 24,
      height: 5,
      series: [
        {
          id: 'priority',
          data: [
            ['low', 1],
            ['high', 3],
            ['ignored', 2],
          ],
        },
      ],
      xAxis: {
        domain: ['high', 'medium', 'low'],
        ticks: ['high', 'low'],
      },
      yAxis: { domain: [0, 3] },
    });

    expect(chart).toContain('high');
    expect(chart).toContain('low');
    expect(chart).not.toContain('medium');
    expect(chart).not.toContain('ignored');
  });

  it('renders Date values on a time scale with automatic UTC labels', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const middle = new Date('2026-01-01T12:00:00.000Z');
    const end = new Date('2026-01-02T00:00:00.000Z');
    const chart = renderChart({
      width: 28,
      height: 5,
      series: [
        {
          id: 'temperature',
          data: [
            [start, 1],
            [middle, 3],
            [end, 2],
          ],
        },
      ],
      xAxis: { scale: 'time', domain: [start, end], ticks: [start, middle, end] },
      yAxis: { domain: [0, 3] },
      points: [{ id: 'midpoint', x: middle, y: 3 }],
      thresholds: [{ id: 'start', x: start }],
    });

    expect(chart).toContain('01-01');
    expect(chart).toContain('01-02');
  });

  it('passes native Date values to a custom time-axis formatter', () => {
    const seen: Date[] = [];
    const start = new Date('2026-01-01T00:00:00.000Z');
    const end = new Date('2027-01-01T00:00:00.000Z');
    const chart = renderChart({
      width: 20,
      series: [
        {
          id: 'annual',
          data: [
            [start, 1],
            [end, 2],
          ],
        },
      ],
      xAxis: {
        ticks: [start, end],
        formatter: (value) => {
          seen.push(value);
          return value.getUTCFullYear();
        },
      },
    });

    expect(chart).toContain('2026');
    expect(chart).toContain('2027');
    expect(seen.every((value) => value instanceof Date)).toBe(true);
  });

  it.each([
    [
      {
        series: [
          {
            id: 'mixed',
            data: [
              [0, 1],
              ['one', 2],
            ],
          },
        ],
      },
      'series[0].data[1][0]',
    ],
    [{ series: [{ id: 'date', data: [[new Date('invalid'), 1]] }] }, 'series[0].data[0][0]'],
    [
      { series: [{ id: 'category', data: [['one', 1]] }], xAxis: { scale: 'linear' } },
      'xAxis.scale',
    ],
    [
      {
        series: [{ id: 'category', data: [['one', 1]] }],
        xAxis: { domain: ['one', 'one'] },
      },
      'xAxis.domain[1]',
    ],
    [
      {
        series: [{ id: 'category', data: [['one', 1]] }],
        xAxis: { domain: ['one', 'two'], ticks: ['missing'] },
      },
      'xAxis.ticks[0]',
    ],
    [
      {
        series: [{ id: 'category', data: [['one', 1]] }],
        axisCenter: [0, 0],
      },
      'axisCenter[0]',
    ],
  ])('rejects invalid native X contracts at %s', (spec, path) => {
    expect(() => renderChart(spec as never)).toThrow(path as string);
  });

  it('selects and orders legend entities by id', () => {
    const chart = renderChart({
      width: 10,
      height: 4,
      series: [{ id: 'series', name: 'Series', data: [[0, 0]] }],
      points: [
        { id: 'hidden-point', name: 'Hidden point', x: 0, y: 0 },
        { id: 'point', name: 'Point', x: 0, y: 0, color: 'ansiBlue' },
      ],
      thresholds: [{ id: 'threshold', name: 'Threshold', y: 0, color: 'ansiRed' }],
      legend: {
        position: 'right',
        series: false,
        points: ['point'],
        thresholds: ['threshold'],
      },
    });

    expect(chart).toContain('Point');
    expect(chart).toContain('Threshold');
    expect(chart).not.toContain('Hidden point');
    expect(chart).not.toContain('Series');
  });

  it.each([
    [{}, TypeError, 'series'],
    [{ series: [{ id: '', data: [] }] }, TypeError, 'series[0].id'],
    [
      {
        series: [
          { id: 'same', data: [] },
          { id: 'same', data: [] },
        ],
      },
      TypeError,
      'series[1].id',
    ],
    [{ series: [{ id: 'bad', data: [[Number.NaN, 1]] }] }, RangeError, 'data[0][0]'],
    [{ series: [{ id: 'bad', data: [[0, Number.POSITIVE_INFINITY]] }] }, RangeError, 'data[0][1]'],
    [{ series: [{ id: 'bad', data: [] }], width: 0 }, RangeError, 'width'],
    [{ series: [{ id: 'bad', data: [] }], height: 1.5 }, RangeError, 'height'],
    [
      { series: [{ id: 'bad', data: [[0, 0]] }], xAxis: { domain: [1, 0] } },
      RangeError,
      'xAxis.domain',
    ],
    [{ series: [{ id: 'bad', data: [[0, 0]] }], xAxis: { ticks: 1 } }, RangeError, 'xAxis.ticks'],
    [
      { series: [{ id: 'bad', data: [[0, 0]] }], xAxis: { ticks: [1, 0] } },
      RangeError,
      'xAxis.ticks',
    ],
    [{ series: [{ id: 'bad', data: [], mode: 'spline' }] }, RangeError, 'series[0].mode'],
    [{ series: [{ id: 'bad', data: [], color: 'cyan' }] }, RangeError, 'series[0].color'],
    [
      { series: [{ id: 'ok', data: [[0, 0]] }], thresholds: [{ id: 'bad' }] },
      TypeError,
      'thresholds[0]',
    ],
    [
      {
        series: [{ id: 'ok', data: [[0, 0]] }],
        legend: { position: 'right', series: ['missing'] },
      },
      RangeError,
      'legend.series[0]',
    ],
  ])('rejects invalid specs with a path-specific error', (spec, ErrorType, path) => {
    expect(() => renderChart(spec as never)).toThrow(ErrorType as ErrorConstructor);
    expect(() => renderChart(spec as never)).toThrow(path as string);
  });

  it('rejects configured x labels that cannot fit the requested width', () => {
    expect(() =>
      renderChart({
        width: 3,
        series: [
          {
            id: 'labels',
            data: [
              [0, 0],
              [100, 1],
            ],
          },
        ],
        xAxis: { ticks: 3, formatter: (value) => `value-${value}` },
      }),
    ).toThrow(/xAxis.ticks/);
  });

  it('reports explicit collision errors through both public APIs', () => {
    const renderError = (() => {
      try {
        renderChart({
          width: 2,
          series: [
            {
              id: 'labels',
              data: [
                [0, 0],
                [1, 1],
              ],
            },
          ],
          xAxis: { ticks: 2, formatter: () => 'long', labelCollision: 'error' },
        });
      } catch (error) {
        return error;
      }
    })();
    const plotError = (() => {
      try {
        plot(
          [
            [0, 0],
            [1, 1],
          ],
          {
            width: 2,
            xAxis: {
              ticks: [0, 1],
              formatter: () => 'long',
              labelCollision: 'error',
            },
          },
        );
      } catch (error) {
        return error;
      }
    })();

    expect(renderError).toMatchObject({ code: 'ERR_CHART_LAYOUT', path: 'xAxis.ticks' });
    expect(plotError).toMatchObject({
      code: 'ERR_CHART_LAYOUT',
      path: 'settings.xAxis.ticks',
    });
  });

  it('fits auto-width charts and thins dense ticks to terminal columns', () => {
    const chart = withTerminalColumns(36, () =>
      renderChart({
        width: 'auto',
        series: [
          {
            id: 'series',
            name: 'Series',
            data: Array.from({ length: 11 }, (_, value) => [value, value] as const),
          },
        ],
        xAxis: { ticks: 11, formatter: (value) => `tick-${value}` },
        legend: { position: 'auto' },
      }),
    );

    expect(Math.max(...chart.split('\n').map(displayWidth))).toBeLessThanOrEqual(36);
    expect(chart).toContain('tick-0');
    expect(chart).toContain('tick-10');
    expect(chart.match(/tick-/g)?.length).toBeLessThan(11);
    expect(chart).toContain('Series');
    expect(chart.split('\n').filter(Boolean).at(-1)).toContain('Series');
  });

  it('separates auto-width dense category labels', () => {
    const chart = withTerminalColumns(80, () =>
      renderChart({
        width: 'auto',
        aspectRatio: 4,
        renderer: 'ascii',
        series: [
          {
            id: 'dense',
            data: [
              ['north-america', 5],
              ['south-america', 3],
              ['europe-middle-east-africa', 7],
              ['asia-pacific', 6],
            ],
            mode: 'bar',
          },
        ],
        xAxis: { scale: 'band', labelCollision: 'hide' },
        yAxis: { domain: [0, 8] },
      }),
    );

    expect(chart).toContain('north-america');
    expect(chart).toContain('asia-pacific');
    expect(chart).not.toContain('south-americaeurope-middle-east-africa');
    expect(chart).not.toContain('south-america');
    expect(chart).not.toContain('europe-middle-east-africa');
  });

  it('places an automatic legend beside charts when the terminal has room', () => {
    const chart = withTerminalColumns(100, () =>
      renderChart({
        width: 'auto',
        series: [{ id: 'series', name: 'Series', data: [[0, 0]] }],
        legend: { position: 'auto' },
      }),
    );

    expect(chart.split('\n').filter(Boolean)[0]).toContain('Series');
    expect(Math.max(...chart.split('\n').map(displayWidth))).toBeLessThanOrEqual(100);
  });

  it('sorts and thins data-derived ticks for automatic width', () => {
    const chart = withTerminalColumns(20, () =>
      renderChart({
        width: 'auto',
        series: [
          {
            id: 'series',
            data: [
              [2, 2],
              [0, 0],
              [1, 1],
            ],
          },
        ],
      }),
    );

    expect(chart).toContain('0');
    expect(chart).toContain('2');
    expect(Math.max(...chart.split('\n').map(displayWidth))).toBeLessThanOrEqual(20);
  });

  it('honors hidden X-axis ticks with adaptive layout', () => {
    const chart = withTerminalColumns(20, () =>
      renderChart({
        width: 'auto',
        series: [
          {
            id: 'series',
            data: [
              [0, 0],
              [1, 1],
            ],
          },
        ],
        xAxis: { ticks: 2, hideTicks: true, formatter: () => 'x-hidden' },
      }),
    );

    expect(chart).not.toContain('x-hidden');
  });

  it('supports adaptive collision policies through plot', () => {
    const chart = withTerminalColumns(30, () =>
      plot(
        Array.from({ length: 6 }, (_, value) => [value, value] as const),
        {
          width: 'auto',
          xAxis: {
            ticks: 6,
            formatter: (value) => `long-label-${value}`,
            labelCollision: 'truncate',
          },
          legend: { position: 'auto', series: 'Series' },
        },
      ),
    );

    expect(Math.max(...chart.split('\n').map(displayWidth))).toBeLessThanOrEqual(30);
    expect(chart).toContain('…');
  });

  it('wraps tick labels across additional rows', () => {
    const chart = renderChart({
      width: 6,
      height: 3,
      series: [
        {
          id: 'series',
          data: [
            [0, 0],
            [1, 1],
          ],
        },
      ],
      xAxis: { ticks: 2, formatter: () => 'abcdef', labelCollision: 'wrap' },
    });

    expect(chart).toContain('abc abc');
    expect(chart).toContain('def def');
    expect(chart).not.toContain('abcdef');
  });

  it('shifts clustered wrapped labels left without collisions', () => {
    const chart = renderChart({
      width: 10,
      height: 3,
      series: [
        {
          id: 'series',
          data: [
            [0, 0],
            [10, 1],
          ],
        },
      ],
      xAxis: {
        domain: [0, 10],
        ticks: [8, 9, 10],
        formatter: (value) => `t${value}`,
        labelCollision: 'wrap',
      },
    });

    expect(chart).toMatch(/t8\s+t9\s+t10/);
  });

  it('derives corrected height from aspect ratio while explicit height wins', () => {
    const tall = renderChart({
      width: 40,
      aspectRatio: 1,
      series: [{ id: 'series', data: [[0, 0]] }],
    });
    const wide = renderChart({
      width: 40,
      aspectRatio: 4,
      series: [{ id: 'series', data: [[0, 0]] }],
    });
    const explicit = renderChart({
      width: 40,
      height: 5,
      aspectRatio: 1,
      series: [{ id: 'series', data: [[0, 0]] }],
    });

    expect(tall.split('\n').length).toBeGreaterThan(wide.split('\n').length);
    expect(explicit.split('\n').length).toBeLessThan(tall.split('\n').length);
  });

  it('applies aspect ratio to the complete automatic-width layout', () => {
    const chart = withTerminalColumns(80, () =>
      plot(
        [
          [0, -2],
          [1, 1],
          [2, null],
          [3, 4],
          [4, 2],
        ],
        { width: 'auto', aspectRatio: 2.5, title: 'Responsive chart' },
      ),
    );
    const lines = chart.split('\n').filter(Boolean);
    const renderedWidth = Math.max(...lines.map(displayWidth));
    const physicalRatio = renderedWidth / (lines.length * 2);

    expect(physicalRatio).toBeCloseTo(2.5, 1);
  });

  it('supports independent axis formatters, labels, title, and horizontal bars', () => {
    const chart = renderChart({
      width: 16,
      height: 6,
      title: 'Throughput',
      series: [
        {
          id: 'requests',
          data: [
            [0, 1],
            [4, 3],
          ],
          mode: 'horizontalBar',
          color: 'ansiMagenta',
        },
      ],
      xAxis: { ticks: 2, label: 'time', formatter: (value) => `x${value}` },
      yAxis: { ticks: 2, label: 'rate', formatter: (value) => `y${value}` },
    });

    expect(chart).toContain('Throughput');
    expect(chart).toContain('time');
    expect(chart).toMatch(/\nr.*\na.*\nt.*\ne/);
    expect(chart).toContain('x4');
    expect(chart).toContain('y3');
    expect(chart).toContain('\u001b[35m█\u001b[0m');
  });

  it('runs line formatters against each contiguous non-null segment', () => {
    const seenInputLengths: number[] = [];
    const chart = renderChart({
      width: 8,
      height: 4,
      series: [
        {
          id: 'custom',
          data: [
            [0, 0],
            [1, null],
            [2, 2],
          ],
          lineFormatter: (args) => {
            seenInputLengths.push(args.input.length);
            return { x: args.plotX, y: args.plotY, symbol: 'X' };
          },
        },
      ],
    });

    expect(seenInputLengths).toEqual([1, 1]);
    expect(chart.match(/X/g)).toHaveLength(2);
  });

  it('isolates filled series and composites later series above them', () => {
    const chart = renderChart({
      width: 8,
      height: 4,
      series: [
        {
          id: 'filled',
          data: [
            [0, 2],
            [2, 2],
          ],
          color: 'ansiRed',
          fillArea: true,
        },
        { id: 'point', data: [[1, 1]], mode: 'point', color: 'ansiBlue' },
      ],
      xAxis: { domain: [0, 2], hideTicks: true },
      yAxis: { domain: [0, 2], hideTicks: true },
    });

    expect(chart).toContain('\u001b[31m█\u001b[0m');
    expect(chart).toContain('\u001b[34m●\u001b[0m');
  });

  it('uses selected series order and colors in the legend', () => {
    const chart = renderChart({
      width: 8,
      height: 4,
      series: [
        { id: 'a', name: 'A', data: [[0, 0]], color: 'ansiRed' },
        { id: 'b', name: 'B', data: [[1, 1]], color: 'ansiBlue' },
      ],
      legend: { position: 'bottom', series: ['b'] },
    });

    expect(chart).toContain('\u001b[34m█\u001b[0m B');
    expect(chart).not.toContain('\u001b[31m█\u001b[0m A');
  });

  it('supports partial and complete in-domain axis centers', () => {
    const base = {
      width: 8,
      height: 4,
      series: [
        {
          id: 'centered',
          data: [
            [0, 0],
            [1, 1],
          ] as const,
        },
      ],
      xAxis: { domain: [0, 1] as const },
      yAxis: { domain: [0, 1] as const },
    };

    expect(renderChart({ ...base, axisCenter: [0.5, 0.5] })).toContain('┼');
    expect(renderChart({ ...base, axisCenter: [undefined, 0.5] })).not.toBe('');
  });

  it.each([
    [[2, 0.5] as [number, number], 'axisCenter[0]'],
    [[0.5, 2] as [number, number], 'axisCenter[1]'],
  ])('rejects an out-of-domain axis center', (axisCenter, path) => {
    expect(() =>
      renderChart({
        series: [
          {
            id: 'centered',
            data: [
              [0, 0],
              [1, 1],
            ],
          },
        ],
        xAxis: { domain: [0, 1] },
        yAxis: { domain: [0, 1] },
        axisCenter,
      }),
    ).toThrow(path);
  });

  it('clips overlays independently and falls back to overlay ids in the legend', () => {
    const chart = renderChart({
      width: 8,
      height: 4,
      series: [
        {
          id: 'ties',
          data: [
            [0, 0],
            [0, 1],
            [1, 1],
          ],
        },
      ],
      xAxis: { domain: [0, 1] },
      yAxis: { domain: [0, 1] },
      points: [
        { id: 'inside', x: 0.5, y: 0.5 },
        { id: 'outside-x', x: 2, y: 0.5 },
        { id: 'outside-y', x: 0.5, y: 2 },
      ],
      thresholds: [
        { id: 'vertical', x: 0.5 },
        { id: 'horizontal', y: 0.5 },
        { id: 'outside-threshold-x', x: 2 },
        { id: 'outside-threshold-y', y: 2 },
      ],
      legend: {
        position: 'bottom',
        series: false,
        points: ['inside'],
        thresholds: ['vertical', 'horizontal'],
      },
    });

    expect(chart).toContain('inside');
    expect(chart).toContain('vertical');
    expect(chart).toContain('horizontal');
    expect(chart).not.toContain('outside-x');
  });

  it('omits an empty legend selection', () => {
    const chart = renderChart({
      series: [{ id: 'series', data: [[0, 0]] }],
      legend: { position: 'right', series: false, points: false, thresholds: false },
    });

    expect(chart).not.toContain('series');
  });

  it('skips a secondary series when no secondary y domain can be inferred', () => {
    const chart = renderChart({
      series: [
        {
          id: 'primary',
          data: [
            [0, 1],
            [1, 2],
          ],
        },
        {
          id: 'missing-secondary',
          data: [
            [0, null],
            [1, null],
          ],
          yAxis: 'secondary',
        },
      ],
    });

    expect(chart).not.toBe('');
  });

  it('creates default secondary-axis settings from secondary series values', () => {
    const chart = renderChart({
      series: [
        {
          id: 'primary',
          data: [
            [0, 1],
            [1, 2],
          ],
        },
        {
          id: 'secondary',
          data: [
            [0, 10],
            [1, 20],
          ],
          yAxis: 'secondary',
        },
      ],
    });

    expect(chart).not.toBe('');
  });
});
