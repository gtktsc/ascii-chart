import {
  ChartErrorCode,
  ChartRangeError,
  ChartTypeError,
  heatmap,
  histogram,
  plot,
  renderChart,
  sparkline,
} from '@ascii-chart';

const captureError = (run: () => unknown): unknown => {
  try {
    run();
  } catch (error) {
    return error;
  }
  throw new Error('expected function to throw');
};

describe('public validation contract', () => {
  it('exports heatmap, histogram, and sparkline helpers from the package root', () => {
    expect(heatmap({ data: [], levels: [] })).toBe('');
    expect(histogram([])).toEqual([]);
    expect(sparkline([])).toBe('');
  });

  it('exports stable runtime error codes', () => {
    expect(ChartErrorCode).toEqual({
      ERR_CHART_INVALID_TYPE: 'ERR_CHART_INVALID_TYPE',
      ERR_CHART_INVALID_VALUE: 'ERR_CHART_INVALID_VALUE',
      ERR_CHART_DUPLICATE_ID: 'ERR_CHART_DUPLICATE_ID',
      ERR_CHART_OUT_OF_DOMAIN: 'ERR_CHART_OUT_OF_DOMAIN',
      ERR_CHART_LAYOUT: 'ERR_CHART_LAYOUT',
    });
  });

  it('exports stable native-compatible type errors', () => {
    try {
      renderChart({
        series: [
          { id: 'duplicate', data: [] },
          { id: 'duplicate', data: [] },
        ],
      });
      throw new Error('expected renderChart to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      expect(error).toBeInstanceOf(ChartTypeError);
      expect(error).toMatchObject({
        code: 'ERR_CHART_DUPLICATE_ID',
        path: 'series[1].id',
      });
    }
  });

  it('exports stable native-compatible range errors from plot', () => {
    try {
      plot([[0, Number.NaN]]);
      throw new Error('expected plot to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(RangeError);
      expect(error).toBeInstanceOf(ChartRangeError);
      expect(error).toMatchObject({
        code: 'ERR_CHART_INVALID_VALUE',
        path: 'coordinates[0][1]',
      });
    }
  });

  it('supports plot axis objects with property-level precedence over flat aliases', () => {
    const chart = plot(
      [
        [0, 0],
        [10, 10],
      ],
      {
        width: 16,
        height: 5,
        formatter: (value) => `flat-${value}`,
        xLabel: 'flat x',
        yLabel: 'flat y',
        xAxis: { ticks: 3, label: 'axis x', formatter: (value) => `x${value}` },
        yAxis: { ticks: 2, label: 'axis y', formatter: (value) => `y${value}` },
      },
    );

    expect(chart).toContain('axis x');
    expect(chart).toContain('x5');
    expect(chart).toContain('y10');
    expect(chart).not.toContain('flat-');
    expect(chart).not.toContain('flat x');
  });

  it('keeps grouped bars equivalent across plot and renderChart', () => {
    const coordinates = [
      [
        [0, 2],
        [1, 3],
      ],
      [
        [0, 1],
        [1, 4],
      ],
    ] as const;
    const shared = {
      width: 12,
      height: 6,
      barLayout: 'grouped' as const,
      xAxis: { domain: [0, 1] as const, hideTicks: true },
      yAxis: { domain: [0, 5] as const, hideTicks: true },
    };

    const plotted = plot(coordinates, {
      ...shared,
      mode: 'bar',
      color: ['ansiRed', 'ansiBlue'],
    });
    const structured = renderChart({
      ...shared,
      series: [
        { id: 'first', data: coordinates[0], mode: 'bar', color: 'ansiRed' },
        { id: 'second', data: coordinates[1], mode: 'bar', color: 'ansiBlue' },
      ],
    });

    expect(plotted).toBe(structured);
    expect(plotted).toMatchSnapshot();
    expect(plotted).toContain('\u001b[31m█\u001b[0m');
    expect(plotted).toContain('\u001b[34m█\u001b[0m');
  });

  it('keeps diverging stacked bars equivalent across plot and renderChart', () => {
    const coordinates = [
      [
        [0, 2],
        [1, -1],
      ],
      [
        [0, 3],
        [1, -4],
      ],
    ] as const;
    const shared = {
      width: 12,
      height: 8,
      barLayout: 'stacked' as const,
      xAxis: { domain: [0, 1] as const, hideTicks: true },
      yAxis: { domain: [-5, 5] as const, hideTicks: true },
    };

    const plotted = plot(coordinates, {
      ...shared,
      mode: 'bar',
      color: ['ansiRed', 'ansiBlue'],
    });
    const structured = renderChart({
      ...shared,
      series: [
        { id: 'first', data: coordinates[0], mode: 'bar', color: 'ansiRed' },
        { id: 'second', data: coordinates[1], mode: 'bar', color: 'ansiBlue' },
      ],
    });

    expect(plotted).toBe(structured);
    expect(plotted).toMatchSnapshot();
  });

  it.each(['bar', 'horizontalBar'] as const)(
    'keeps normalized %s bars equivalent across plot and renderChart',
    (mode) => {
      const coordinates =
        mode === 'bar'
          ? ([
              [
                [0, 1],
                [1, null],
              ],
              [
                [0, 3],
                [1, 4],
              ],
            ] as const)
          : ([
              [
                [1, 0],
                [2, 1],
              ],
              [
                [3, 0],
                [6, 1],
              ],
            ] as const);
      const axes =
        mode === 'bar'
          ? {
              xAxis: { domain: [0, 1] as const, hideTicks: true },
              yAxis: { domain: [0, 100] as const, hideTicks: true },
            }
          : {
              xAxis: { domain: [0, 100] as const, hideTicks: true },
              yAxis: { domain: [0, 1] as const, hideTicks: true },
            };

      const plotted = plot(coordinates, {
        ...axes,
        mode,
        width: 12,
        height: 6,
        barLayout: 'normalized',
        color: ['ansiRed', 'ansiBlue'],
      });
      const structured = renderChart({
        ...axes,
        width: 12,
        height: 6,
        barLayout: 'normalized',
        series: [
          { id: 'first', data: coordinates[0], mode, color: 'ansiRed' },
          { id: 'second', data: coordinates[1], mode, color: 'ansiBlue' },
        ],
      });

      expect(plotted).toBe(structured);
      expect(plotted).toContain('\u001b[31m█\u001b[0m');
      expect(plotted).toContain('\u001b[34m█\u001b[0m');
    },
  );

  it('passes normalized percentages with raw coordinates to value-label formatters', () => {
    const plotContexts: unknown[] = [];
    const chartContexts: unknown[] = [];
    plot([[[0, 1]], [[0, 3]]], {
      mode: 'bar',
      width: 12,
      height: 6,
      barLayout: 'normalized',
      xAxis: { domain: [0, 1] },
      yAxis: { domain: [0, 100] },
      valueLabels: {
        formatter: (value, context) => {
          plotContexts.push({ value, x: context.x, y: context.y, layout: context.layout });
          return value;
        },
      },
    });
    renderChart({
      width: 12,
      height: 6,
      barLayout: 'normalized',
      xAxis: { domain: [0, 1] },
      yAxis: { domain: [0, 100] },
      series: [
        { id: 'first', data: [[0, 1]], mode: 'bar' },
        { id: 'second', data: [[0, 3]], mode: 'bar' },
      ],
      valueLabels: {
        formatter: (value, context) => {
          chartContexts.push({ value, x: context.x, y: context.y, layout: context.layout });
          return value;
        },
      },
    });

    const expected = [
      { value: 25, x: 0, y: 1, layout: 'normalized' },
      { value: 75, x: 0, y: 3, layout: 'normalized' },
    ];
    expect(plotContexts).toEqual(expected);
    expect(chartContexts).toEqual(expected);
  });

  it('supplies stable value-label context from both APIs', () => {
    const plotContexts: unknown[] = [];
    const chartContexts: unknown[] = [];
    const plotOutput = plot([[2, 4]], {
      mode: 'bar',
      width: 8,
      height: 6,
      xAxis: { domain: [0, 4] },
      yAxis: { domain: [0, 10] },
      legend: { series: 'Revenue' },
      valueLabels: {
        formatter: (value, context) => {
          plotContexts.push({ value, ...context });
          return `p${value}`;
        },
      },
    });
    const chartOutput = renderChart({
      width: 8,
      height: 6,
      xAxis: { domain: [0, 4] },
      yAxis: { domain: [0, 10] },
      series: [{ id: 'revenue', name: 'Revenue', data: [[2, 4]], mode: 'bar' }],
      valueLabels: {
        formatter: (value, context) => {
          chartContexts.push({ value, ...context });
          return `c${value}`;
        },
      },
    });

    expect(plotContexts).toEqual([
      expect.objectContaining({ value: 4, seriesIndex: 0, seriesName: 'Revenue', datumIndex: 0 }),
    ]);
    expect(chartContexts).toEqual([
      expect.objectContaining({
        value: 4,
        seriesIndex: 0,
        seriesId: 'revenue',
        seriesName: 'Revenue',
        datumIndex: 0,
      }),
    ]);
    expect(plotOutput).toContain('p4');
    expect(chartOutput).toContain('c4');
  });

  it('supports grouped horizontal bars through both APIs', () => {
    const coordinates = [
      [
        [2, 0],
        [3, 1],
      ],
      [
        [4, 0],
        [1, 1],
      ],
    ] as const;
    const chart = plot(coordinates, {
      mode: 'horizontalBar',
      barLayout: 'grouped',
      width: 10,
      height: 6,
      xAxis: { domain: [0, 5], hideTicks: true },
      yAxis: { domain: [0, 1], hideTicks: true },
      color: ['ansiRed', 'ansiBlue'],
    });
    const structured = renderChart({
      barLayout: 'grouped',
      width: 10,
      height: 6,
      xAxis: { domain: [0, 5], hideTicks: true },
      yAxis: { domain: [0, 1], hideTicks: true },
      series: [
        { id: 'first', data: coordinates[0], mode: 'horizontalBar', color: 'ansiRed' },
        { id: 'second', data: coordinates[1], mode: 'horizontalBar', color: 'ansiBlue' },
      ],
    });

    expect(chart).toBe(structured);
    expect(chart).toContain('\u001b[31m█\u001b[0m');
    expect(chart).toContain('\u001b[34m█\u001b[0m');
  });

  it('formats default and negative horizontal value labels', () => {
    const vertical = plot([[1, 1500]], {
      mode: 'bar',
      width: 12,
      height: 8,
      xAxis: { domain: [0, 2] },
      yAxis: { domain: [0, 3000] },
      valueLabels: true,
    });
    const horizontal = plot([[-2, 1]], {
      mode: 'horizontalBar',
      width: 12,
      height: 6,
      xAxis: { domain: [-5, 5] },
      yAxis: { domain: [0, 2] },
      valueLabels: true,
    });

    expect(vertical).toContain('1.500k');
    expect(horizontal).toContain('-2');
  });

  it.each(['ascii', 'braille'] as const)(
    'renders stacked horizontal series labels with the %s renderer',
    (renderer) => {
      const output = plot(
        [
          [
            [3, 0],
            [5, 1],
            [2, 2],
          ],
          [
            [2, 0],
            [1, 1],
            [4, 2],
          ],
        ],
        {
          renderer,
          mode: 'horizontalBar',
          barLayout: 'stacked',
          width: 28,
          height: 9,
          valueLabels: {
            formatter: (value, { seriesName }) => `${seriesName}:${value}`,
          },
          legend: { series: ['North', 'South'] },
        },
      );

      ['North:3', 'North:5', 'North:2', 'South:2', 'South:1', 'South:4'].forEach((label) => {
        expect(output).toContain(label);
      });
    },
  );

  it.each(['ascii', 'braille'] as const)(
    'renders every grouped percentage label with the %s renderer',
    (renderer) => {
      const output = plot(
        [
          [
            [0, 25],
            [1, 40],
            [2, 65],
          ],
          [
            [0, 45],
            [1, 30],
            [2, 20],
          ],
        ],
        {
          renderer,
          mode: 'bar',
          barLayout: 'grouped',
          width: 26,
          height: 12,
          valueLabels: { formatter: (value) => `${value}%` },
        },
      );

      ['25%', '40%', '65%', '45%', '30%', '20%'].forEach((label) => {
        expect(output).toContain(label);
      });
    },
  );

  it('renders ANSI-styled wide Unicode value labels atomically', () => {
    const label = '\u001b[31m界\u001b[0m';
    const output = renderChart({
      width: 10,
      height: 6,
      series: [{ id: 'bar', data: [[1, 2]], mode: 'bar' }],
      xAxis: { domain: [0, 2], hideTicks: true },
      yAxis: { domain: [0, 4], hideTicks: true },
      valueLabels: { formatter: () => label },
    });

    expect(output).toContain(label);
  });

  it.each(['ascii', 'braille'] as const)(
    'moves a top-edge bar label inside the %s chart',
    (renderer) => {
      const output = renderChart({
        renderer,
        width: 12,
        height: 6,
        series: [{ id: 'bar', data: [[1, 5]], mode: 'bar' }],
        xAxis: { domain: [0, 2], hideTicks: true },
        yAxis: { domain: [0, 5], hideTicks: true },
        valueLabels: { formatter: (value) => `max-${value}` },
      });

      expect(output).toContain('max-5');
    },
  );

  it('omits labels atomically when no safe placement fits', () => {
    const output = plot([[[0, 5]], [[0, 5]]], {
      mode: 'bar',
      barLayout: 'grouped',
      width: 2,
      height: 4,
      xAxis: { domain: [0, 1], hideTicks: true },
      yAxis: { domain: [0, 5], hideTicks: true },
      valueLabels: { formatter: (value) => `long-${value}` },
    });

    expect(output).not.toContain('long-5');
    expect(output).toContain('█');
  });

  it('rejects grouped layouts that cannot reserve distinct category blocks', () => {
    expect(
      captureError(() =>
        plot(
          [
            [
              [0, 1],
              [1, 1],
            ],
            [
              [0, 2],
              [1, 2],
            ],
          ],
          {
            mode: 'bar',
            barLayout: 'grouped',
            width: 3,
            xAxis: { domain: [0, 1] },
            yAxis: { domain: [0, 2] },
          },
        ),
      ),
    ).toMatchObject({ code: 'ERR_CHART_LAYOUT', path: 'settings.barLayout' });
  });

  it('rejects grouped layouts with more series than available slots', () => {
    expect(
      captureError(() =>
        plot([[[0, 1]], [[0, 2]], [[0, 3]]], {
          mode: 'bar',
          barLayout: 'grouped',
          width: 2,
          xAxis: { domain: [0, 1] },
          yAxis: { domain: [0, 3] },
        }),
      ),
    ).toMatchObject({ code: 'ERR_CHART_LAYOUT', path: 'settings.barLayout' });
  });

  it.each([
    [() => plot([[0, 1]], { barLayout: 'grouped' }), 'settings.barLayout'],
    [
      () => plot([[0, 1]], { mode: 'bar', barLayout: 'stacked', fillArea: true }),
      'settings.fillArea',
    ],
    [
      () =>
        plot([[0, 1]], {
          mode: 'bar',
          valueLabels: true,
          lineFormatter: () => ({ x: 0, y: 0, symbol: 'x' }),
        }),
      'settings.lineFormatter',
    ],
    [
      () => renderChart({ series: [{ id: 'line', data: [[0, 1]] }], valueLabels: true }),
      'valueLabels',
    ],
    [
      () =>
        renderChart({
          series: [{ id: 'bar', data: [[0, 1]], mode: 'bar', fillArea: true }],
          barLayout: 'grouped',
        }),
      'series[0].fillArea',
    ],
    [
      () =>
        renderChart({
          series: [
            {
              id: 'bar',
              data: [[0, 1]],
              mode: 'bar',
              lineFormatter: () => ({ x: 0, y: 0, symbol: 'x' }),
            },
          ],
          valueLabels: true,
        }),
      'series[0].lineFormatter',
    ],
  ])('rejects incompatible bar configuration at %s', (render, path) => {
    expect(render).toThrow(path as string);
  });

  it('rejects duplicate categories with API-specific paths', () => {
    expect(() =>
      plot(
        [
          [1, 2],
          [1, 3],
        ],
        { mode: 'bar', barLayout: 'grouped' },
      ),
    ).toThrow('coordinates[1][0]');
    expect(() =>
      renderChart({
        series: [
          {
            id: 'bar',
            data: [
              [1, 2],
              [1, 3],
            ],
            mode: 'bar',
          },
        ],
        barLayout: 'stacked',
      }),
    ).toThrow('series[0].data[1][0]');
  });

  it('requires explicit value domains to contain the generated baseline', () => {
    expect(
      captureError(() =>
        plot([[0, 2]], {
          mode: 'bar',
          barLayout: 'grouped',
          yAxis: { domain: [1, 3] },
        }),
      ),
    ).toMatchObject({ code: 'ERR_CHART_OUT_OF_DOMAIN', path: 'settings.yAxis.domain' });
    expect(
      captureError(() =>
        renderChart({
          series: [{ id: 'bar', data: [[0, 2]], mode: 'bar' }],
          barLayout: 'grouped',
          yAxis: { domain: [1, 3] },
        }),
      ),
    ).toMatchObject({ code: 'ERR_CHART_OUT_OF_DOMAIN', path: 'yAxis.domain' });
    expect(
      captureError(() =>
        plot([[0, 2]], {
          mode: 'bar',
          valueLabels: true,
          yAxis: { domain: [1, 3] },
        }),
      ),
    ).toMatchObject({ code: 'ERR_CHART_OUT_OF_DOMAIN', path: 'settings.yAxis.domain' });
    expect(
      captureError(() =>
        renderChart({
          series: [{ id: 'bar', data: [[0, 2]], mode: 'bar' }],
          valueLabels: true,
          yAxis: { domain: [1, 3] },
        }),
      ),
    ).toMatchObject({ code: 'ERR_CHART_OUT_OF_DOMAIN', path: 'yAxis.domain' });
  });

  it('validates value-label callback results', () => {
    expect(
      captureError(() =>
        plot([[1, 2]], {
          mode: 'bar',
          valueLabels: { formatter: (() => ({})) as never },
        }),
      ),
    ).toMatchObject({
      code: 'ERR_CHART_INVALID_TYPE',
      path: 'settings.valueLabels.formatter.result',
    });
    expect(
      captureError(() =>
        renderChart({
          series: [{ id: 'bar', data: [[1, 2]], mode: 'bar' }],
          valueLabels: { formatter: (() => '\n') as never },
        }),
      ),
    ).toMatchObject({
      code: 'ERR_CHART_INVALID_VALUE',
      path: 'valueLabels.formatter.result',
    });
  });

  it('auto-sizes grouped bars with explicit ticks, formatters, legends, and null data', () => {
    const vertical = plot(
      [
        [
          [0, 1],
          [1, null],
        ],
        [[0, 2]],
      ],
      {
        mode: 'bar',
        barLayout: 'grouped',
        xAxis: { domain: [0, 1], ticks: [0, 1], formatter: (value) => `x${value}` },
        yAxis: { domain: [0, 3], ticks: [0, 3], formatter: (value) => `y${value}` },
        legend: { series: ['A', 'B'] },
      },
    );
    const horizontal = plot([[[2, 0]], [[3, 0]]], {
      mode: 'horizontalBar',
      barLayout: 'grouped',
      xAxis: { domain: [0, 4], ticks: [0, 4] },
      yAxis: { domain: [0, 1], ticks: [0, 1] },
    });

    expect(vertical).toContain('x1');
    expect(vertical).toContain('y3');
    expect(vertical).toContain('A');
    expect(horizontal).toContain('█');
  });

  it('returns empty advanced output without inferable domains', () => {
    expect(plot([], { mode: 'bar', barLayout: 'grouped' })).toBe('');
  });

  it('uses API-specific advanced bar error paths', () => {
    expect(() => plot([[0, 1]], { valueLabels: true })).toThrow('settings.valueLabels');
    expect(
      captureError(() =>
        plot([[2, 0]], {
          mode: 'horizontalBar',
          barLayout: 'grouped',
          xAxis: { domain: [1, 3] },
        }),
      ),
    ).toMatchObject({ code: 'ERR_CHART_OUT_OF_DOMAIN', path: 'settings.xAxis.domain' });
    expect(() =>
      renderChart({
        series: [{ id: 'line', data: [[0, 1]] }],
        barLayout: 'grouped',
      }),
    ).toThrow('barLayout');
  });

  it('supports mixed line and advanced bar series', () => {
    const output = renderChart({
      width: 8,
      height: 6,
      barLayout: 'grouped',
      series: [
        {
          id: 'line',
          data: [
            [0, 1],
            [1, 2],
          ],
          mode: 'line',
        },
        {
          id: 'bar',
          data: [
            [0, 1],
            [1, 2],
          ],
          mode: 'bar',
        },
      ],
      xAxis: { domain: [0, 1] },
      yAxis: { domain: [0, 3] },
    });

    expect(output).toContain('█');
    expect(output).toContain('━');
  });

  it('breaks plot lines at null and explicit-domain clipping', () => {
    const chart = plot(
      [
        [0, 1],
        [1, null],
        [2, 1],
        [3, 99],
        [4, 1],
      ],
      {
        width: 10,
        height: 4,
        xAxis: { domain: [0, 4], hidden: true, hideTicks: true },
        yAxis: { domain: [0, 2], hidden: true, hideTicks: true },
        symbols: {
          chart: { we: 'L', wns: 'L', ns: 'L', nse: 'L', wsn: 'L', sne: 'L', area: 'F' },
        },
      },
    );

    expect(chart.match(/L/g)).toHaveLength(3);
  });

  it('keeps Unicode titles, labels, legends, and ticks column-aligned', () => {
    const chart = renderChart({
      width: 16,
      height: 5,
      title: '東京🙂',
      series: [
        {
          id: 'series',
          name: 'Cafe\u0301 界',
          data: [
            [0, 0],
            [10, 10],
          ],
        },
      ],
      xAxis: { ticks: 2, label: '時間', formatter: (value) => `\u001b[31m界${value}\u001b[0m` },
      yAxis: { ticks: 2, label: '値🙂' },
      legend: { position: 'right' },
    });
    const rows = chart.split('\n').filter(Boolean);
    const widths = rows.slice(1).map((row) => {
      const stripped = row.replace(/\u001b\[[0-9;]*m/g, '');
      return Array.from(
        new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(stripped),
      ).reduce((width, { segment }) => width + (/界|東|京|時|間|値|🙂/u.test(segment) ? 2 : 1), 0);
    });

    expect(new Set(widths)).toHaveProperty('size', 1);
    expect(chart).toContain('東京🙂');
    expect(chart).toContain('Café 界');
  });

  it.each([
    [{ title: 'bad\ntext' }, 'title'],
    [{ symbols: { point: '🙂' } }, 'symbols.point'],
  ])('rejects unsafe text or multi-column grid symbols at %s', (extra, path) => {
    expect(() => renderChart({ series: [{ id: 'series', data: [[0, 0]] }], ...extra })).toThrow(
      path,
    );
  });

  it.each([
    [
      () => plot([[0, 0]], { width: 0 }),
      ChartRangeError,
      'ERR_CHART_INVALID_VALUE',
      'settings.width',
    ],
    [
      () =>
        renderChart({
          series: [
            {
              id: 'series',
              data: [
                [0, 0],
                [1, 1],
              ],
            },
          ],
          xAxis: { ticks: 2, formatter: (() => ({})) as never },
        }),
      ChartTypeError,
      'ERR_CHART_INVALID_TYPE',
      'xAxis.formatter.result',
    ],
    [
      () => plot([[0, 0]], { color: (() => 'cyan') as never }),
      ChartRangeError,
      'ERR_CHART_INVALID_VALUE',
      'settings.color.result',
    ],
    [
      () => plot([[0, 0]], { color: (() => null) as never }),
      ChartTypeError,
      'ERR_CHART_INVALID_TYPE',
      'settings.color.result',
    ],
    [
      () =>
        plot([[0, 0]], {
          lineFormatter: () => ({ x: 0, y: 0, symbol: '🙂' }),
        }),
      ChartRangeError,
      'ERR_CHART_INVALID_VALUE',
      'lineFormatter.result.symbol',
    ],
    [
      () => plot([[0, 0]], { lineFormatter: (() => null) as never }),
      ChartTypeError,
      'ERR_CHART_INVALID_TYPE',
      'lineFormatter.result',
    ],
    [
      () =>
        plot([[0, 0]], {
          lineFormatter: (() => ({ x: '0', y: 0, symbol: 'x' })) as never,
        }),
      ChartTypeError,
      'ERR_CHART_INVALID_TYPE',
      'lineFormatter.result.x',
    ],
    [
      () =>
        plot([[0, 0]], {
          lineFormatter: () => ({ x: 0.5, y: 0, symbol: 'x' }),
        }),
      ChartRangeError,
      'ERR_CHART_INVALID_VALUE',
      'lineFormatter.result.x',
    ],
  ])('validates known settings and callback results', (render, ErrorClass, code, path) => {
    try {
      render();
      throw new Error('expected render to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorClass as unknown as ErrorConstructor);
      expect(error).toMatchObject({ code, path });
    }
  });

  it.each(['line', 'point', 'bar', 'horizontalBar'] as const)(
    'applies null gaps and clipping in %s mode',
    (mode) => {
      const chart = plot(
        [
          [0, 1],
          [1, null],
          [2, 1],
          [3, 10],
          [4, 1],
        ],
        {
          width: 10,
          height: 4,
          mode,
          xAxis: { domain: [0, 4], hidden: true, hideTicks: true },
          yAxis: { domain: [0, 2], hidden: true, hideTicks: true },
        },
      );

      expect(chart).not.toBe('');
    },
  );

  it('renders explicit empty domains and clips plot overlays', () => {
    const chart = plot([[0, null]], {
      width: 8,
      height: 4,
      xAxis: { domain: [0, 1], ticks: 2 },
      yAxis: { domain: [0, 1], ticks: 2 },
      points: [
        { x: 0.5, y: 0.5 },
        { x: 2, y: 0.5 },
        { x: 0.5, y: 2 },
      ],
      thresholds: [{ x: 0.5 }, { y: 0.5 }, { x: 2 }, { y: 2 }],
    });

    expect(chart).not.toBe('');
    expect(
      plot([], {
        xAxis: { domain: [0, 1], ticks: 2 },
        yAxis: { domain: [0, 1], ticks: 2 },
      }),
    ).not.toBe('');
  });

  it('clips flat-API overlays without reconnecting the line', () => {
    const chart = plot(
      [
        [0, 0],
        [1, 9],
        [2, 1],
      ],
      {
        yRange: [0, 1],
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 9 },
        ],
        thresholds: [{ y: 0 }, { y: 9 }, { x: 1 }],
      },
    );

    expect(chart).not.toBe('');
  });

  it.each([
    [
      'plot',
      () =>
        plot(
          [
            [-1, -1],
            [2, 2],
            [5, 5],
          ],
          {
            width: 8,
            height: 4,
            xAxis: { domain: [0, 4], hidden: true, hideTicks: true },
            yAxis: { domain: [0, 4], hidden: true, hideTicks: true },
            overflow: 'clip',
          },
        ),
      () =>
        plot(
          [
            [0, 0],
            [2, 2],
            [4, 4],
          ],
          {
            width: 8,
            height: 4,
            xAxis: { domain: [0, 4], hidden: true, hideTicks: true },
            yAxis: { domain: [0, 4], hidden: true, hideTicks: true },
          },
        ),
    ],
    [
      'renderChart',
      () =>
        renderChart({
          width: 8,
          height: 4,
          series: [
            {
              id: 'clipped',
              data: [
                [-1, -1],
                [2, 2],
                [5, 5],
              ],
            },
          ],
          xAxis: { domain: [0, 4], hidden: true, hideTicks: true },
          yAxis: { domain: [0, 4], hidden: true, hideTicks: true },
          overflow: 'clip',
        }),
      () =>
        renderChart({
          width: 8,
          height: 4,
          series: [
            {
              id: 'clipped',
              data: [
                [0, 0],
                [2, 2],
                [4, 4],
              ],
            },
          ],
          xAxis: { domain: [0, 4], hidden: true, hideTicks: true },
          yAxis: { domain: [0, 4], hidden: true, hideTicks: true },
        }),
    ],
  ])('geometrically clips explicit-domain line overflow through %s', (_name, clipped, expected) => {
    expect(clipped()).toBe(expected());
  });

  it('returns empty output when an axis domain remains unresolved', () => {
    expect(plot([[0, null]], { xAxis: { domain: [0, 1] } })).toBe('');
  });

  it.each([
    ['plot', () => plot([[0, 0]], { width: 3, height: 3, mode: 'point', symbols: { point: 'X' } })],
    [
      'renderChart',
      () =>
        renderChart({
          width: 3,
          height: 3,
          symbols: { point: 'X' },
          series: [{ id: 'series', data: [[0, 0]], mode: 'point' }],
        }),
    ],
  ])('renders symbols.point through %s', (_name, render) => {
    expect(render()).toContain('X');
  });

  it('passes each legacy series to lineFormatter', () => {
    const seen: number[] = [];

    plot([[[0, 1]], [[0, 2]]], {
      lineFormatter: ({ input, plotX, plotY }) => {
        seen.push(input[0][1]);
        return { x: plotX, y: plotY, symbol: 'X' };
      },
    });

    expect(seen).toEqual([1, 2]);
  });
});
