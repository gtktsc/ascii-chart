import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import test from 'node:test';

import { plot } from 'simple-ascii-chart';

import {
  MAX_MEDIAN_RENDER_MS,
  PERFORMANCE_POINT_COUNT,
  PERFORMANCE_SAMPLE_RUNS,
} from './constants.ts';

const input = Array.from(
  { length: PERFORMANCE_POINT_COUNT },
  (_, x) => [x, Math.sin(x / 100)] as const,
);
const options = { width: 80, height: 20 };

test('renders 100,000 points within performance budget', (context) => {
  plot(input, options);

  const durations = Array.from({ length: PERFORMANCE_SAMPLE_RUNS }, () => {
    const start = performance.now();
    const output = plot(input, options);
    const duration = performance.now() - start;

    assert.notEqual(output.length, 0);
    return duration;
  }).sort((left, right) => left - right);

  const median = durations[Math.floor(durations.length / 2)];
  context.diagnostic(`median ${median.toFixed(2)} ms; budget ${MAX_MEDIAN_RENDER_MS} ms`);
  assert.ok(
    median <= MAX_MEDIAN_RENDER_MS,
    `plot median ${median.toFixed(2)} ms exceeded ${MAX_MEDIAN_RENDER_MS} ms budget`,
  );
});
