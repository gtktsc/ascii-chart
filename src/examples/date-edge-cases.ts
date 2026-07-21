import { createEdgeCaseExamples, EdgeCaseScenario } from './edge-cases';
import { SnapshotExample } from './types';

const at = (value: string): Date => new Date(value);

const dateEdgeCaseScenarios = [
  {
    title: 'date millisecond range',
    spec: {
      width: 64,
      height: 7,
      series: [
        {
          id: 'milliseconds',
          data: [
            [at('2026-01-01T00:00:00.000Z'), 1],
            [at('2026-01-01T00:00:00.250Z'), 4],
            [at('2026-01-01T00:00:00.500Z'), 2],
            [at('2026-01-01T00:00:00.750Z'), 5],
          ],
        },
      ],
      xAxis: {
        ticks: [
          at('2026-01-01T00:00:00.000Z'),
          at('2026-01-01T00:00:00.250Z'),
          at('2026-01-01T00:00:00.500Z'),
          at('2026-01-01T00:00:00.750Z'),
        ],
        formatter: (value) => value.toISOString().slice(11, 23),
        labelCollision: 'hide',
      },
    },
  },
  {
    title: 'date second range',
    spec: {
      width: 44,
      height: 7,
      series: [
        {
          id: 'seconds',
          data: [
            [at('2026-02-01T12:00:00.000Z'), 3],
            [at('2026-02-01T12:00:10.000Z'), 1],
            [at('2026-02-01T12:00:20.000Z'), 4],
            [at('2026-02-01T12:00:30.000Z'), 2],
          ],
        },
      ],
      xAxis: { ticks: 4 },
    },
  },
  {
    title: 'date minute range crossing hour',
    spec: {
      width: 46,
      height: 8,
      series: [
        {
          id: 'minutes',
          data: [
            [at('2026-03-01T23:50:00.000Z'), 2],
            [at('2026-03-01T23:59:00.000Z'), 6],
            [at('2026-03-02T00:01:00.000Z'), 4],
            [at('2026-03-02T00:10:00.000Z'), 7],
          ],
        },
      ],
      xAxis: { ticks: 5 },
    },
  },
  {
    title: 'date hourly range crossing midnight',
    spec: {
      width: 54,
      height: 8,
      series: [
        {
          id: 'hours',
          data: [
            [at('2026-04-30T21:00:00.000Z'), -2],
            [at('2026-04-30T23:00:00.000Z'), 1],
            [at('2026-05-01T01:00:00.000Z'), 5],
            [at('2026-05-01T03:00:00.000Z'), 2],
          ],
        },
      ],
      xAxis: { ticks: 4 },
      yAxis: { domain: [-3, 6] },
    },
  },
  {
    title: 'date leap-day boundary',
    spec: {
      width: 48,
      height: 8,
      series: [
        {
          id: 'leap-day',
          data: [
            [at('2024-02-28T00:00:00.000Z'), 2],
            [at('2024-02-29T00:00:00.000Z'), 8],
            [at('2024-03-01T00:00:00.000Z'), 3],
          ],
        },
      ],
      xAxis: {
        ticks: [
          at('2024-02-28T00:00:00.000Z'),
          at('2024-02-29T00:00:00.000Z'),
          at('2024-03-01T00:00:00.000Z'),
        ],
      },
    },
  },
  {
    title: 'date month-end boundary',
    spec: {
      width: 50,
      height: 8,
      series: [
        {
          id: 'month-end',
          data: [
            [at('2026-01-30T00:00:00.000Z'), 3],
            [at('2026-01-31T00:00:00.000Z'), 6],
            [at('2026-02-01T00:00:00.000Z'), 4],
            [at('2026-02-02T00:00:00.000Z'), 7],
          ],
        },
      ],
      xAxis: { ticks: 4 },
    },
  },
  {
    title: 'date year boundary',
    spec: {
      width: 62,
      height: 8,
      series: [
        {
          id: 'new-year',
          data: [
            [at('2025-12-30T00:00:00.000Z'), 2],
            [at('2025-12-31T00:00:00.000Z'), 5],
            [at('2026-01-01T00:00:00.000Z'), 8],
            [at('2026-01-02T00:00:00.000Z'), 4],
          ],
        },
      ],
      xAxis: { ticks: 4 },
    },
  },
  {
    title: 'date multi-decade range',
    spec: {
      width: 72,
      height: 8,
      series: [
        {
          id: 'decades',
          data: [
            [at('1980-01-01T00:00:00.000Z'), 1],
            [at('2000-01-01T00:00:00.000Z'), 5],
            [at('2020-01-01T00:00:00.000Z'), 3],
            [at('2040-01-01T00:00:00.000Z'), 8],
          ],
        },
      ],
      xAxis: { ticks: 7, formatter: (value) => String(value.getUTCFullYear()) },
    },
  },
  {
    title: 'date pre-epoch range',
    spec: {
      width: 58,
      height: 8,
      series: [
        {
          id: 'history',
          data: [
            [at('1900-01-01T00:00:00.000Z'), 2],
            [at('1925-01-01T00:00:00.000Z'), 6],
            [at('1950-01-01T00:00:00.000Z'), 4],
            [at('1969-12-31T00:00:00.000Z'), 7],
          ],
        },
      ],
      xAxis: { ticks: 5, formatter: (value) => String(value.getUTCFullYear()) },
    },
  },
  {
    title: 'date far-future range',
    spec: {
      width: 56,
      height: 8,
      series: [
        {
          id: 'future',
          data: [
            [at('2200-01-01T00:00:00.000Z'), 4],
            [at('2300-01-01T00:00:00.000Z'), 2],
            [at('2400-02-29T00:00:00.000Z'), 9],
          ],
        },
      ],
      xAxis: { ticks: 5, formatter: (value) => String(value.getUTCFullYear()) },
    },
  },
  {
    title: 'date irregular intervals',
    spec: {
      width: 68,
      height: 9,
      series: [
        {
          id: 'irregular',
          data: [
            [at('2026-06-01T00:00:00.000Z'), 1],
            [at('2026-06-01T00:00:01.000Z'), 7],
            [at('2026-06-01T06:30:00.000Z'), 3],
            [at('2026-06-10T00:00:00.000Z'), 8],
            [at('2026-09-01T00:00:00.000Z'), 4],
          ],
        },
      ],
      xAxis: { ticks: 5 },
    },
  },
  {
    title: 'date internal missing window',
    spec: {
      width: 48,
      height: 8,
      series: [
        {
          id: 'gapped',
          data: [
            [at('2026-07-01T00:00:00.000Z'), 2],
            [at('2026-07-02T00:00:00.000Z'), null],
            [at('2026-07-03T00:00:00.000Z'), null],
            [at('2026-07-04T00:00:00.000Z'), 7],
            [at('2026-07-05T00:00:00.000Z'), 4],
          ],
        },
      ],
      xAxis: { ticks: 5 },
    },
  },
  {
    title: 'date missing values across series',
    spec: {
      width: 60,
      height: 9,
      series: [
        {
          id: 'primary',
          data: [
            [at('2026-08-01T00:00:00.000Z'), 2],
            [at('2026-08-02T00:00:00.000Z'), null],
            [at('2026-08-03T00:00:00.000Z'), 6],
            [at('2026-08-04T00:00:00.000Z'), null],
          ],
          color: 'ansiBlue',
        },
        {
          id: 'secondary',
          data: [
            [at('2026-08-01T00:00:00.000Z'), null],
            [at('2026-08-02T00:00:00.000Z'), 5],
            [at('2026-08-03T00:00:00.000Z'), null],
            [at('2026-08-04T00:00:00.000Z'), 3],
          ],
          color: 'ansiRed',
        },
      ],
      legend: { position: 'bottom' },
    },
  },
  {
    title: 'date duplicate timestamps',
    spec: {
      width: 44,
      height: 8,
      series: [
        {
          id: 'duplicates',
          data: [
            [at('2026-09-01T00:00:00.000Z'), 1],
            [at('2026-09-02T00:00:00.000Z'), 3],
            [at('2026-09-02T00:00:00.000Z'), 7],
            [at('2026-09-03T00:00:00.000Z'), 4],
          ],
        },
      ],
    },
  },
  {
    title: 'date out-of-order timestamps',
    spec: {
      width: 52,
      height: 8,
      series: [
        {
          id: 'unordered',
          data: [
            [at('2026-10-01T00:00:00.000Z'), 1],
            [at('2026-10-04T00:00:00.000Z'), 8],
            [at('2026-10-02T00:00:00.000Z'), 3],
            [at('2026-10-05T00:00:00.000Z'), 5],
            [at('2026-10-03T00:00:00.000Z'), 6],
          ],
        },
      ],
    },
  },
  {
    title: 'date timezone-offset inputs',
    spec: {
      width: 66,
      height: 8,
      series: [
        {
          id: 'offsets',
          data: [
            [at('2026-03-29T00:30:00.000+01:00'), 2],
            [at('2026-03-29T01:30:00.000+01:00'), 5],
            [at('2026-03-29T03:30:00.000+02:00'), 8],
            [at('2026-03-29T04:30:00.000+02:00'), 4],
          ],
        },
      ],
      xAxis: { ticks: 4, formatter: (value) => value.toISOString().slice(11, 16) },
    },
  },
] satisfies readonly EdgeCaseScenario<Date>[];

/**
 * Examples covering date edge case behavior.
 */
export const dateEdgeCaseExamples: readonly SnapshotExample[] =
  createEdgeCaseExamples(dateEdgeCaseScenarios);
