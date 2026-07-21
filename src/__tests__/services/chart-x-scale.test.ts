import { ChartSpec } from '@types';
import { formatDateTick } from '@services/chart/x-axis/format';
import { normalizeChartX } from '@services/chart/x-axis/normalize';

describe('structured X scales', () => {
  it.each([
    ['2026-01-01T00:00:05.000Z', [0, 30_000] as const, '00:00:05'],
    ['2026-01-01T12:30:00.000Z', [0, 60_000] as const, '12:30'],
    ['2026-06-15T00:00:00.000Z', [Date.UTC(2026, 0, 1), Date.UTC(2026, 11, 31)] as const, '06-15'],
    [
      '2027-01-01T00:00:00.000Z',
      [Date.UTC(2026, 0, 1), Date.UTC(2027, 0, 1)] as const,
      '2027-01-01',
    ],
  ])('formats %s for its UTC domain span', (iso, domain, expected) => {
    expect(formatDateTick(new Date(iso), domain)).toBe(expected);
  });

  it('normalizes category bands, configured counts, overlays, and value-label context', () => {
    const contexts: unknown[] = [];
    const normalized = normalizeChartX({
      series: [
        {
          id: 'series',
          data: [
            ['second', 2],
            ['first', 1],
          ],
        },
      ],
      xAxis: { domain: ['first', 'second'], ticks: 2 },
      points: [{ id: 'point', x: 'second', y: 2 }],
      thresholds: [
        { id: 'threshold', x: 'first' },
        { id: 'y-only', y: 1 },
      ],
      annotations: [
        { id: 'x-span', type: 'span', axis: 'x', from: 'first', to: 'second' },
        { id: 'y-span', type: 'span', axis: 'y', from: 0, to: 1 },
        { id: 'text', type: 'text', x: 'second', y: 2, text: 'label' },
        { id: 'arrow', type: 'arrow', from: ['first', 1], to: ['second', 2] },
        { id: 'error', type: 'errorBar', x: 'first', y: 1, yError: 1 },
      ],
      valueLabels: {
        formatter: (value, context) => {
          contexts.push(context);
          return value;
        },
      },
    });

    expect(normalized.spec.series[0].data).toEqual([
      [1, 2],
      [0, 1],
    ]);
    expect(normalized.spec.xAxis?.domain).toEqual([-0.5, 1.5]);
    expect(normalized.spec.xAxis?.ticks).toEqual([0, 1]);
    expect(normalized.spec.points?.[0].x).toBe(1);
    expect(normalized.spec.thresholds?.map(({ x }) => x)).toEqual([0, undefined]);
    expect(normalized.spec.annotations).toEqual([
      expect.objectContaining({ from: -0.5, to: 1.5 }),
      expect.objectContaining({ from: 0, to: 1 }),
      expect.objectContaining({ x: 1 }),
      expect.objectContaining({ from: [0, 1], to: [1, 2] }),
      expect.objectContaining({ x: 0 }),
    ]);
    const formatter = (
      normalized.spec.valueLabels as Exclude<
        typeof normalized.spec.valueLabels,
        boolean | undefined
      >
    ).formatter;
    formatter?.(2, {
      seriesIndex: 0,
      datumIndex: 0,
      x: 1,
      y: 2,
      mode: 'bar',
      layout: 'overlap',
    });
    expect(contexts).toEqual([expect.objectContaining({ x: 'second' })]);
  });

  it('rejects band tick counts larger than the category domain', () => {
    expect(() =>
      normalizeChartX({
        series: [{ id: 'series', data: [['only', 1]] }],
        xAxis: { ticks: 2 },
      }),
    ).toThrow(/xAxis.ticks/);
  });

  it('rejects reversed category annotation spans', () => {
    expect(() =>
      normalizeChartX({
        series: [
          {
            id: 'series',
            data: [
              ['one', 1],
              ['two', 2],
            ],
          },
        ],
        annotations: [{ id: 'span', type: 'span', axis: 'x', from: 'two', to: 'one' }],
      }),
    ).toThrow(/annotations\[0\].to/);
  });

  it('normalizes explicit category ticks and native formatters', () => {
    const normalized = normalizeChartX({
      series: [
        {
          id: 'series',
          data: [
            ['one', 1],
            ['two', 2],
            ['three', 3],
          ],
        },
      ],
      xAxis: {
        scale: 'band',
        ticks: ['one', 'three'],
        formatter: (value) => value.toUpperCase(),
      },
      valueLabels: {},
    });

    expect(normalized.spec.xAxis?.ticks).toEqual([0, 2]);
    expect(
      normalized.spec.xAxis?.formatter?.(2, {
        axis: 'x',
        xRange: [],
        yRange: [],
      }),
    ).toBe('THREE');
    expect(normalized.spec.valueLabels).toEqual({});
  });

  it.each([
    [['missing'], /xAxis.ticks\[0\]/],
    [['two', 'one'], /xAxis.ticks/],
  ])('rejects invalid inferred-domain category ticks %s', (ticks, error) => {
    expect(() =>
      normalizeChartX({
        series: [
          {
            id: 'series',
            data: [
              ['one', 1],
              ['two', 2],
            ],
          },
        ],
        xAxis: { ticks },
      }),
    ).toThrow(error);
  });

  it('supports an empty explicit band domain', () => {
    const normalized = normalizeChartX({
      series: [],
      xAxis: { scale: 'band' },
    });

    expect(normalized.spec.xAxis?.domain).toBeUndefined();
    expect(normalized.spec.xAxis?.ticks).toBeUndefined();
    expect(
      normalized.spec.xAxis?.formatter?.(0, {
        axis: 'x',
        xRange: [],
        yRange: [],
      }),
    ).toBe('');
  });

  it('normalizes time domains, ticks, and automatic labels', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const end = new Date('2026-01-02T00:00:00.000Z');
    const normalized = normalizeChartX({
      series: [
        {
          id: 'series',
          data: [
            [start, 1],
            [end, 2],
          ],
        },
      ],
      xAxis: { domain: [start, end], ticks: 2 },
      annotations: [{ id: 'span', type: 'span', axis: 'x', from: start, to: end }],
    });

    expect(normalized.spec.series[0].data).toEqual([
      [start.getTime(), 1],
      [end.getTime(), 2],
    ]);
    expect(normalized.spec.xAxis?.domain).toEqual([start.getTime(), end.getTime()]);
    expect(normalized.spec.annotations?.[0]).toEqual(
      expect.objectContaining({ from: start.getTime(), to: end.getTime() }),
    );
    expect(
      normalized.spec.xAxis?.formatter?.(start.getTime(), {
        axis: 'x',
        xRange: [],
        yRange: [],
      }),
    ).toBe('01-01');
  });

  it('infers a time domain and passes Date ticks to custom formatters', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const end = new Date('2026-01-01T12:00:00.000Z');
    const seen: Date[] = [];
    const normalized = normalizeChartX({
      series: [
        {
          id: 'series',
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
          return value.getUTCHours();
        },
      },
    });

    expect(normalized.spec.xAxis?.ticks).toEqual([start.getTime(), end.getTime()]);
    expect(
      normalized.spec.xAxis?.formatter?.(end.getTime(), {
        axis: 'x',
        xRange: [],
        yRange: [],
      }),
    ).toBe(12);
    expect(seen).toEqual([end]);
  });

  it('uses inferred and fallback time domains without configured ticks', () => {
    const instant = new Date('2026-01-01T00:00:05.000Z');
    const inferred = normalizeChartX({
      series: [{ id: 'series', data: [[instant, 1]] }],
    });
    const fallback = normalizeChartX({
      series: [],
      xAxis: { scale: 'time' },
    });
    const helpers = { axis: 'x' as const, xRange: [], yRange: [] };

    expect(inferred.spec.xAxis?.formatter?.(instant.getTime(), helpers)).toBe('00:00:05');
    expect(fallback.spec.xAxis?.formatter?.(instant.getTime(), helpers)).toBe('00:00:05');
  });

  it('infers native scale from axis domain or ticks without data', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const end = new Date('2026-01-02T00:00:00.000Z');

    expect(
      normalizeChartX({
        series: [],
        xAxis: { domain: ['one', 'two'] },
      }).spec.xAxis?.domain,
    ).toEqual([-0.5, 1.5]);
    expect(
      normalizeChartX({
        series: [],
        xAxis: { ticks: [start, end] },
      }).spec.xAxis?.ticks,
    ).toEqual([start.getTime(), end.getTime()]);
  });

  it('leaves numeric structured specs unchanged', () => {
    const spec: ChartSpec<number> = { series: [{ id: 'series', data: [[0, 1]] }] };
    expect(normalizeChartX(spec).spec).toBe(spec);
    expect(normalizeChartX({ series: [] }).spec).toEqual({ series: [] });
  });
});
