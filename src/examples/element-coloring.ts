import { ChartSpec, ChartX, PlotCoordinates, Renderer, Settings } from '@types';
import { renderChart } from '@services/chart/render';
import { plot } from '@services/plot/plot';

import { forEachRenderer } from './renderers';
import { withExampleTerminal } from './terminal';
import { SnapshotExample } from './types';

const lineData = [
  [0, 1],
  [1, 3],
  [2, 2],
] as const satisfies PlotCoordinates;

const twoSeriesData = [
  [
    [0, 1],
    [1, 3],
    [2, 2],
  ],
  [
    [0, 2],
    [1, 1],
    [2, 4],
  ],
] as const satisfies PlotCoordinates;

const createPlotColoringExamples = (
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

const createStructuredColoringExamples = <X extends ChartX>(
  title: string,
  spec: ChartSpec<X>,
): SnapshotExample[] =>
  forEachRenderer((renderer: Renderer) => ({
    group: 'renderChart',
    title: `${title} [${renderer}]`,
    renderer,
    render: () => withExampleTerminal(() => renderChart({ ...spec, renderer })),
  }));

const plotColoringExamples = [
  ...createPlotColoringExamples('plot color: blue title', lineData, {
    width: 24,
    height: 7,
    title: 'Blue title',
    titleColor: 'ansiBlue',
  }),
  ...createPlotColoringExamples('plot color: red x axis', lineData, {
    width: 24,
    height: 7,
    xAxis: { domain: [0, 2], ticks: [0, 1, 2], label: 'time', color: 'ansiRed' },
  }),
  ...createPlotColoringExamples('plot color: green y axis', lineData, {
    width: 24,
    height: 7,
    yAxis: { domain: [0, 4], ticks: [0, 2, 4], label: 'value', color: 'ansiGreen' },
  }),
  ...createPlotColoringExamples('plot color: paired axes', lineData, {
    width: 24,
    height: 7,
    xAxis: { domain: [0, 2], ticks: [0, 1, 2], label: 'seconds', color: 'ansiCyan' },
    yAxis: { domain: [0, 4], ticks: [0, 2, 4], label: 'load', color: 'ansiYellow' },
  }),
  ...createPlotColoringExamples('plot color: cyan legend labels', twoSeriesData, {
    width: 26,
    height: 7,
    color: ['ansiGreen', 'ansiMagenta'],
    legend: { position: 'bottom', series: ['Actual', 'Forecast'], color: 'ansiCyan' },
  }),
  ...createPlotColoringExamples('plot color: magenta border', lineData, {
    width: 24,
    height: 7,
    symbols: { border: '#' },
    borderColor: 'ansiMagenta',
  }),
  ...createPlotColoringExamples('plot color: dim background', lineData, {
    width: 24,
    height: 7,
    symbols: { background: '·' },
    backgroundColor: 'ansiBrightBlack',
  }),
  ...createPlotColoringExamples('plot color: yellow bar values', lineData, {
    width: 24,
    height: 7,
    mode: 'bar',
    color: 'ansiBlue',
    valueLabels: { color: 'ansiYellow' },
    yAxis: { domain: [0, 4] },
  }),
  ...createPlotColoringExamples(
    'plot color: cyan horizontal bar values',
    [
      [2, 0],
      [4, 1],
      [3, 2],
    ],
    {
      width: 28,
      height: 7,
      mode: 'horizontalBar',
      color: 'ansiMagenta',
      valueLabels: { color: 'ansiBrightCyan' },
      xAxis: { domain: [0, 5] },
    },
  ),
  ...createPlotColoringExamples('plot color: complete chrome palette', twoSeriesData, {
    width: 30,
    height: 8,
    mode: 'bar',
    barLayout: 'grouped',
    color: ['ansiBlue', 'ansiMagenta'],
    title: 'Quarterly palette',
    titleColor: 'ansiBrightWhite',
    xAxis: { domain: [0, 2], ticks: [0, 1, 2], label: 'quarter', color: 'ansiBrightBlue' },
    yAxis: { domain: [0, 5], ticks: [0, 2, 4], label: 'sales', color: 'ansiBrightGreen' },
    legend: { position: 'bottom', series: ['North', 'South'], color: 'ansiBrightCyan' },
    valueLabels: { color: 'ansiYellow' },
    symbols: { background: '·', border: '#' },
    borderColor: 'ansiBrightMagenta',
    backgroundColor: 'ansiBrightBlack',
  }),
];

const structuredColoringExamples = [
  ...createStructuredColoringExamples('structured color: yellow title', {
    width: 24,
    height: 7,
    title: 'Yellow title',
    titleColor: 'ansiBrightYellow',
    series: [{ id: 'signal', data: lineData }],
  }),
  ...createStructuredColoringExamples('structured color: blue x axis', {
    width: 24,
    height: 7,
    series: [{ id: 'signal', data: lineData }],
    xAxis: { domain: [0, 2], ticks: [0, 1, 2], label: 'time', color: 'ansiBrightBlue' },
  }),
  ...createStructuredColoringExamples('structured color: green y axis', {
    width: 24,
    height: 7,
    series: [{ id: 'signal', data: lineData }],
    yAxis: { domain: [0, 4], ticks: [0, 2, 4], label: 'value', color: 'ansiBrightGreen' },
  }),
  ...createStructuredColoringExamples('structured color: magenta secondary axis', {
    width: 28,
    height: 7,
    series: [
      { id: 'requests', data: lineData, color: 'ansiBlue' },
      {
        id: 'latency',
        data: [
          [0, 100],
          [1, 180],
          [2, 140],
        ],
        color: 'ansiCyan',
        yAxis: 'secondary',
      },
    ],
    xAxis: { domain: [0, 2] },
    yAxis: { domain: [0, 4] },
    secondaryYAxis: {
      domain: [0, 200],
      ticks: [0, 100, 200],
      label: 'ms',
      color: 'ansiBrightMagenta',
    },
  }),
  ...createStructuredColoringExamples('structured color: white legend labels', {
    width: 26,
    height: 7,
    series: [
      { id: 'actual', name: 'Actual', data: twoSeriesData[0], color: 'ansiGreen' },
      { id: 'forecast', name: 'Forecast', data: twoSeriesData[1], color: 'ansiMagenta' },
    ],
    legend: { position: 'bottom', series: true, color: 'ansiBrightWhite' },
  }),
  ...createStructuredColoringExamples('structured color: red border', {
    width: 24,
    height: 7,
    series: [{ id: 'signal', data: lineData }],
    symbols: { border: '#' },
    borderColor: 'ansiBrightRed',
  }),
  ...createStructuredColoringExamples('structured color: blue background', {
    width: 24,
    height: 7,
    series: [{ id: 'signal', data: lineData }],
    symbols: { background: '·' },
    backgroundColor: 'ansiBlue',
  }),
  ...createStructuredColoringExamples('structured color: cyan grouped bar values', {
    width: 28,
    height: 8,
    series: [
      {
        id: 'desktop',
        data: [
          ['Q1', 3],
          ['Q2', 4],
        ],
        mode: 'bar',
        color: 'ansiBlue',
      },
      {
        id: 'mobile',
        data: [
          ['Q1', 2],
          ['Q2', 3],
        ],
        mode: 'bar',
        color: 'ansiMagenta',
      },
    ],
    xAxis: { scale: 'band' },
    yAxis: { domain: [0, 5] },
    barLayout: 'grouped',
    valueLabels: { color: 'ansiBrightCyan' },
  }),
  ...createStructuredColoringExamples('structured color: magenta normalized bar values', {
    width: 28,
    height: 8,
    series: [
      {
        id: 'desktop',
        data: [
          ['Q1', 30],
          ['Q2', 45],
        ],
        mode: 'bar',
        color: 'ansiBlue',
      },
      {
        id: 'mobile',
        data: [
          ['Q1', 70],
          ['Q2', 55],
        ],
        mode: 'bar',
        color: 'ansiCyan',
      },
    ],
    xAxis: { scale: 'band' },
    yAxis: { domain: [0, 100] },
    barLayout: 'normalized',
    valueLabels: { color: 'ansiBrightMagenta' },
  }),
  ...createStructuredColoringExamples('structured color: complete dashboard palette', {
    width: 34,
    height: 9,
    title: 'Service dashboard',
    titleColor: 'ansiBrightWhite',
    series: [
      { id: 'traffic', name: 'Traffic', data: lineData, mode: 'bar', color: 'ansiBlue' },
      {
        id: 'latency',
        name: 'Latency',
        data: [
          [0, 80],
          [1, 160],
          [2, 120],
        ],
        color: 'ansiYellow',
        yAxis: 'secondary',
      },
    ],
    xAxis: { domain: [0, 2], ticks: [0, 1, 2], label: 'minute', color: 'ansiBrightBlue' },
    yAxis: { domain: [0, 4], ticks: [0, 2, 4], label: 'req/s', color: 'ansiBrightGreen' },
    secondaryYAxis: {
      domain: [0, 200],
      ticks: [0, 100, 200],
      label: 'ms',
      color: 'ansiBrightMagenta',
    },
    legend: { position: 'bottom', series: true, color: 'ansiBrightCyan' },
    valueLabels: { color: 'ansiYellow' },
    symbols: { background: '·', border: '#' },
    borderColor: 'ansiBrightRed',
    backgroundColor: 'ansiBrightBlack',
  }),
];

/**
 * Examples covering element coloring behavior.
 */
export const elementColoringExamples: readonly SnapshotExample[] = [
  ...plotColoringExamples,
  ...structuredColoringExamples,
];
