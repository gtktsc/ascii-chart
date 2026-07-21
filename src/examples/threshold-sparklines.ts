import { sparkline } from '@services/renderers/sparkline';

import type { SnapshotExample, ThresholdSparklineScenario } from './types';

/**
 * Scenario definitions for threshold sparkline examples.
 */
export const thresholdSparklineScenarios = [
  {
    title: 'threshold compact latency',
    size: 'small',
    values: [12, 18, 22, 35, 29, 41],
    threshold: 30,
    belowColor: 'ansiBlue',
    aboveColor: 'ansiRed',
  },
  {
    title: 'threshold compact signed balance',
    size: 'small',
    values: [-8, -3, 0, 4, 9, -2],
    threshold: 0,
    belowColor: 'ansiBrightRed',
    aboveColor: 'ansiBrightGreen',
  },
  {
    title: 'threshold compact battery reserve',
    size: 'small',
    values: [8, 15, 24, 33, 18, 42],
    threshold: 20,
    belowColor: 'ansiRed',
    aboveColor: 'ansiGreen',
  },
  {
    title: 'threshold compact freeze boundary',
    size: 'small',
    values: [-12, -5, -1, 0, 3, 8, -4],
    threshold: -2,
    belowColor: 'ansiBrightCyan',
    aboveColor: 'ansiYellow',
  },
  {
    title: 'threshold compact error budget',
    size: 'small',
    values: [0.1, 0.5, 1.2, 2.8, 0.9, 3.5],
    threshold: 1.5,
    belowColor: 'ansiGreen',
    aboveColor: 'ansiBrightMagenta',
  },
  {
    title: 'threshold compact queue pressure',
    size: 'small',
    values: [2, 7, 12, 19, 26, 14, 5],
    threshold: 15,
    belowColor: 'ansiCyan',
    aboveColor: 'ansiBrightYellow',
  },
  {
    title: 'threshold wide CPU saturation',
    size: 'wide',
    values: [
      34, 42, 51, 63, 72, 79, 86, 91, 83, 76, 69, 58, 47, 55, 66, 74, 81, 88, 93, 84, 71, 62, 53,
      45,
    ],
    threshold: 75,
    belowColor: 'ansiBrightBlue',
    aboveColor: 'ansiBrightRed',
  },
  {
    title: 'threshold wide request rate',
    size: 'wide',
    values: [
      62, 68, 75, 83, 91, 104, 118, 127, 113, 98, 87, 79, 72, 85, 96, 108, 121, 134, 129, 116, 103,
      94, 86, 78, 89, 101, 115, 123, 110, 97,
    ],
    threshold: 100,
    belowColor: 'ansiWhite',
    aboveColor: 'ansiBrightGreen',
  },
  {
    title: 'threshold wide memory pressure',
    size: 'wide',
    values: [
      51, 56, 62, 67, 73, 78, 82, 87, 91, 88, 84, 79, 74, 69, 65, 71, 77, 83, 89, 94, 90, 85, 80,
      76, 70, 64, 58, 53,
    ],
    threshold: 80,
    belowColor: 'ansiBrightBlack',
    aboveColor: 'ansiMagenta',
  },
  {
    title: 'threshold wide temperature band',
    size: 'wide',
    values: [
      17, 18, 20, 22, 25, 28, 31, 34, 36, 33, 30, 27, 24, 21, 19, 20, 23, 26, 29, 32, 35, 37, 34,
      30, 27, 24, 22, 20, 18, 17,
    ],
    threshold: 28,
    belowColor: 'ansiBlue',
    aboveColor: 'ansiBrightYellow',
  },
  {
    title: 'threshold wide cash flow',
    size: 'wide',
    values: [
      -28, -16, -4, 8, 21, 35, 18, 6, -9, -22, -11, 3, 17, 29, 42, 24, 9, -5, -19, -8, 5, 16, 31,
      12, -3, -14,
    ],
    threshold: 10,
    belowColor: 'ansiRed',
    aboveColor: 'ansiBrightCyan',
  },
  {
    title: 'threshold wide release health with gaps',
    size: 'wide',
    values: [
      91,
      92,
      94,
      96,
      98,
      97,
      95,
      93,
      null,
      null,
      90,
      92,
      95,
      97,
      99,
      98,
      96,
      94,
      92,
      91,
      null,
      93,
      95,
      96,
      98,
      99,
      97,
      94,
      92,
      90,
      93,
      96,
      98,
      97,
      95,
      94,
    ],
    threshold: 95,
    belowColor: 'ansiYellow',
    aboveColor: 'ansiBrightGreen',
  },
] as const satisfies readonly ThresholdSparklineScenario[];

/**
 * Examples covering threshold sparkline behavior.
 */
export const thresholdSparklineExamples: readonly SnapshotExample[] =
  thresholdSparklineScenarios.map(
    ({ title, values, threshold, belowColor, aboveColor }): SnapshotExample => ({
      group: 'sparkline',
      title,
      render: () =>
        sparkline(values, {
          threshold: { value: threshold, belowColor, aboveColor },
        }),
    }),
  );
