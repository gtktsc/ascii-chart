import { HistogramData } from '@types';
import { ChartRangeError, ChartTypeError } from '@services/errors';
import { histogram } from '@services/renderers/histogram';

describe('histogram', () => {
  it('uses Sturges binning and returns bin midpoints for raw samples', () => {
    expect(histogram([0, 1, 2, 3, 4, 5, 6, 7])).toEqual([
      [0.875, 2],
      [2.625, 2],
      [4.375, 2],
      [6.125, 2],
    ]);
  });

  it('includes empty bins and the maximum sample in the final bin', () => {
    expect(histogram([0, 4], { binCount: 4 })).toEqual([
      [0.5, 1],
      [1.5, 0],
      [2.5, 0],
      [3.5, 1],
    ]);
  });

  it('returns one bin for constant samples and no bins for empty input', () => {
    expect(histogram([4, 4, 4], { binCount: 8 })).toEqual([[4, 3]]);
    expect(histogram([])).toEqual([]);
  });

  it('sorts and merges pre-counted buckets while preserving zero counts', () => {
    const buckets: HistogramData = [
      [2, 1],
      [1, 0],
      [2, 3],
    ];

    expect(histogram(buckets)).toEqual([
      [1, 0],
      [2, 4],
    ]);
  });

  it('does not mutate raw samples or pre-counted buckets', () => {
    const samples = [3, 1, 2];
    const buckets = [
      [2, 1],
      [1, 2],
    ] as const;
    const originalSamples = [...samples];
    const originalBuckets = buckets.map((bucket) => [...bucket]);

    histogram(samples, { binCount: 2 });
    histogram(buckets);

    expect(samples).toEqual(originalSamples);
    expect(buckets).toEqual(originalBuckets);
  });

  it('bins finite values whose direct numeric range would overflow', () => {
    const max = Number.MAX_VALUE;
    const data = histogram([-max, max], { binCount: 2 });

    expect(data.map(([, count]) => count)).toEqual([1, 1]);
    expect(data[0][0] / max).toBeCloseTo(-0.5);
    expect(data[1][0] / max).toBeCloseTo(0.5);
  });

  it.each([0, -1, 1.5, Number.POSITIVE_INFINITY])('rejects invalid bin count %s', (binCount) => {
    expect(() => histogram([1, 2], { binCount })).toThrow(ChartRangeError);
    expect(() => histogram([1, 2], { binCount })).toThrow('options.binCount');
  });

  it('rejects a non-numeric bin count', () => {
    expect(() => histogram([1, 2], { binCount: '2' } as never)).toThrow(ChartTypeError);
    expect(() => histogram([1, 2], { binCount: '2' } as never)).toThrow('options.binCount');
  });

  it('rejects merged bucket counts that overflow', () => {
    expect(() =>
      histogram([
        [1, Number.MAX_VALUE],
        [1, Number.MAX_VALUE],
      ]),
    ).toThrow('buckets[1][1]');
  });

  it.each([
    [[1, Number.NaN], 'values[1]', ChartRangeError],
    [[1, [2, 3]] as never, 'values[1]', ChartTypeError],
    [[[1, 2, 3]] as never, 'buckets[0]', ChartTypeError],
    [[[Number.POSITIVE_INFINITY, 1]] as never, 'buckets[0][0]', ChartRangeError],
    [[[1, -1]] as never, 'buckets[0][1]', ChartRangeError],
    [[[1, 1.5]] as never, 'buckets[0][1]', ChartRangeError],
    ['bad' as never, 'values', ChartTypeError],
  ])('rejects invalid input %#', (input, path, ErrorClass) => {
    expect(() => histogram(input as never)).toThrow(ErrorClass as unknown as ErrorConstructor);
    expect(() => histogram(input as never)).toThrow(path as string);
  });
});
