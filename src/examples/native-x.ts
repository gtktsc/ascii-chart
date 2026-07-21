import { ChartSpec, ChartX, Renderer } from '@types';
import { renderChart } from '@services/chart/render';

import { forEachRenderer } from './renderers';
import { withExampleTerminal } from './terminal';
import { SnapshotExample } from './types';

const createNativeExamples = <X extends ChartX>(
  title: string,
  spec: ChartSpec<X>,
): SnapshotExample[] =>
  forEachRenderer((renderer: Renderer) => ({
    group: 'renderChart',
    title: `${title} [${renderer}]`,
    renderer,
    render: () => withExampleTerminal(() => renderChart({ ...spec, renderer })),
  }));

const at = (value: string) => new Date(value);

/**
 * Examples covering native x behavior.
 */
export const nativeXExamples: readonly SnapshotExample[] = [
  ...createNativeExamples('string annotations and overlays', {
    width: 44,
    height: 11,
    title: 'Categorical release flow',
    series: [
      {
        id: 'quality',
        name: 'Quality',
        data: [
          ['alpha', 2],
          ['beta', 5],
          ['release candidate', 4],
          ['general availability', 8],
        ],
        mode: 'line',
        color: 'ansiBrightCyan',
      },
    ],
    xAxis: {
      scale: 'band',
      domain: ['alpha', 'beta', 'release candidate', 'general availability'],
      ticks: ['alpha', 'beta', 'release candidate', 'general availability'],
      labelCollision: 'wrap',
    },
    yAxis: { domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] },
    points: [
      {
        id: 'candidate-point',
        name: 'Candidate',
        x: 'release candidate',
        y: 4,
        color: 'ansiYellow',
      },
    ],
    thresholds: [
      {
        id: 'beta-threshold',
        name: 'Beta gate',
        x: 'beta',
        y: 6,
        color: 'ansiRed',
      },
    ],
    annotations: [
      {
        id: 'phases',
        type: 'span',
        axis: 'x',
        from: 'beta',
        to: 'release candidate',
        symbol: '░',
        color: 'ansiBrightBlack',
      },
      {
        id: 'target-zone',
        type: 'span',
        axis: 'y',
        from: 7,
        to: 9,
        symbol: '·',
        color: 'ansiGreen',
      },
      {
        id: 'release-note',
        type: 'text',
        x: 'general availability',
        y: 9,
        text: 'ship',
        align: 'right',
        color: 'ansiBrightGreen',
      },
      {
        id: 'progress',
        type: 'arrow',
        from: ['alpha', 2],
        to: ['general availability', 8],
        lineSymbol: '·',
        color: 'ansiMagenta',
      },
      {
        id: 'confidence',
        type: 'errorBar',
        x: 'release candidate',
        y: 4,
        yError: [1, 2],
        color: 'ansiYellow',
      },
    ],
    legend: {
      position: 'bottom',
      series: ['quality'],
      points: ['candidate-point'],
      thresholds: ['beta-threshold'],
    },
  }),
  ...createNativeExamples('string first-seen order', {
    width: 30,
    height: 7,
    series: [
      {
        id: 'priority',
        data: [
          ['medium', 2],
          ['critical', 5],
          ['low', 1],
          ['high', 4],
        ],
      },
    ],
  }),
  ...createNativeExamples('string explicit reordered domain', {
    width: 34,
    height: 8,
    series: [
      {
        id: 'funnel',
        data: [
          ['visit', 100],
          ['signup', 60],
          ['activate', 35],
          ['retain', 20],
        ],
        mode: 'bar',
      },
    ],
    xAxis: {
      scale: 'band',
      domain: ['retain', 'activate', 'signup', 'visit'],
      ticks: ['retain', 'signup', 'visit'],
    },
    yAxis: { domain: [0, 100] },
    valueLabels: true,
  }),
  ...createNativeExamples('string grouped bars with null gaps', {
    width: 36,
    height: 9,
    series: [
      {
        id: 'current',
        name: 'Current',
        data: [
          ['A', 4],
          ['B', null],
          ['C', 6],
        ],
        mode: 'bar',
        color: 'ansiBlue',
      },
      {
        id: 'previous',
        name: 'Previous',
        data: [
          ['A', 3],
          ['B', 5],
          ['C', null],
        ],
        mode: 'bar',
        color: 'ansiMagenta',
      },
    ],
    xAxis: { scale: 'band' },
    yAxis: { domain: [0, 7] },
    barLayout: 'grouped',
    valueLabels: true,
    legend: { position: 'top' },
  }),
  ...createNativeExamples('string diverging stacked bars', {
    width: 36,
    height: 11,
    series: [
      {
        id: 'positive',
        data: [
          ['north', 5],
          ['south', -2],
          ['west', 3],
        ],
        mode: 'bar',
        color: 'ansiGreen',
      },
      {
        id: 'negative',
        data: [
          ['north', -3],
          ['south', 6],
          ['west', -4],
        ],
        mode: 'bar',
        color: 'ansiRed',
      },
    ],
    xAxis: { scale: 'band' },
    yAxis: { domain: [-5, 7] },
    barLayout: 'stacked',
    valueLabels: true,
  }),
  ...createNativeExamples('Unicode string categories', {
    width: 38,
    height: 8,
    series: [
      {
        id: 'cities',
        data: [
          ['東京', 8],
          ['Łódź', 4],
          ['München', 6],
          ['Zürich', 5],
        ],
        mode: 'point',
      },
    ],
    xAxis: { scale: 'band', labelCollision: 'hide' },
    yAxis: { domain: [0, 10] },
  }),
  ...createNativeExamples('string collision hide', {
    width: 24,
    height: 7,
    series: [
      {
        id: 'regions',
        data: [
          ['north-america', 5],
          ['south-america', 3],
          ['asia-pacific', 7],
        ],
      },
    ],
    xAxis: { scale: 'band', labelCollision: 'hide' },
  }),
  ...createNativeExamples('string collision truncate', {
    width: 24,
    height: 7,
    series: [
      {
        id: 'regions',
        data: [
          ['north-america', 5],
          ['south-america', 3],
          ['asia-pacific', 7],
        ],
      },
    ],
    xAxis: { scale: 'band', labelCollision: 'truncate' },
  }),
  ...createNativeExamples('Date annotations and secondary axis', {
    width: 48,
    height: 12,
    title: 'Deployment telemetry',
    series: [
      {
        id: 'requests',
        name: 'Requests',
        data: [
          [at('2026-04-01T00:00:00.000Z'), 20],
          [at('2026-04-02T00:00:00.000Z'), 35],
          [at('2026-04-03T00:00:00.000Z'), 55],
        ],
        yAxis: 'primary',
        color: 'ansiCyan',
      },
      {
        id: 'latency',
        name: 'Latency',
        data: [
          [at('2026-04-01T00:00:00.000Z'), 120],
          [at('2026-04-02T00:00:00.000Z'), 240],
          [at('2026-04-03T00:00:00.000Z'), 180],
        ],
        yAxis: 'secondary',
        mode: 'point',
        color: 'ansiYellow',
      },
    ],
    xAxis: {
      scale: 'time',
      ticks: [
        at('2026-04-01T00:00:00.000Z'),
        at('2026-04-02T00:00:00.000Z'),
        at('2026-04-03T00:00:00.000Z'),
      ],
      formatter: (value) => value.toISOString().slice(5, 10),
    },
    yAxis: { domain: [0, 60], label: 'req/s' },
    secondaryYAxis: { domain: [0, 300], label: 'ms' },
    annotations: [
      {
        id: 'deploy-window',
        type: 'span',
        axis: 'x',
        from: at('2026-04-01T12:00:00.000Z'),
        to: at('2026-04-02T12:00:00.000Z'),
        symbol: '░',
        color: 'ansiBrightBlack',
      },
      {
        id: 'deploy-note',
        type: 'text',
        x: at('2026-04-02T00:00:00.000Z'),
        y: 50,
        text: 'deploy',
        align: 'center',
        color: 'ansiGreen',
      },
      {
        id: 'growth',
        type: 'arrow',
        from: [at('2026-04-01T00:00:00.000Z'), 20],
        to: [at('2026-04-03T00:00:00.000Z'), 55],
        lineSymbol: '·',
        color: 'ansiMagenta',
      },
      {
        id: 'measurement',
        type: 'errorBar',
        x: at('2026-04-02T00:00:00.000Z'),
        y: 35,
        xError: 3_600_000,
        yError: [5, 10],
        color: 'ansiYellow',
      },
    ],
    legend: { position: 'right' },
  }),
  ...createNativeExamples('Date inferred time scale', {
    width: 38,
    height: 8,
    series: [
      {
        id: 'samples',
        data: [
          [at('2026-01-01T00:00:00.000Z'), 1],
          [at('2026-01-01T06:00:00.000Z'), 3],
          [at('2026-01-01T18:00:00.000Z'), 2],
        ],
      },
    ],
  }),
  ...createNativeExamples('Date explicit domain and ticks', {
    width: 44,
    height: 8,
    series: [
      {
        id: 'daily',
        data: [
          [at('2026-05-01T00:00:00.000Z'), 4],
          [at('2026-05-02T00:00:00.000Z'), 6],
          [at('2026-05-03T00:00:00.000Z'), 5],
        ],
      },
    ],
    xAxis: {
      scale: 'time',
      domain: [at('2026-04-30T00:00:00.000Z'), at('2026-05-04T00:00:00.000Z')],
      ticks: [at('2026-05-01T00:00:00.000Z'), at('2026-05-03T00:00:00.000Z')],
      formatter: (value) => value.toISOString().slice(0, 10),
    },
  }),
  ...createNativeExamples('Date multiple series with gaps', {
    width: 44,
    height: 9,
    series: [
      {
        id: 'alpha',
        data: [
          [at('2026-06-01T00:00:00.000Z'), 2],
          [at('2026-06-02T00:00:00.000Z'), null],
          [at('2026-06-03T00:00:00.000Z'), 6],
        ],
        color: 'ansiBlue',
      },
      {
        id: 'beta',
        data: [
          [at('2026-06-01T00:00:00.000Z'), null],
          [at('2026-06-02T00:00:00.000Z'), 5],
          [at('2026-06-03T00:00:00.000Z'), 3],
        ],
        color: 'ansiRed',
      },
    ],
    legend: { position: 'bottom' },
  }),
  ...createNativeExamples('Date point overlays and thresholds', {
    width: 40,
    height: 8,
    series: [
      {
        id: 'events',
        data: [
          [at('2026-07-01T00:00:00.000Z'), 2],
          [at('2026-07-02T00:00:00.000Z'), 7],
          [at('2026-07-03T00:00:00.000Z'), 4],
        ],
        mode: 'point',
      },
    ],
    points: [{ id: 'peak', name: 'Peak', x: at('2026-07-02T00:00:00.000Z'), y: 7 }],
    thresholds: [
      { id: 'day', name: 'Day', x: at('2026-07-03T00:00:00.000Z') },
      { id: 'limit', name: 'Limit', y: 5 },
    ],
    legend: { position: 'top', points: true, thresholds: true },
  }),
  ...createNativeExamples('Date grouped bars', {
    width: 44,
    height: 9,
    series: [
      {
        id: 'planned',
        data: [
          [at('2026-08-01T00:00:00.000Z'), 4],
          [at('2026-08-02T00:00:00.000Z'), 6],
        ],
        mode: 'bar',
        color: 'ansiBlue',
      },
      {
        id: 'actual',
        data: [
          [at('2026-08-01T00:00:00.000Z'), 5],
          [at('2026-08-02T00:00:00.000Z'), 3],
        ],
        mode: 'bar',
        color: 'ansiGreen',
      },
    ],
    xAxis: { scale: 'time', formatter: (value) => value.toISOString().slice(5, 10) },
    yAxis: { domain: [0, 7] },
    barLayout: 'grouped',
    valueLabels: true,
  }),
  ...createNativeExamples('Date clipped domain', {
    width: 40,
    height: 8,
    overflow: 'clip',
    series: [
      {
        id: 'window',
        data: [
          [at('2026-09-01T00:00:00.000Z'), 1],
          [at('2026-09-02T00:00:00.000Z'), 3],
          [at('2026-09-03T00:00:00.000Z'), 5],
          [at('2026-09-04T00:00:00.000Z'), 7],
        ],
      },
    ],
    xAxis: {
      scale: 'time',
      domain: [at('2026-09-02T00:00:00.000Z'), at('2026-09-03T00:00:00.000Z')],
    },
    yAxis: { domain: [0, 6] },
  }),
  ...createNativeExamples('Date multi-year range', {
    width: 48,
    height: 8,
    series: [
      {
        id: 'annual',
        data: [
          [at('2020-01-01T00:00:00.000Z'), 2],
          [at('2023-01-01T00:00:00.000Z'), 5],
          [at('2026-01-01T00:00:00.000Z'), 8],
        ],
      },
    ],
    xAxis: { scale: 'time', ticks: 4, formatter: (value) => String(value.getUTCFullYear()) },
  }),
];
