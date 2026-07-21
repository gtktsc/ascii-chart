import { ChartSpec, ChartX, Renderer } from '@types';
import { renderChart } from '@services/chart/render';

import { forEachRenderer } from './renderers';
import { withExampleTerminal } from './terminal';
import { SnapshotExample } from './types';

const createStructuredExamples = <X extends ChartX>(
  title: string,
  spec: ChartSpec<X>,
): SnapshotExample[] =>
  forEachRenderer((renderer: Renderer) => ({
    group: 'renderChart',
    title: `${title} [${renderer}]`,
    renderer,
    render: () => withExampleTerminal(() => renderChart({ ...spec, renderer })),
  }));

const numericSpec = {
  width: 42,
  height: 12,
  title: 'Operations dashboard',
  titleColor: 'ansiBrightWhite',
  overflow: 'clip',
  series: [
    {
      id: 'requests',
      name: 'Requests',
      data: [
        [0, 20],
        [1, 35],
        [2, null],
        [3, 60],
      ],
      mode: 'line',
      interpolation: 'linear',
      coloring: {
        type: 'gradient',
        by: 'y',
        colors: ['ansiGreen', 'ansiYellow', 'ansiRed'],
        domain: [0, 100],
      },
      fillArea: true,
    },
    {
      id: 'latency',
      name: 'Latency',
      data: [
        [0, 120],
        [1, 180],
        [2, 160],
        [3, 240],
      ],
      mode: 'point',
      color: 'ansiCyan',
      yAxis: 'secondary',
    },
  ],
  xAxis: {
    scale: 'linear',
    domain: [0, 3],
    ticks: [0, 1, 2, 3],
    label: 'minute',
    formatter: (value: number) => `T+${value}`,
    hidden: false,
    hideTicks: false,
    labelCollision: 'hide',
    color: 'ansiBrightBlue',
  },
  yAxis: {
    domain: [0, 100],
    ticks: 5,
    label: 'req/s',
    formatter: (value: number) => `${value}`,
    hidden: false,
    hideTicks: false,
    showTickLabel: true,
    color: 'ansiBrightGreen',
  },
  secondaryYAxis: {
    domain: [0, 300],
    ticks: [0, 150, 300],
    label: 'ms',
    color: 'ansiBrightMagenta',
  },
  legend: {
    position: 'right',
    series: ['requests', 'latency'],
    points: ['incident'],
    thresholds: ['target'],
    color: 'ansiWhite',
  },
  points: [{ id: 'incident', name: 'Incident', x: 2, y: 70, color: 'ansiRed' }],
  thresholds: [{ id: 'target', name: 'Target', y: 50, color: 'ansiGreen' }],
  annotations: [
    { id: 'window', type: 'span', axis: 'x', from: 1, to: 2, symbol: '░' },
    { id: 'healthy', type: 'span', axis: 'y', from: 0, to: 30, symbol: '·' },
    { id: 'note', type: 'text', x: 1, y: 80, text: 'deploy', align: 'center' },
    { id: 'trend', type: 'arrow', from: [0, 20], to: [3, 60], lineSymbol: '·' },
    { id: 'uncertainty', type: 'errorBar', x: 3, y: 60, xError: 0.2, yError: [5, 10] },
  ],
  symbols: {
    axis: { we: '─', ns: '│' },
    chart: { we: '━', ns: '┃' },
    empty: ' ',
    background: ' ',
    border: '│',
    thresholds: { x: '━', y: '┃' },
    point: '●',
  },
  borderColor: 'ansiBrightBlack',
  backgroundColor: 'ansiBlack',
  debugMode: false,
} as const satisfies ChartSpec<number>;

const categoricalSpec = {
  width: 36,
  aspectRatio: 3,
  series: [
    {
      id: 'sales',
      name: 'Sales',
      data: [
        ['enterprise', 8],
        ['small business', 5],
        ['consumer', 3],
      ],
      mode: 'bar',
      color: 'ansiBrightBlue',
    },
  ],
  xAxis: {
    scale: 'band',
    domain: ['consumer', 'small business', 'enterprise'],
    ticks: ['consumer', 'enterprise'],
    formatter: (value: string) => value.toUpperCase(),
    labelCollision: 'wrap',
  },
  yAxis: { domain: [0, 10], ticks: 5 },
  barLayout: 'grouped',
  valueLabels: { formatter: (value: number, { x }: { x: string }) => `${x}:${value}` },
  legend: { position: 'bottom' },
} as const satisfies ChartSpec<string>;

const timeSpec = {
  width: 44,
  height: 8,
  series: [
    {
      id: 'temperature',
      data: [
        [new Date('2026-01-01T00:00:00.000Z'), -2],
        [new Date('2026-01-01T06:00:00.000Z'), 1],
        [new Date('2026-01-01T12:00:00.000Z'), 4],
      ],
      color: 'ansiBrightCyan',
    },
  ],
  xAxis: {
    scale: 'time',
    domain: [new Date('2026-01-01T00:00:00.000Z'), new Date('2026-01-01T12:00:00.000Z')],
    ticks: 3,
    formatter: (value: Date) => value.toISOString().slice(11, 16),
    labelCollision: 'truncate',
  },
  yAxis: { domain: [-5, 5], ticks: [-5, 0, 5] },
} as const satisfies ChartSpec<Date>;

const normalizedBars = {
  width: 30,
  height: 9,
  series: [
    {
      id: 'desktop',
      name: 'Desktop',
      data: [
        ['Q1', 30],
        ['Q2', 45],
      ],
      mode: 'bar',
      color: 'ansiBlue',
    },
    {
      id: 'mobile',
      name: 'Mobile',
      data: [
        ['Q1', 70],
        ['Q2', 55],
      ],
      mode: 'bar',
      color: 'ansiMagenta',
    },
  ],
  xAxis: { scale: 'band' },
  yAxis: { domain: [0, 100] },
  barLayout: 'normalized',
  valueLabels: true,
  legend: { position: 'top', series: true },
} as const satisfies ChartSpec<string>;

/**
 * Examples covering structured behavior.
 */
export const structuredExamples: readonly SnapshotExample[] = [
  ...createStructuredExamples('complete numeric specification', numericSpec),
  ...createStructuredExamples('band categories and wrapped labels', categoricalSpec),
  ...createStructuredExamples('date time scale', timeSpec),
  ...createStructuredExamples('normalized categorical bars', normalizedBars),
  ...createStructuredExamples('custom axis center', {
    width: 24,
    height: 8,
    series: [
      {
        id: 'quadrants',
        data: [
          [-4, -3],
          [0, 0],
          [4, 3],
        ],
      },
    ],
    xAxis: { domain: [-5, 5] },
    yAxis: { domain: [-5, 5] },
    axisCenter: [0, 0],
  }),
  ...createStructuredExamples('empty explicit frame', {
    width: 20,
    height: 6,
    series: [{ id: 'missing', data: [[0, null]] }],
    xAxis: { domain: [0, 10], ticks: 2 },
    yAxis: { domain: [0, 100], ticks: 2 },
    legend: { position: 'auto', series: false, points: false, thresholds: false },
  }),
  ...createStructuredExamples('mixed line point and bar series', {
    width: 30,
    height: 9,
    series: [
      {
        id: 'trend',
        name: 'Trend',
        data: [
          [0, 1],
          [1, 3],
          [2, 2],
        ],
        mode: 'line',
        color: 'ansiCyan',
      },
      {
        id: 'samples',
        name: 'Samples',
        data: [
          [0, 2],
          [1, 4],
          [2, 3],
        ],
        mode: 'point',
        color: 'ansiYellow',
      },
      {
        id: 'volume',
        name: 'Volume',
        data: [
          [0, 1],
          [1, 2],
          [2, 1],
        ],
        mode: 'bar',
        color: 'ansiMagenta',
      },
    ],
    xAxis: { domain: [0, 2], ticks: [0, 1, 2] },
    yAxis: { domain: [0, 5], ticks: [0, 1, 2, 3, 4, 5] },
    legend: { position: 'bottom' },
  }),
  ...createStructuredExamples('irregular time intervals', {
    width: 44,
    height: 8,
    series: [
      {
        id: 'events',
        data: [
          [new Date('2026-03-01T00:00:00.000Z'), 1],
          [new Date('2026-03-01T00:05:00.000Z'), 4],
          [new Date('2026-03-01T04:30:00.000Z'), 2],
          [new Date('2026-03-02T12:00:00.000Z'), 5],
        ],
      },
    ],
    xAxis: {
      scale: 'time',
      ticks: [
        new Date('2026-03-01T00:00:00.000Z'),
        new Date('2026-03-01T12:00:00.000Z'),
        new Date('2026-03-02T12:00:00.000Z'),
      ],
      formatter: (value) => value.toISOString().slice(5, 16).replace('T', ' '),
      labelCollision: 'hide',
    },
    yAxis: { domain: [0, 6] },
  }),
  ...createStructuredExamples('sparse categorical domain', {
    width: 38,
    height: 8,
    series: [
      {
        id: 'inventory',
        data: [
          ['small', 8],
          ['large', 3],
        ],
        mode: 'bar',
      },
    ],
    xAxis: {
      scale: 'band',
      domain: ['small', 'medium', 'large', 'extra large'],
      ticks: ['small', 'medium', 'large', 'extra large'],
      labelCollision: 'truncate',
    },
    yAxis: { domain: [0, 10] },
    valueLabels: true,
  }),
  ...createStructuredExamples('grouped horizontal series', {
    width: 30,
    height: 9,
    series: [
      {
        id: 'planned',
        name: 'Planned',
        data: [
          [6, 0],
          [3, 1],
          [8, 2],
        ],
        mode: 'horizontalBar',
        color: 'ansiBlue',
      },
      {
        id: 'actual',
        name: 'Actual',
        data: [
          [4, 0],
          [7, 1],
          [5, 2],
        ],
        mode: 'horizontalBar',
        color: 'ansiGreen',
      },
    ],
    xAxis: { domain: [0, 10] },
    yAxis: { domain: [0, 2], ticks: [0, 1, 2] },
    barLayout: 'grouped',
    valueLabels: { formatter: (value, { seriesName }) => `${seriesName}:${value}` },
    legend: { position: 'top' },
  }),
  ...createStructuredExamples('diverging stacked series', {
    width: 28,
    height: 11,
    series: [
      {
        id: 'gains',
        data: [
          [0, 4],
          [1, -2],
          [2, 3],
        ],
        mode: 'bar',
        color: 'ansiGreen',
      },
      {
        id: 'losses',
        data: [
          [0, -3],
          [1, 5],
          [2, -4],
        ],
        mode: 'bar',
        color: 'ansiRed',
      },
    ],
    xAxis: { domain: [0, 2] },
    yAxis: { domain: [-5, 6] },
    barLayout: 'stacked',
    valueLabels: true,
  }),
  ...createStructuredExamples('annotation alignment variants', {
    width: 40,
    height: 10,
    series: [
      {
        id: 'baseline',
        data: [
          [0, 0],
          [10, 10],
        ],
      },
    ],
    xAxis: { domain: [0, 10] },
    yAxis: { domain: [0, 10] },
    annotations: [
      { id: 'left', type: 'text', x: 5, y: 8, text: 'left', align: 'left' },
      { id: 'center', type: 'text', x: 5, y: 6, text: 'center', align: 'center' },
      { id: 'right', type: 'text', x: 5, y: 4, text: 'right', align: 'right' },
      { id: 'symmetric', type: 'errorBar', x: 3, y: 3, xError: 1, yError: 1 },
      { id: 'asymmetric', type: 'errorBar', x: 7, y: 7, xError: [1, 2], yError: [2, 1] },
    ],
  }),
  ...createStructuredExamples('auto width dense categories', {
    width: 'auto',
    aspectRatio: 4,
    series: [
      {
        id: 'dense',
        data: [
          ['north-america', 5],
          ['south-america', 3],
          ['europe-middle-east-africa', 7],
          ['asia-pacific', 6],
        ],
        mode: 'bar',
      },
    ],
    xAxis: { scale: 'band', labelCollision: 'hide' },
    yAxis: { domain: [0, 8] },
  }),
  ...createStructuredExamples('discarded out-of-domain segments', {
    width: 28,
    height: 8,
    overflow: 'discard',
    series: [
      {
        id: 'bounded',
        data: [
          [-2, 2],
          [0, 1],
          [1, 3],
          [2, 99],
          [3, 4],
          [5, 2],
        ],
      },
    ],
    xAxis: { domain: [0, 3] },
    yAxis: { domain: [0, 5] },
  }),
  ...createStructuredExamples('label collision error policy', {
    width: 30,
    height: 6,
    series: [
      {
        id: 'trend',
        data: [
          [0, 0],
          [10, 10],
        ],
      },
    ],
    xAxis: {
      domain: [0, 10],
      ticks: [0, 10],
      formatter: (value) => `point-${value}`,
      labelCollision: 'error',
    },
    yAxis: { domain: [0, 10] },
  }),
];
