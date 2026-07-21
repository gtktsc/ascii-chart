import { sparkline } from '@services/renderers/sparkline';

import type { MulticolorSparklineScenario, SnapshotExample } from './types';

const scenarios = [
  {
    title: 'multicolor service health',
    values: [99, 98, 92, 85, 70, 88, 96, 99],
    colors: [
      'ansiBrightGreen',
      'ansiGreen',
      'ansiYellow',
      'ansiYellow',
      'ansiRed',
      'ansiYellow',
      'ansiGreen',
      'ansiBrightGreen',
    ],
  },
  {
    title: 'multicolor latency SLA',
    values: [80, 110, 140, 220, 480, 310, 170, 120],
    colors: [
      'ansiGreen',
      'ansiGreen',
      'ansiGreen',
      'ansiYellow',
      'ansiBrightRed',
      'ansiRed',
      'ansiYellow',
      'ansiGreen',
    ],
  },
  {
    title: 'multicolor profit and loss',
    values: [-5, 2, 8, -3, 0, 7, -9, 4],
    colors: [
      'ansiRed',
      'ansiGreen',
      'ansiBrightGreen',
      'ansiRed',
      'ansiYellow',
      'ansiGreen',
      'ansiBrightRed',
      'ansiGreen',
    ],
  },
  {
    title: 'multicolor temperature zones',
    values: [-10, 0, 8, 18, 26, 34, 41, 29],
    colors: [
      'ansiCyan',
      'ansiBrightCyan',
      'ansiBlue',
      'ansiGreen',
      'ansiYellow',
      'ansiRed',
      'ansiBrightRed',
      'ansiYellow',
    ],
  },
  {
    title: 'multicolor battery charge',
    values: [5, 12, 25, 40, 58, 73, 88, 100],
    colors: [
      'ansiBrightRed',
      'ansiRed',
      'ansiYellow',
      'ansiYellow',
      'ansiGreen',
      'ansiGreen',
      'ansiBrightGreen',
      'ansiBrightGreen',
    ],
  },
  {
    title: 'multicolor anomaly detection',
    values: [10, 11, 9, 10, 12, 55, 11, 10, 65, 12],
    colors: [
      'ansiBlue',
      'ansiBlue',
      'ansiCyan',
      'ansiBlue',
      'ansiCyan',
      'ansiBrightRed',
      'ansiBlue',
      'ansiBlue',
      'ansiBrightRed',
      'ansiCyan',
    ],
  },
  {
    title: 'multicolor deployment stages',
    values: [10, 30, 50, null, 60, 75, 90, 100],
    colors: [
      'ansiBlue',
      'ansiCyan',
      'ansiYellow',
      undefined,
      'ansiMagenta',
      'ansiBlue',
      'ansiGreen',
      'ansiBrightGreen',
    ],
  },
  {
    title: 'multicolor queue pressure',
    values: [2, 5, 10, 20, 40, 80, 50, 25],
    colors: [
      'ansiGreen',
      'ansiGreen',
      'ansiGreen',
      'ansiYellow',
      'ansiRed',
      'ansiBrightRed',
      'ansiRed',
      'ansiYellow',
    ],
  },
  {
    title: 'multicolor market momentum',
    values: [-8, -3, 1, 5, 9, 2, -4, -10, -2, 4],
    colors: [
      'ansiBrightRed',
      'ansiRed',
      'ansiYellow',
      'ansiGreen',
      'ansiBrightGreen',
      'ansiGreen',
      'ansiRed',
      'ansiBrightRed',
      'ansiRed',
      'ansiGreen',
    ],
  },
  {
    title: 'multicolor rainbow palette',
    values: [0, 1, 2, 3, 4, 5, 6, 7],
    colors: [
      'ansiRed',
      'ansiYellow',
      'ansiGreen',
      'ansiCyan',
      'ansiBlue',
      'ansiMagenta',
      'ansiBrightCyan',
      'ansiBrightWhite',
    ],
  },
] satisfies readonly MulticolorSparklineScenario[];

/**
 * Examples covering multicolor sparkline behavior.
 */
export const multicolorSparklineExamples: readonly SnapshotExample[] = scenarios.map(
  ({ title, values, colors }) => ({
    group: 'sparkline',
    title,
    render: () => sparkline(values, { color: colors }),
  }),
);
