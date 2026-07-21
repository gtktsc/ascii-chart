import { GraphMode, LegendPosition, PlotCoordinates, Renderer, Settings } from '@types';
import { plot } from '@services/plot/plot';

import { forEachRenderer } from './renderers';
import { withExampleTerminal } from './terminal';
import { SnapshotExample } from './types';

const lineData = [
  [0, -2],
  [1, 1],
  [2, null],
  [3, 4],
  [4, 2],
] as const satisfies PlotCoordinates;

const createPlotExamples = (
  title: string,
  data: PlotCoordinates,
  settings: Settings,
): SnapshotExample[] =>
  forEachRenderer((renderer: Renderer) => ({
    group: 'plot',
    title: `${title} [${renderer}]`,
    renderer,
    render: () => withExampleTerminal(() => plot(data, { ...settings, renderer })),
  }));

const modeExamples = (
  ['line', 'point', 'bar', 'horizontalBar'] as const satisfies readonly GraphMode[]
).flatMap((mode) =>
  createPlotExamples(
    `mode ${mode}`,
    mode === 'horizontalBar'
      ? [
          [-3, 0],
          [5, 1],
          [2, 2],
        ]
      : [
          [0, 1],
          [1, 3],
          [2, 2],
        ],
    { mode, width: 18, height: 7 },
  ),
);

const legendExamples = (
  ['left', 'right', 'top', 'bottom', 'auto'] as const satisfies readonly LegendPosition[]
).flatMap((position) =>
  createPlotExamples(
    `legend position ${position}`,
    [
      [
        [0, 1],
        [1, 3],
      ],
      [
        [0, 2],
        [1, 1],
      ],
    ],
    {
      width: 24,
      height: 6,
      legend: { position, series: ['Alpha', 'Beta'] },
      color: ['ansiCyan', 'ansiMagenta'],
    },
  ),
);

/**
 * Examples covering plot option behavior.
 */
export const plotOptionExamples: readonly SnapshotExample[] = [
  ...createPlotExamples('auto width with aspect ratio', lineData, {
    width: 'auto',
    aspectRatio: 2.5,
    title: 'Responsive chart',
  }),
  ...createPlotExamples('structured axis objects override flat aliases', lineData, {
    width: 30,
    height: 8,
    xLabel: 'flat x',
    yLabel: 'flat y',
    formatter: (value) => `flat:${value}`,
    xAxis: {
      scale: 'linear',
      domain: [0, 4],
      ticks: [0, 2, 4],
      label: 'axis x',
      formatter: (value) => `x${value}`,
      hidden: false,
      hideTicks: false,
      labelCollision: 'hide',
    },
    yAxis: {
      domain: [-2, 4],
      ticks: [-2, 0, 2, 4],
      label: 'axis y',
      formatter: (value) => `y${value}`,
      hidden: false,
      hideTicks: false,
      showTickLabel: true,
    },
  }),
  ...createPlotExamples('clip overflow with linear interpolation', lineData, {
    width: 24,
    height: 8,
    overflow: 'clip',
    interpolation: 'linear',
    xAxis: { domain: [0.5, 3.5] },
    yAxis: { domain: [-1, 3] },
  }),
  ...createPlotExamples('discard overflow with step interpolation', lineData, {
    width: 24,
    height: 8,
    overflow: 'discard',
    interpolation: 'step',
    xAxis: { domain: [0.5, 3.5] },
    yAxis: { domain: [-1, 3] },
  }),
  ...createPlotExamples(
    'dynamic colors overlays symbols and labels',
    [
      [0, 0],
      [1, 2],
      [2, 4],
    ],
    {
      width: 28,
      height: 8,
      color: (series) => (series === 0 ? 'ansiBrightCyan' : 'ansiBrightMagenta'),
      coloring: {
        type: 'conditional',
        getColor: ({ y }) => (y >= 2 ? 'ansiGreen' : 'ansiYellow'),
      },
      yRange: [0, 4],
      customXAxisTicks: [0, 1, 2],
      customYAxisTicks: [0, 2, 4],
      showTickLabel: true,
      hideXAxis: false,
      hideXAxisTicks: false,
      hideYAxis: false,
      hideYAxisTicks: false,
      title: 'Complete plot settings',
      titleColor: 'ansiBrightWhite',
      xLabel: 'time',
      yLabel: 'value',
      thresholds: [{ y: 2, color: 'ansiRed' }, { x: 1 }],
      points: [{ x: 1, y: 2, color: 'ansiBlue' }],
      fillArea: true,
      legend: {
        series: 'Signal',
        points: 'Peak',
        thresholds: ['Limit', 'Event'],
        color: 'ansiWhite',
      },
      xAxis: { color: 'ansiBrightBlue' },
      yAxis: { color: 'ansiBrightGreen' },
      axisCenter: [0, 0],
      formatter: (value, { axis }) => `${axis}:${value}`,
      lineFormatter: ({ plotX, plotY }) => ({ x: plotX, y: plotY, symbol: '◆' }),
      symbols: {
        axis: { we: '═', ns: '║' },
        chart: { we: '─', ns: '│' },
        empty: ' ',
        background: '·',
        border: '#',
        thresholds: { x: '=', y: '!' },
        point: '◉',
      },
      borderColor: 'ansiBrightMagenta',
      backgroundColor: 'ansiBrightBlack',
    },
  ),
  ...createPlotExamples(
    'per-series gradient coloring',
    [
      [
        [0, 0],
        [1, 2],
        [2, 4],
      ],
      [
        [0, 4],
        [1, 2],
        [2, 0],
      ],
    ],
    {
      width: 24,
      height: 8,
      coloring: [
        { type: 'gradient', by: 'x', colors: ['ansiRed', 'ansiYellow'], domain: [0, 2] },
        { type: 'gradient', by: 'y', colors: ['ansiBlue', 'ansiCyan'] },
      ],
    },
  ),
  ...createPlotExamples(
    'normalized bars with value formatter',
    [
      [
        [0, 1],
        [1, 3],
      ],
      [
        [0, 3],
        [1, 1],
      ],
    ],
    {
      mode: 'bar',
      barLayout: 'normalized',
      valueLabels: { formatter: (value, { seriesIndex }) => `${seriesIndex}:${value}%` },
      width: 24,
      height: 8,
      color: ['ansiGreen', 'ansiBlue'],
    },
  ),
  ...createPlotExamples('debug grid', lineData, {
    width: 18,
    height: 6,
    debugMode: true,
  }),
  ...createPlotExamples('single point with inferred domains', [[7, 42]], {
    width: 18,
    height: 6,
    points: [{ x: 7, y: 42, color: 'ansiBrightGreen' }],
  }),
  ...createPlotExamples('empty input with explicit domains', [], {
    width: 20,
    height: 6,
    xAxis: { domain: [-1, 1], ticks: [-1, 0, 1] },
    yAxis: { domain: [-1, 1], ticks: [-1, 0, 1] },
    title: 'Empty frame',
  }),
  ...createPlotExamples(
    'unsorted coordinates',
    [
      [4, 1],
      [0, 3],
      [3, -1],
      [1, 2],
      [2, 0],
    ],
    { width: 24, height: 8, interpolation: 'linear' },
  ),
  ...createPlotExamples(
    'duplicate x coordinates',
    [
      [0, 1],
      [1, 2],
      [1, 4],
      [2, 3],
    ],
    { width: 20, height: 8, mode: 'point' },
  ),
  ...createPlotExamples(
    'constant y values',
    [
      [-2, 5],
      [0, 5],
      [2, 5],
    ],
    { width: 20, height: 6, showTickLabel: true },
  ),
  ...createPlotExamples(
    'constant x values',
    [
      [3, -2],
      [3, 0],
      [3, 2],
    ],
    { width: 18, height: 8, mode: 'point' },
  ),
  ...createPlotExamples(
    'sparse multi-series gaps',
    [
      [
        [0, 1],
        [1, null],
        [4, 5],
      ],
      [
        [0, null],
        [2, -2],
        [4, 3],
      ],
    ],
    {
      width: 26,
      height: 9,
      color: ['ansiCyan', 'ansiMagenta'],
      legend: { series: ['Sparse A', 'Sparse B'] },
    },
  ),
  ...createPlotExamples(
    'very small decimal magnitudes',
    [
      [0.0001, -0.000002],
      [0.0002, 0],
      [0.0003, 0.000003],
    ],
    {
      width: 30,
      height: 8,
      formatter: (value) => value.toExponential(1),
    },
  ),
  ...createPlotExamples(
    'normalized horizontal bars',
    [
      [
        [25, 0],
        [60, 1],
      ],
      [
        [75, 0],
        [40, 1],
      ],
    ],
    {
      mode: 'horizontalBar',
      barLayout: 'normalized',
      valueLabels: true,
      width: 30,
      height: 8,
      color: ['ansiBrightBlue', 'ansiBrightMagenta'],
    },
  ),
  ...createPlotExamples(
    'all-negative grouped horizontal bars',
    [
      [
        [-2, 0],
        [-5, 1],
      ],
      [
        [-4, 0],
        [-1, 1],
      ],
    ],
    {
      mode: 'horizontalBar',
      barLayout: 'grouped',
      valueLabels: { formatter: (value) => `(${Math.abs(value)})` },
      width: 28,
      height: 8,
      color: ['ansiYellow', 'ansiRed'],
    },
  ),
  ...modeExamples,
  ...legendExamples,
];

/**
 * Examples covering fill area behavior.
 */
export const fillAreaExamples: readonly SnapshotExample[] = [
  ...createPlotExamples(
    'fill area above x axis',
    [
      [-4, 1],
      [-2, 3],
      [0, 2],
      [2, 4],
      [4, 1],
    ],
    {
      width: 24,
      height: 8,
      fillArea: true,
      hideXAxisTicks: true,
      axisCenter: [0, 0],
      xAxis: { domain: [-5, 5] },
      yAxis: { domain: [0, 5] },
    },
  ),
  ...createPlotExamples(
    'fill area below x axis',
    [
      [-4, -1],
      [-2, -3],
      [0, -2],
      [2, -4],
      [4, -1],
    ],
    {
      width: 24,
      height: 8,
      fillArea: true,
      hideXAxisTicks: true,
      axisCenter: [0, 0],
      xAxis: { domain: [-5, 5] },
      yAxis: { domain: [-5, 0] },
    },
  ),
  ...createPlotExamples(
    'fill area left of y axis',
    [
      [-4, -3],
      [-3, 2],
      [-2, -1],
      [-1, 3],
    ],
    {
      width: 24,
      height: 8,
      fillArea: true,
      hideXAxisTicks: true,
      axisCenter: [0, 0],
      xAxis: { domain: [-5, 0] },
      yAxis: { domain: [-5, 5] },
    },
  ),
  ...createPlotExamples(
    'fill area right of y axis',
    [
      [1, -3],
      [2, 2],
      [3, -1],
      [4, 3],
    ],
    {
      width: 24,
      height: 8,
      fillArea: true,
      hideXAxisTicks: true,
      axisCenter: [0, 0],
      xAxis: { domain: [0, 5] },
      yAxis: { domain: [-5, 5] },
    },
  ),
];
