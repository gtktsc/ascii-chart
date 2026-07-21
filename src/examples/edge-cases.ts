import { ChartX, Renderer } from '@types';
import { renderChart } from '@services/chart/render';

import { forEachRenderer } from './renderers';
import { withExampleTerminal } from './terminal';

import type { EdgeCaseScenario, SnapshotExample } from './types';

export type { EdgeCaseScenario } from './types';

/**
 * Examples covering create edge case behavior.
 * @param {readonly EdgeCaseScenario<X>[]} scenarios - The scenarios.
 * @returns {Readonly<{ group: ExampleGroup; title: string; renderer?: Renderer | undefined; only?: boolean | undefined; render: () => string; }>[]} - Computed result.
 */
export const createEdgeCaseExamples = <X extends ChartX>(
  scenarios: readonly EdgeCaseScenario<X>[],
): SnapshotExample[] =>
  scenarios.flatMap(({ title, spec }) =>
    forEachRenderer((renderer: Renderer) => ({
      group: 'renderChart',
      title: `${title} [${renderer}]`,
      renderer,
      render: () => withExampleTerminal(() => renderChart({ ...spec, renderer })),
    })),
  );

const numericEdgeCaseScenarios = [
  {
    title: 'narrow width mixed signs',
    spec: {
      width: 18,
      height: 7,
      series: [
        {
          id: 'mixed',
          data: [
            [0, -4],
            [1, 2],
            [2, -1],
            [3, 5],
            [4, -3],
          ],
        },
      ],
      xAxis: { ticks: [0, 2, 4] },
      yAxis: { domain: [-5, 5], ticks: [-5, 0, 5] },
    },
  },
  {
    title: 'wide width dense oscillation',
    spec: {
      width: 96,
      height: 8,
      series: [
        {
          id: 'oscillation',
          data: Array.from({ length: 25 }, (_, x) => [x, ((x % 6) - 3) * (x % 2 ? -1 : 1)]),
        },
      ],
      xAxis: { ticks: [0, 4, 8, 12, 16, 20, 24] },
      yAxis: { domain: [-4, 4], ticks: [-4, 0, 4] },
    },
  },
  {
    title: 'tiny and huge values together',
    spec: {
      width: 52,
      height: 9,
      series: [
        {
          id: 'scale-gap',
          data: [
            [0, 1e-9],
            [1, 1e12],
            [2, -1e-9],
            [3, -1e12],
            [4, 42],
          ],
        },
      ],
      xAxis: { ticks: [0, 1, 2, 3, 4] },
      yAxis: {
        domain: [-1e12, 1e12],
        ticks: [-1e12, 0, 1e12],
        formatter: (value) => value.toExponential(0),
      },
    },
  },
  {
    title: 'near-zero decimal values',
    spec: {
      width: 36,
      height: 7,
      series: [
        {
          id: 'decimals',
          data: [
            [0, -0.000_003],
            [1, -0.000_001],
            [2, 0],
            [3, 0.000_001],
            [4, 0.000_003],
          ],
        },
      ],
      yAxis: {
        domain: [-0.000_003, 0.000_003],
        ticks: [-0.000_003, 0, 0.000_003],
        formatter: (value) => value.toExponential(0),
      },
    },
  },
  {
    title: 'near safe-integer boundary',
    spec: {
      width: 50,
      height: 8,
      series: [
        {
          id: 'integers',
          data: [
            [0, 9_007_199_254_740_988],
            [1, 9_007_199_254_740_990],
            [2, 9_007_199_254_740_991],
          ],
          mode: 'point',
        },
      ],
      yAxis: { formatter: (value) => value.toExponential(3) },
    },
  },
  {
    title: 'zero plateau with isolated spike',
    spec: {
      width: 42,
      height: 8,
      series: [
        {
          id: 'spike',
          data: [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 1_000_000],
            [4, 0],
            [5, 0],
            [6, 0],
          ],
        },
      ],
      yAxis: { formatter: (value) => value.toExponential(0) },
    },
  },
  {
    title: 'flat constant series',
    spec: {
      width: 28,
      height: 6,
      series: [
        {
          id: 'flat',
          data: [
            [0, 7],
            [1, 7],
            [2, 7],
            [3, 7],
          ],
        },
      ],
    },
  },
  {
    title: 'all-negative magnitude changes',
    spec: {
      width: 40,
      height: 8,
      series: [
        {
          id: 'negative',
          data: [
            [0, -1],
            [1, -10],
            [2, -100],
            [3, -1_000],
            [4, -10_000],
          ],
        },
      ],
      yAxis: { formatter: (value) => value.toExponential(0) },
    },
  },
  {
    title: 'leading and trailing missing values',
    spec: {
      width: 34,
      height: 7,
      series: [
        {
          id: 'window',
          data: [
            [0, null],
            [1, null],
            [2, 3],
            [3, 5],
            [4, 4],
            [5, null],
            [6, null],
          ],
        },
      ],
      xAxis: { domain: [0, 6] },
      yAxis: { domain: [0, 6] },
    },
  },
  {
    title: 'alternating missing values across series',
    spec: {
      width: 44,
      height: 8,
      series: [
        {
          id: 'even',
          data: [
            [0, 2],
            [1, null],
            [2, 4],
            [3, null],
            [4, 6],
          ],
          color: 'ansiBlue',
        },
        {
          id: 'odd',
          data: [
            [0, null],
            [1, 3],
            [2, null],
            [3, 5],
            [4, null],
          ],
          color: 'ansiMagenta',
        },
      ],
      legend: { position: 'bottom' },
    },
  },
  {
    title: 'non-overlapping sparse series',
    spec: {
      width: 46,
      height: 8,
      series: [
        {
          id: 'early',
          data: [
            [0, 4],
            [1, 6],
            [2, null],
            [3, null],
            [4, null],
          ],
          color: 'ansiCyan',
        },
        {
          id: 'late',
          data: [
            [0, null],
            [1, null],
            [2, null],
            [3, 3],
            [4, 7],
          ],
          color: 'ansiYellow',
        },
      ],
    },
  },
  {
    title: 'duplicate numeric x coordinates',
    spec: {
      width: 38,
      height: 8,
      series: [
        {
          id: 'duplicates',
          data: [
            [0, 1],
            [1, 3],
            [1, 7],
            [2, 4],
            [3, 6],
          ],
        },
      ],
    },
  },
  {
    title: 'out-of-order numeric x coordinates',
    spec: {
      width: 38,
      height: 8,
      series: [
        {
          id: 'unordered',
          data: [
            [0, 1],
            [3, 7],
            [1, 3],
            [4, 2],
            [2, 5],
          ],
        },
      ],
    },
  },
  {
    title: 'alternating extreme signs',
    spec: {
      width: 58,
      height: 10,
      series: [
        {
          id: 'extremes',
          data: [
            [0, -1e9],
            [1, 1e9],
            [2, -1e6],
            [3, 1e6],
            [4, -1e3],
            [5, 1e3],
          ],
        },
      ],
      yAxis: { ticks: [-1e9, 0, 1e9], formatter: (value) => value.toExponential(0) },
    },
  },
  {
    title: 'dense step series with internal gaps',
    spec: {
      width: 72,
      height: 8,
      series: [
        {
          id: 'steps',
          interpolation: 'step',
          data: Array.from({ length: 21 }, (_, x) => [x, x === 7 || x === 14 ? null : x % 5]),
        },
      ],
      xAxis: { ticks: [0, 5, 10, 15, 20] },
      yAxis: { domain: [0, 4], ticks: [0, 2, 4] },
    },
  },
  {
    title: 'mixed modes values and gaps',
    spec: {
      width: 54,
      height: 10,
      series: [
        {
          id: 'line',
          data: [
            [0, -3],
            [1, 2],
            [2, null],
            [3, 6],
            [4, -1],
          ],
          color: 'ansiCyan',
        },
        {
          id: 'points',
          data: [
            [0, 4],
            [1, null],
            [2, -4],
            [3, null],
            [4, 3],
          ],
          mode: 'point',
          color: 'ansiYellow',
        },
        {
          id: 'bars',
          data: [
            [0, 1],
            [1, -2],
            [2, 3],
            [3, -1],
            [4, 2],
          ],
          mode: 'bar',
          color: 'ansiMagenta',
        },
      ],
      yAxis: { domain: [-6, 7], ticks: [-6, 0, 7] },
      legend: { position: 'bottom' },
    },
  },
] satisfies readonly EdgeCaseScenario<number>[];

/**
 * Examples covering numeric edge case behavior.
 */
export const numericEdgeCaseExamples: readonly SnapshotExample[] =
  createEdgeCaseExamples(numericEdgeCaseScenarios);
