import { plot } from '@ascii-chart';

const renderedRows = (chart: string) => chart.split('\n').filter(Boolean);

describe('issue regressions', () => {
  it('renders empty, singleton, and constant series without crashing', () => {
    expect(plot([])).toBe('');
    expect(plot([[0, 7]], { height: 4 })).toContain('7');

    const constant = plot(
      [
        [0, 100],
        [1, 100],
        [2, 100],
      ],
      { height: 4 },
    );

    expect(constant).toContain('100');
    expect(constant).not.toContain('NaN');
  });

  it('preserves small decimal values instead of formatting them as zero', () => {
    const chart = plot(
      [
        [0, 0],
        [1, 0.1],
        [2, 0.2],
        [3, 0.3],
      ],
      { width: 8, height: 4 },
    );

    expect(chart).toContain('0.1');
    expect(chart).toContain('0.2');
    expect(chart).toContain('0.3');
    expect(chart).not.toContain('NaN');
  });

  it.each([1, 2, 5])('uses exactly %i plotting rows when height is configured', (height) => {
    const chart = plot(
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      { width: 6, height, hideXAxis: true, hideYAxis: true },
    );

    expect(renderedRows(chart)).toHaveLength(height);
  });

  it.each([8, 9, 10])('plots both extrema when height is %i', (height) => {
    const rows = renderedRows(
      plot(
        [
          [0, 1],
          [1, 10],
        ],
        { width: 4, height, hideXAxis: true, hideYAxis: true },
      ),
    );

    expect(rows[0]).toMatch(/[━┃┏┓┗┛]/);
    expect(rows.at(-1)).toMatch(/[━┃┏┓┗┛]/);
  });

  it('renders non-overlapping labels for a fixed y-axis range', () => {
    const chart = plot(
      [
        [0, 20],
        [1, 80],
      ],
      {
        width: 8,
        height: 5,
        yRange: [0, 100],
        showTickLabel: true,
        formatter: (value, { axis }) => (axis === 'y' ? `Y${value}` : `X${value}`),
      },
    );

    expect(chart).toContain('Y80');
    expect(chart).toContain('Y60');
    expect(chart).toContain('Y40');
    expect(chart).toContain('Y20');
    expect(chart).toContain('Y0');
    expect(chart).not.toContain('YY');
  });

  it('clips fixed-range tick labels that exceed the measured label margin', () => {
    const chart = plot(
      [
        [0, 20],
        [1, 80],
      ],
      {
        width: 8,
        height: 5,
        yRange: [0, 100],
        showTickLabel: true,
        formatter: (value, { axis }) => (axis === 'y' && value === 60 ? 'LABEL-TOO-LONG' : value),
      },
    );

    expect(chart).not.toContain('undefined');
  });

  it('bounds a 21,500-point series to the configured width', () => {
    const chart = plot(
      Array.from({ length: 21_500 }, (_, x) => [x, 968 + Math.sin(x / 10)]),
      { width: 80, height: 15, hideXAxisTicks: true },
    );
    const rowWidths = renderedRows(chart).map((row) => row.length);

    expect(Math.max(...rowWidths)).toBeLessThanOrEqual(90);
    expect(new Set(rowWidths)).toHaveProperty('size', 1);
  });

  it('keeps every rendered row padded to one width for terminal redraws', () => {
    const chart = plot(
      [
        [0, 0],
        [1, 1],
        [2, 0],
      ],
      { width: 8, height: 4 },
    );
    const rowWidths = renderedRows(chart).map((row) => row.length);

    expect(new Set(rowWidths)).toHaveProperty('size', 1);
  });

  it('keeps significant digits in large y-axis labels', () => {
    const chart = plot(
      [
        [0, 123_456],
        [1, 987_654],
      ],
      { width: 8, height: 4 },
    );

    expect(chart).toContain('123.456k');
    expect(chart).toContain('987.654k');
  });

  it('supports ASCII-only symbols for environments without box-drawing glyphs', () => {
    const chart = plot(
      [
        [0, 0],
        [1, 1],
        [2, 0],
      ],
      {
        width: 8,
        height: 4,
        symbols: {
          axis: {
            n: '^',
            ns: '|',
            y: '+',
            nse: '+',
            x: '+',
            we: '-',
            e: '>',
            intersectionXY: '+',
            intersectionX: '+',
            intersectionY: '+',
          },
          chart: { we: '-', wns: '+', ns: '|', nse: '+', wsn: '+', sne: '+', area: '#' },
        },
      },
    );

    expect(chart).not.toMatch(/[^\x00-\x7F]/);
  });

  it('renders multiple series with independent colors', () => {
    const chart = plot(
      [
        [
          [0, 0],
          [1, 1],
        ],
        [
          [0, 1],
          [1, 0],
        ],
      ],
      { width: 6, height: 4, color: ['ansiRed', 'ansiBlue'] },
    );

    expect(chart).toContain('\u001b[31m');
    expect(chart).toContain('\u001b[34m');
  });

  it('renders an x-axis label', () => {
    const chart = plot(
      [
        [0, 0],
        [1, 1],
      ],
      { width: 6, height: 4, xLabel: 'time' },
    );

    expect(chart).toContain('time');
  });
});
