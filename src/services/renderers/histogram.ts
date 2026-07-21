import { HistogramData, HistogramOptions } from '@types';
import { interpolateRange, normalizeInRange } from '@helpers/numeric-range';
import { rangeError, typeError } from '@services/errors';

import type { HistogramRenderer } from './types';

const assertFiniteNumber = (value: unknown, path: string): number => {
  if (typeof value !== 'number') return typeError(path, 'must be a number');
  if (!Number.isFinite(value)) return rangeError(path, 'must be finite');
  return value;
};

const assertBinCount = (value: unknown): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'number') return typeError('options.binCount', 'must be a number');
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
    return rangeError('options.binCount', 'must be a positive integer');
  }
  return value;
};

const mergeBuckets = (input: HistogramData): HistogramData => {
  const counts = new Map<number, number>();

  input.forEach((bucket, index) => {
    const path = `buckets[${index}]`;
    if (!Array.isArray(bucket) || bucket.length !== 2) {
      typeError(path, 'must contain exactly x and count');
    }
    const x = assertFiniteNumber(bucket[0], `${path}[0]`);
    const count = assertFiniteNumber(bucket[1], `${path}[1]`);
    if (!Number.isInteger(count) || count < 0) {
      rangeError(`${path}[1]`, 'must be a non-negative integer');
    }
    const mergedCount = (counts.get(x) ?? 0) + count;
    if (!Number.isFinite(mergedCount)) {
      rangeError(`${path}[1]`, 'merged count must be finite');
    }
    counts.set(x, mergedCount);
  });

  return [...counts.entries()].sort(([left], [right]) => left - right);
};

const binSamples = (
  input: readonly number[],
  options: HistogramOptions | undefined,
): HistogramData => {
  const configuredBinCount = assertBinCount(options?.binCount);
  const samples = input.map((value, index) => assertFiniteNumber(value, `values[${index}]`));
  if (samples.length === 0) return [];

  let min = samples[0];
  let max = samples[0];
  samples.forEach((value) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
  });
  if (min === max) return [[min, samples.length]];

  const binCount = configuredBinCount ?? Math.ceil(Math.log2(samples.length) + 1);
  const counts = Array.from({ length: binCount }, () => 0);

  samples.forEach((value) => {
    const binIndex = Math.min(
      binCount - 1,
      Math.floor(normalizeInRange(value, min, max) * binCount),
    );
    counts[binIndex] += 1;
  });

  return counts.map((count, index) => [
    interpolateRange(min, max, (index + 0.5) / binCount),
    count,
  ]);
};

/**
 * Converts raw samples or pre-counted buckets into normalized histogram data.
 * @param {readonly number[] | HistogramData} input - Raw samples or histogram buckets.
 * @param {HistogramOptions} [options] - Binning options used for raw samples.
 * @returns {HistogramData} - Sorted and normalized histogram buckets.
 */
export const histogram: HistogramRenderer = (input, options?: HistogramOptions) => {
  if (!Array.isArray(input)) return typeError('values', 'must be an array');
  if (input.length > 0 && Array.isArray(input[0])) return mergeBuckets(input as HistogramData);
  return binSamples(input as readonly number[], options);
};
