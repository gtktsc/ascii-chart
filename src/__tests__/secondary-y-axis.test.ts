import { ChartSpec, renderChart } from '@ascii-chart';
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

describe('secondary Y-axis', () => {
  it('scales primary and secondary series against independent domains', () => {
    const formatterHelpers: unknown[] = [];
    const spec: ChartSpec = {
      width: 10,
      height: 5,
      series: [
        {
          id: 'temperature',
          data: [
            [0, 100],
            [1, 0],
          ],
          mode: 'point',
          color: 'ansiRed',
        },
        {
          id: 'humidity',
          data: [
            [0, 0],
            [1, 1],
          ],
          mode: 'point',
          color: 'ansiBlue',
          yAxis: 'secondary',
        },
      ],
      xAxis: { domain: [0, 1], hideTicks: true },
      yAxis: { domain: [0, 100], ticks: [0, 100], label: 'temp' },
      secondaryYAxis: {
        ticks: [0, 1],
        label: 'ratio',
        formatter: (value, helpers) => {
          formatterHelpers.push(helpers);
          return `S${value}`;
        },
      },
    };

    const chart = renderChart(spec);
    const rows = chart.split('\n');
    const primaryMaximumRow = rows.findIndex((row) => row.includes('\u001b[31m●\u001b[0m'));
    const secondaryMaximumRow = rows.findIndex((row) => row.includes('\u001b[34m●\u001b[0m'));

    expect(primaryMaximumRow).toBeGreaterThan(0);
    expect(secondaryMaximumRow).toBe(primaryMaximumRow);
    expect(chart).toContain('S1');
    expect(chart).toContain('S0');
    expect(chart).toContain('┘');
    expect(chart).toMatch(/r.*\n.*a.*\n.*t.*\n.*i.*\n.*o/);
    expect(formatterHelpers).toContainEqual({ axis: 'y', xRange: [0, 1], yRange: [0, 1] });
  });

  it('infers the secondary domain and preserves original callback coordinates', () => {
    const seen: Array<{ y: number; yRange: number[] }> = [];
    const primaryFormatterValues: number[] = [];
    const chart = renderChart({
      width: 8,
      height: 4,
      series: [
        {
          id: 'primary',
          data: [
            [0, 0],
            [1, 10],
          ],
          mode: 'point',
        },
        {
          id: 'secondary',
          data: [
            [0, 1000],
            [1, 2000],
          ],
          mode: 'point',
          yAxis: 'secondary',
          coloring: {
            type: 'conditional',
            getColor: ({ y }) => {
              seen.push({ y, yRange: [] });
              return 'ansiCyan';
            },
          },
          lineFormatter: ({ y, expansionY }) => {
            seen.push({ y, yRange: expansionY });
            return { x: 0, y: 0, symbol: 'X' };
          },
        },
      ],
      xAxis: { domain: [0, 1], hideTicks: true },
      yAxis: {
        domain: [0, 10],
        formatter: (value) => {
          primaryFormatterValues.push(value);
          return value;
        },
      },
      secondaryYAxis: { ticks: 2 },
    });

    expect(chart).toContain('1k');
    expect(chart).toContain('2k');
    expect(seen).toEqual(
      expect.arrayContaining([
        { y: 1000, yRange: [1000, 2000] },
        { y: 2000, yRange: [1000, 2000] },
      ]),
    );
    expect(primaryFormatterValues).toEqual(expect.arrayContaining([0, 10]));
    expect(primaryFormatterValues).not.toEqual(expect.arrayContaining([1000, 2000]));
  });

  it('reserves right-axis labels in automatic-width charts', () => {
    const chart = withTerminalColumns(40, () =>
      renderChart({
        width: 'auto',
        series: [
          {
            id: 'primary',
            data: [
              [0, 0],
              [1, 1],
            ],
          },
          {
            id: 'secondary',
            data: [
              [0, 1000],
              [1, 2000],
            ],
            yAxis: 'secondary',
          },
        ],
        secondaryYAxis: {
          ticks: [1000, 2000],
          formatter: (value) => `right-${value}`,
        },
      }),
    );

    expect(Math.max(...chart.split('\n').map(displayWidth))).toBeLessThanOrEqual(40);
    expect(chart).toContain('right-2000');
  });

  it.each(['ascii', 'braille'] as const)(
    'aligns the secondary axis endpoint with a bar baseline in %s output',
    (renderer) => {
      const chart = renderChart({
        renderer,
        width: 8,
        height: 4,
        series: [
          {
            id: 'bars',
            data: [
              [0, 1],
              [1, 2],
            ],
            mode: 'bar',
          },
          {
            id: 'line',
            data: [
              [0, 10],
              [1, 20],
            ],
            yAxis: 'secondary',
          },
        ],
        xAxis: { domain: [0, 1], ticks: [0, 1] },
        yAxis: { domain: [0, 2], ticks: [0, 2] },
        secondaryYAxis: { domain: [0, 20], ticks: [0, 20] },
        valueLabels: {},
      });

      expect(chart).toMatch(/─┼0/);
      expect(chart).not.toContain('┘');
    },
  );

  it('keeps the secondary endpoint on the bottom axis for horizontal bars', () => {
    const chart = renderChart({
      width: 8,
      height: 4,
      series: [
        {
          id: 'bars',
          data: [
            [1, 0],
            [2, 1],
          ],
          mode: 'horizontalBar',
        },
        {
          id: 'line',
          data: [
            [0, 10],
            [1, 20],
          ],
          yAxis: 'secondary',
        },
      ],
      xAxis: { domain: [0, 2], ticks: [0, 1, 2] },
      yAxis: { domain: [0, 1], ticks: [0, 1] },
      secondaryYAxis: { domain: [0, 20], ticks: [0, 20] },
      valueLabels: {},
    });

    expect(chart).toContain('┘');
  });

  it.each([
    [
      {
        series: [{ id: 'bad', data: [[0, 1]], yAxis: 'tertiary' }],
      },
      'series[0].yAxis',
    ],
    [
      {
        series: [{ id: 'bad', data: [[0, 1]], mode: 'bar', yAxis: 'secondary' }],
        yAxis: { domain: [0, 1] },
      },
      'series[0].yAxis',
    ],
    [
      {
        series: [
          { id: 'primary', data: [[0, 1]] },
          { id: 'secondary', data: [[0, 2]], yAxis: 'secondary' },
        ],
        axisCenter: [0, 0],
      },
      'axisCenter',
    ],
  ])('rejects unsupported secondary-axis input at %s', (spec, path) => {
    expect(() => renderChart(spec as never)).toThrow(path as string);
  });
});
