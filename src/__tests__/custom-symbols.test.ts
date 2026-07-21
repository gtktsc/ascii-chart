import { candlestick, DEFAULT_SYMBOLS, heatmap, renderChart, sparkline } from '@ascii-chart';
import { stripAnsi } from '@helpers/terminal-text';

describe('customizable default symbols', () => {
  it('exports every default symbol domain', () => {
    expect(Object.keys(DEFAULT_SYMBOLS)).toEqual([
      'plot',
      'heatmap',
      'sparkline',
      'candlestick',
      'annotations',
      'text',
    ]);
  });

  it('overrides sparkline levels and null cells without mutating options', () => {
    const symbols = {
      levels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      empty: '.',
    } as const;

    expect(sparkline([0, null, 7], { symbols })).toBe('a.h');
    expect(symbols).toEqual({
      levels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      empty: '.',
    });
  });

  it('overrides heatmap defaults while preserving explicit level precedence', () => {
    expect(
      heatmap({
        data: [[0, null, 1]],
        levels: [{ value: 0 }, { value: 1, symbol: '!' }],
        symbols: { cell: 'x', empty: '.', gap: '|' },
      }),
    ).toBe('x|.|!');
  });

  it('preserves explicit threshold symbol precedence over heatmap defaults', () => {
    const output = heatmap({
      data: [[0, 1]],
      threshold: {
        value: 1,
        belowColor: 'ansiBlue',
        aboveColor: 'ansiRed',
        belowSymbol: 'l',
        aboveSymbol: 'h',
      },
      symbols: { belowThreshold: 'b', aboveThreshold: 'a', gap: '' },
    });

    expect(stripAnsi(output)).toBe('lh');
  });

  it('uses chart-level candlestick defaults and preserves style precedence', () => {
    const base = {
      data: [
        [0, 4, 8, 2, 7],
        [1, 7, 8, 2, 4],
        [2, 5, 8, 2, 5],
      ] as const,
      width: 9,
      height: 7,
      xAxis: { domain: [0, 3] as const, hidden: true, hideTicks: true },
      yAxis: { domain: [0, 10] as const, hidden: true, hideTicks: true },
      symbols: {
        candlestick: { wick: 'w', rising: 'r', falling: 'f', unchanged: 'u' },
      },
    };

    const custom = candlestick(base);
    expect(custom).toContain('w');
    expect(custom).toContain('r');
    expect(custom).toContain('f');
    expect(custom).toContain('u');

    const explicit = candlestick({
      ...base,
      style: { wick: 'W', rising: { symbol: 'R' } },
    });
    expect(explicit).toContain('W');
    expect(explicit).toContain('R');
    expect(explicit).not.toContain('w');
  });

  it('overrides annotation and ellipsis symbols through chart symbols', () => {
    const output = renderChart({
      width: 10,
      height: 5,
      series: [
        {
          id: 'series',
          data: [
            [0, 0],
            [10, 10],
          ],
        },
      ],
      xAxis: { domain: [0, 10], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 10], hidden: true, hideTicks: true },
      annotations: [
        { id: 'span', type: 'span', axis: 'y', from: 2, to: 3, symbol: 'S' },
        { id: 'arrow', type: 'arrow', from: [2, 8], to: [8, 6], lineSymbol: 'L' },
        { id: 'error', type: 'errorBar', x: 5, y: 5, xError: 1, yError: 1 },
      ],
      symbols: {
        ellipsis: '~',
        annotations: {
          span: 's',
          arrowLine: 'a',
          arrowHeads: { right: '>' },
          errorBar: {
            horizontal: '-',
            vertical: '|',
            leftCap: '[',
            rightCap: ']',
            topCap: '^',
            bottomCap: 'v',
            center: '+',
          },
        },
      },
    });

    expect(output).toContain('S');
    expect(output).toContain('L');
    expect(output).toContain('>');
    expect(output).toContain('+');
  });

  it('uses the configured ellipsis for adaptive tick truncation', () => {
    const output = renderChart({
      width: 5,
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
      xAxis: {
        ticks: [0, 1],
        labelCollision: 'truncate',
        formatter: (value) => `category-${value}`,
      },
      symbols: { ellipsis: '~' },
    });

    expect(output).toContain('~');
  });

  it.each([
    [{ symbols: { levels: ['x'] } }, 'options.symbols.levels'],
    [
      { symbols: { levels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', '界'] } },
      'options.symbols.levels[7]',
    ],
    [{ symbols: { empty: '界' } }, 'options.symbols.empty'],
  ])('rejects invalid sparkline symbols %#', (options, path) => {
    expect(() => sparkline([1], options as never)).toThrow(path);
  });

  it('rejects a non-array sparkline level catalog', () => {
    expect(() => sparkline([1], { symbols: { levels: 'invalid' } } as never)).toThrow(
      'options.symbols.levels: must be an array',
    );
  });

  it.each([
    [{ cell: '界' }, 'symbols.cell'],
    [{ empty: '\n' }, 'symbols.empty'],
    [{ gap: '\n' }, 'symbols.gap'],
  ])('rejects invalid heatmap symbols %#', (symbols, path) => {
    expect(() => heatmap({ data: [[1]], levels: [{ value: 1 }], symbols } as never)).toThrow(path);
  });

  it('merges sparse renderer symbol groups field by field', () => {
    expect(heatmap({ data: [[1]], levels: [{ value: 1 }], symbols: { cell: '#' } })).toBe('#');

    expect(() =>
      renderChart({
        series: [{ id: 'series', data: [[0, 1]] }],
        symbols: { candlestick: {}, annotations: {} },
      }),
    ).not.toThrow();
  });

  it.each([
    [{ ellipsis: '界' }, 'symbols.ellipsis'],
    [{ candlestick: { wick: '界' } }, 'symbols.candlestick.wick'],
    [{ annotations: { span: '\n' } }, 'symbols.annotations.span'],
    [{ annotations: { arrowHeads: { up: '界' } } }, 'symbols.annotations.arrowHeads.up'],
    [{ annotations: { errorBar: { center: '界' } } }, 'symbols.annotations.errorBar.center'],
  ])('rejects invalid chart symbol groups %#', (symbols, path) => {
    expect(() =>
      renderChart({ series: [{ id: 'series', data: [[0, 1]] }], symbols } as never),
    ).toThrow(path);
  });
});
