import {
  candlestick,
  Candlestick,
  CandlestickSpec,
  ChartRangeError,
  ChartTypeError,
} from '@ascii-chart';

const domains = {
  xAxis: { domain: [0, 2] as const, hidden: true, hideTicks: true },
  yAxis: { domain: [0, 12] as const, hidden: true, hideTicks: true },
};

const captureError = (render: () => unknown) => {
  try {
    render();
  } catch (error) {
    return error;
  }
  throw new Error('Expected render to throw');
};

describe('candlestick', () => {
  it('exports a typed renderer and draws rising, falling, and unchanged OHLC candles', () => {
    const spec: CandlestickSpec = {
      data: [
        [0, 4, 8, 2, 7],
        [1, 8, 10, 3, 5],
        [2, 6, 9, 4, 6],
      ],
      width: 5,
      height: 9,
      ...domains,
    };
    const render: Candlestick = candlestick;
    const output = render(spec);

    expect(output).toContain('░');
    expect(output).toContain('█');
    expect(output).toContain('─');
    expect(output).toContain('│');
  });

  it('colors each candle body and wick without changing cell width', () => {
    const output = candlestick({
      data: [
        [0, 4, 8, 2, 7],
        [1, 8, 10, 3, 5],
        [2, 6, 9, 4, 6],
      ],
      width: 5,
      height: 9,
      ...domains,
      style: {
        wick: 'W',
        rising: { symbol: 'R', color: 'ansiGreen' },
        falling: { symbol: 'F', color: 'ansiRed' },
        unchanged: { symbol: 'N', color: 'ansiYellow' },
      },
    });

    expect(output).toContain('\u001b[32mR\u001b[0m');
    expect(output).toContain('\u001b[32mW\u001b[0m');
    expect(output).toContain('\u001b[31mF\u001b[0m');
    expect(output).toContain('\u001b[31mW\u001b[0m');
    expect(output).toContain('\u001b[33mN\u001b[0m');
    expect(output).toContain('\u001b[33mW\u001b[0m');
  });

  it('renders colored reference thresholds over the candle domain', () => {
    const output = candlestick({
      data: [
        [0, 4, 8, 2, 7],
        [1, 8, 10, 3, 5],
      ],
      width: 12,
      height: 9,
      ...domains,
      thresholds: [{ id: 'target', name: 'Target', y: 6, color: 'ansiRed' }],
    });

    expect(output).toContain('\u001b[31m━\u001b[0m');
  });

  it('infers the Y domain from low and high rather than only open or close', () => {
    const output = candlestick({
      data: [
        [0, 10, 14, 8, 12],
        [1, 12, 13, 7, 9],
      ],
      width: 20,
      height: 8,
      xAxis: { ticks: 2 },
      yAxis: { ticks: 2 },
    });

    expect(output).toContain('14');
    expect(output).toContain('7');
  });

  it('discards complete candles outside explicit X or Y domains', () => {
    const inside = [0, 4, 6, 2, 5] as const;
    const options = {
      width: 8,
      height: 6,
      xAxis: { domain: [0, 1] as const, hidden: true, hideTicks: true },
      yAxis: { domain: [0, 8] as const, hidden: true, hideTicks: true },
      style: { wick: 'W', rising: { symbol: 'R' } },
    };
    const output = candlestick({
      ...options,
      data: [inside, [-1, 4, 6, 2, 5], [2, 4, 6, 2, 5], [0.25, 4, 6, -1, 5], [0.75, 4, 9, 2, 5]],
    });

    expect(output).toBe(candlestick({ ...options, data: [inside] }));
  });

  it('does not mutate unsorted input', () => {
    const spec = {
      data: [
        [2, 6, 9, 4, 6],
        [0, 4, 8, 2, 7],
        [1, 8, 10, 3, 5],
      ] as const,
      width: 5,
      height: 9,
      ...domains,
    };
    const original = JSON.parse(JSON.stringify(spec));

    expect(candlestick(spec)).not.toBe('');
    expect(spec).toEqual(original);
  });

  it('renders a single unchanged candle with zero-span inferred domains', () => {
    expect(candlestick({ data: [[1, 5, 5, 5, 5]] })).toContain('─');
  });

  it('returns empty output without inferable domains and an empty frame with both domains', () => {
    expect(candlestick({ data: [] })).toBe('');
    expect(candlestick({ data: [], xAxis: { domain: [0, 1] } })).toBe('');
    expect(
      candlestick({
        data: [],
        xAxis: { domain: [0, 1] },
        yAxis: { domain: [0, 1] },
      }),
    ).not.toBe('');
  });

  it.each([
    [null, ChartTypeError, 'spec'],
    [{}, ChartTypeError, 'data'],
    [{ data: 'bad' }, ChartTypeError, 'data'],
    [{ data: [[0, 1, 2, 3]] }, ChartTypeError, 'data[0]'],
    [{ data: [['0', 1, 2, 0, 1]] }, ChartTypeError, 'data[0][0]'],
    [{ data: [[0, 1, Number.POSITIVE_INFINITY, 0, 1]] }, ChartRangeError, 'data[0][2]'],
    [
      {
        data: [
          [0, 1, 2, 0, 1],
          [0, 2, 3, 1, 2],
        ],
      },
      ChartRangeError,
      'data[1][0]',
    ],
    [{ data: [[0, 5, 6, 5.5, 5]] }, ChartRangeError, 'data[0][3]'],
    [{ data: [[0, 5, 4, 3, 4]] }, ChartRangeError, 'data[0][2]'],
    [{ data: [], style: 'bad' }, ChartTypeError, 'style'],
    [{ data: [], style: { rising: 'bad' } }, ChartTypeError, 'style.rising'],
    [{ data: [], style: { rising: { color: 'green' } } }, ChartRangeError, 'style.rising.color'],
    [{ data: [], style: { rising: { symbol: '界' } } }, ChartRangeError, 'style.rising.symbol'],
    [{ data: [], style: { wick: '\n' } }, ChartRangeError, 'style.wick'],
    [{ data: [], thresholds: [{}] }, ChartTypeError, 'thresholds[0].id'],
    [
      { data: [], thresholds: [{ id: 'target', y: Number.NaN }] },
      ChartRangeError,
      'thresholds[0].y',
    ],
    [{ data: [], width: 0 }, ChartRangeError, 'width'],
    [{ data: [], xAxis: { ticks: 1 } }, ChartRangeError, 'xAxis.ticks'],
    [
      { data: [], xAxis: { domain: [new Date(0), new Date(1)] } },
      ChartTypeError,
      'xAxis.domain[0]',
    ],
  ])('rejects invalid input at a precise path', (spec, ErrorType, path) => {
    expect(() => candlestick(spec as never)).toThrow(ErrorType as unknown as ErrorConstructor);
    expect(() => candlestick(spec as never)).toThrow(path as string);
  });

  it('exposes stable error metadata for invalid OHLC invariants', () => {
    expect(captureError(() => candlestick({ data: [[0, 5, 6, 5.5, 5]] }))).toMatchObject({
      code: 'ERR_CHART_INVALID_VALUE',
      path: 'data[0][3]',
    });
  });
});
