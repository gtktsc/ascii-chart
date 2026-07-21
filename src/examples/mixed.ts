import { ChartSeries, Renderer } from '@types';
import { renderChart } from '@services/chart/render';

import { forEachRenderer } from './renderers';
import { withExampleTerminal } from './terminal';

import type {
  MixedChartDefinition,
  MixedChartInput,
  MixedSeriesInput,
  SnapshotExample,
} from './types';

export type { MixedChartDefinition } from './types';

const toChartSeries = ({ values, xValues, ...series }: MixedSeriesInput): ChartSeries<number> => ({
  ...series,
  data: values.map((y, index) => [xValues?.[index] ?? index, y]),
});

const defineMixedChart = ({
  title,
  series,
  chart = {},
}: MixedChartInput): MixedChartDefinition => ({
  title,
  spec: {
    width: 36,
    height: 10,
    legend: { position: 'bottom', series: true },
    ...chart,
    title,
    series: series.map(toChartSeries),
  },
});

/**
 * Definitions used to build mixed chart.
 */
export const mixedChartDefinitions: readonly MixedChartDefinition[] = [
  defineMixedChart({
    title: 'mixed monthly revenue and target',
    series: [
      { id: 'revenue', name: 'Revenue', mode: 'bar', values: [42, 55, 49, 68], color: 'ansiBlue' },
      { id: 'target', name: 'Target', mode: 'line', values: [45, 50, 55, 60], color: 'ansiYellow' },
    ],
    chart: { valueLabels: true, yAxis: { domain: [0, 75] } },
  }),
  defineMixedChart({
    title: 'mixed orders and moving average',
    series: [
      {
        id: 'orders',
        name: 'Orders',
        mode: 'bar',
        values: [12, 18, 15, 24, 21],
        color: 'ansiCyan',
      },
      {
        id: 'average',
        name: 'Moving average',
        mode: 'line',
        values: [12, 15, 15, 19, 20],
        color: 'ansiMagenta',
        interpolation: 'linear',
      },
    ],
  }),
  defineMixedChart({
    title: 'mixed rainfall and temperature',
    series: [
      {
        id: 'rainfall',
        name: 'Rainfall mm',
        mode: 'bar',
        values: [8, 14, 4, 18, 10],
        color: 'ansiBlue',
      },
      {
        id: 'temperature',
        name: 'Temperature C',
        mode: 'line',
        values: [16, 18, 22, 20, 24],
        color: 'ansiRed',
        yAxis: 'secondary',
      },
    ],
    chart: {
      yAxis: { domain: [0, 20], label: 'mm' },
      secondaryYAxis: { domain: [10, 30], label: 'C' },
    },
  }),
  defineMixedChart({
    title: 'mixed requests and latency',
    series: [
      {
        id: 'requests',
        name: 'Requests',
        mode: 'bar',
        values: [120, 180, 150, 220],
        color: 'ansiGreen',
      },
      {
        id: 'latency',
        name: 'Latency ms',
        mode: 'line',
        values: [80, 95, 140, 90],
        color: 'ansiBrightRed',
        yAxis: 'secondary',
      },
    ],
    chart: {
      yAxis: { domain: [0, 250], label: 'req/s' },
      secondaryYAxis: { domain: [50, 150], label: 'ms' },
    },
  }),
  defineMixedChart({
    title: 'mixed signups and activation rate',
    series: [
      {
        id: 'signups',
        name: 'Signups',
        mode: 'bar',
        values: [70, 95, 110, 105],
        color: 'ansiBrightBlue',
      },
      {
        id: 'activation',
        name: 'Activation',
        mode: 'line',
        values: [62, 68, 73, 78],
        color: 'ansiBrightGreen',
        yAxis: 'secondary',
      },
    ],
    chart: {
      yAxis: { domain: [0, 120] },
      secondaryYAxis: { domain: [50, 85], formatter: (value) => `${value}%` },
    },
  }),
  defineMixedChart({
    title: 'mixed expenses and budget',
    series: [
      { id: 'expenses', name: 'Expenses', mode: 'bar', values: [26, 32, 29, 38], color: 'ansiRed' },
      { id: 'budget', name: 'Budget', mode: 'line', values: [30, 30, 35, 35], color: 'ansiYellow' },
    ],
    chart: {
      thresholds: [{ id: 'limit', name: 'Limit', y: 40, color: 'ansiBrightRed' }],
      yAxis: { domain: [0, 45] },
    },
  }),
  defineMixedChart({
    title: 'mixed profit and rolling trend',
    series: [
      {
        id: 'profit',
        name: 'Profit',
        mode: 'bar',
        values: [-8, 5, 12, -3, 16],
        color: 'ansiGreen',
      },
      { id: 'trend', name: 'Trend', mode: 'line', values: [-8, -2, 3, 5, 8], color: 'ansiCyan' },
    ],
    chart: { axisCenter: [undefined, 0], yAxis: { domain: [-10, 20] } },
  }),
  defineMixedChart({
    title: 'mixed inventory and reorder level',
    series: [
      {
        id: 'inventory',
        name: 'Inventory',
        mode: 'bar',
        values: [32, 24, 18, 28, 15],
        color: 'ansiMagenta',
      },
      {
        id: 'reorder',
        name: 'Reorder level',
        mode: 'line',
        values: [20, 20, null, 20, 20],
        color: 'ansiYellow',
      },
    ],
    chart: { yAxis: { domain: [0, 35] } },
  }),
  defineMixedChart({
    title: 'mixed energy use and efficiency',
    series: [
      {
        id: 'energy',
        name: 'Energy kWh',
        mode: 'bar',
        values: [88, 82, 76, 71],
        color: 'ansiYellow',
      },
      {
        id: 'efficiency',
        name: 'Efficiency',
        mode: 'line',
        values: [70, 76, 83, 89],
        color: 'ansiGreen',
        yAxis: 'secondary',
        fillArea: true,
      },
    ],
    chart: {
      yAxis: { domain: [0, 100], label: 'kWh' },
      secondaryYAxis: { domain: [60, 100], formatter: (value) => `${value}%` },
    },
  }),
  defineMixedChart({
    title: 'mixed defects and quality score',
    series: [
      { id: 'defects', name: 'Defects', mode: 'bar', values: [8, 6, 5, 3], color: 'ansiBrightRed' },
      {
        id: 'quality',
        name: 'Quality',
        mode: 'line',
        values: [91, 93, 95, 97],
        color: 'ansiBrightGreen',
        yAxis: 'secondary',
      },
    ],
    chart: {
      points: [{ id: 'audit', name: 'Audit', x: 2, y: 7, color: 'ansiCyan' }],
      yAxis: { domain: [0, 10] },
      secondaryYAxis: { domain: [88, 100] },
    },
  }),
  defineMixedChart({
    title: 'mixed support tickets and resolution trend',
    series: [
      {
        id: 'tickets',
        name: 'Tickets',
        mode: 'bar',
        values: [34, 28, 31, 22, 18],
        color: 'ansiCyan',
      },
      {
        id: 'resolved',
        name: 'Resolved trend',
        mode: 'line',
        values: [20, 23, 25, 27, 29],
        color: 'ansiGreen',
        fillArea: true,
      },
    ],
    chart: { yAxis: { domain: [0, 40] } },
  }),
  defineMixedChart({
    title: 'mixed downloads and growth trend',
    series: [
      {
        id: 'downloads',
        name: 'Downloads',
        mode: 'bar',
        values: [10, 16, 25, 39, 58],
        color: 'ansiBlue',
      },
      {
        id: 'growth',
        name: 'Growth trend',
        mode: 'line',
        values: [10, 14, 22, 34, 52],
        coloring: {
          type: 'gradient',
          by: 'y',
          colors: ['ansiCyan', 'ansiGreen', 'ansiBrightGreen'],
        },
        interpolation: 'linear',
      },
    ],
    chart: { width: 'auto', aspectRatio: 3, yAxis: { domain: [0, 65] } },
  }),
  defineMixedChart({
    title: 'mixed attendance and capacity',
    series: [
      {
        id: 'attendance',
        name: 'Attendance',
        mode: 'bar',
        values: [68, 82, 76, 94],
        color: 'ansiBrightCyan',
      },
      {
        id: 'capacity',
        name: 'Capacity',
        mode: 'line',
        values: [100, 100, 100, 100],
        color: 'ansiBrightBlack',
      },
    ],
    chart: {
      annotations: [
        { id: 'sellout', type: 'text', x: 3, y: 94, text: 'near capacity', align: 'right' },
      ],
      yAxis: { domain: [0, 110] },
    },
  }),
  defineMixedChart({
    title: 'mixed campaign leads and conversion',
    series: [
      {
        id: 'leads',
        name: 'Leads',
        mode: 'bar',
        values: [140, 180, 160, 210],
        color: 'ansiMagenta',
      },
      {
        id: 'conversion',
        name: 'Conversion',
        mode: 'line',
        values: [8, 11, 10, 14],
        color: 'ansiYellow',
        yAxis: 'secondary',
      },
    ],
    chart: {
      yAxis: { domain: [0, 240] },
      secondaryYAxis: { domain: [0, 16], formatter: (value) => `${value}%` },
    },
  }),
  defineMixedChart({
    title: 'mixed cash flow and runway',
    series: [
      {
        id: 'cash-flow',
        name: 'Cash flow',
        mode: 'bar',
        values: [-12, -6, 4, 11, 18],
        color: 'ansiBrightBlue',
      },
      {
        id: 'runway',
        name: 'Runway trend',
        mode: 'line',
        values: [-10, -7, -2, 6, 15],
        color: 'ansiBrightYellow',
      },
    ],
    chart: { axisCenter: [undefined, 0], yAxis: { domain: [-15, 20], ticks: [-15, 0, 20] } },
  }),
  defineMixedChart({
    title: 'mixed shipments and on-time rate',
    series: [
      {
        id: 'shipments',
        name: 'Shipments',
        mode: 'bar',
        values: [64, 80, 72, 92],
        color: 'ansiBlue',
      },
      {
        id: 'on-time',
        name: 'On-time',
        mode: 'line',
        values: [88, 91, 89, 95],
        color: 'ansiGreen',
        yAxis: 'secondary',
      },
    ],
    chart: {
      yAxis: { domain: [0, 100], label: 'shipments' },
      secondaryYAxis: { domain: [80, 100], label: 'on-time %' },
    },
  }),
  defineMixedChart({
    title: 'mixed incidents and reliability',
    series: [
      { id: 'incidents', name: 'Incidents', mode: 'bar', values: [5, 3, 4, 1], color: 'ansiRed' },
      {
        id: 'reliability',
        name: 'Reliability',
        mode: 'line',
        values: [98.6, 99.1, 98.9, 99.8],
        color: 'ansiBrightGreen',
        yAxis: 'secondary',
      },
    ],
    chart: {
      thresholds: [{ id: 'incident-limit', name: 'Incident limit', y: 4, color: 'ansiYellow' }],
      yAxis: { domain: [0, 6] },
      secondaryYAxis: { domain: [98, 100], formatter: (value) => `${value.toFixed(1)}%` },
    },
  }),
  defineMixedChart({
    title: 'mixed production and rolling plan',
    series: [
      {
        id: 'production',
        name: 'Production',
        mode: 'bar',
        values: [4, 9, 15, 17, 13, 20],
        xValues: [-1, 0, 1, 2, 3, 4],
        color: 'ansiCyan',
      },
      {
        id: 'plan',
        name: 'Rolling plan',
        mode: 'line',
        values: [6, 8, 11, 14, 17, 19],
        xValues: [-1, 0, 1, 2, 3, 4],
        color: 'ansiYellow',
      },
    ],
    chart: { overflow: 'clip', xAxis: { domain: [0, 4] }, yAxis: { domain: [0, 22] } },
  }),
  defineMixedChart({
    title: 'mixed grouped channels and total trend',
    series: [
      { id: 'web', name: 'Web', mode: 'bar', values: [6, 8, 7, 10], color: 'ansiBlue' },
      { id: 'store', name: 'Store', mode: 'bar', values: [4, 5, 6, 5], color: 'ansiMagenta' },
      {
        id: 'total',
        name: 'Total trend',
        mode: 'line',
        values: [10, 13, 13, 15],
        color: 'ansiYellow',
      },
    ],
    chart: { barLayout: 'grouped', valueLabels: true, yAxis: { domain: [0, 18] } },
  }),
  defineMixedChart({
    title: 'mixed stacked regions and overall trend',
    series: [
      { id: 'north', name: 'North', mode: 'bar', values: [5, 7, 6, 8], color: 'ansiBlue' },
      { id: 'south', name: 'South', mode: 'bar', values: [4, 3, 6, 7], color: 'ansiGreen' },
      {
        id: 'overall',
        name: 'Overall trend',
        mode: 'line',
        values: [9, 10, 12, 15],
        color: 'ansiBrightYellow',
      },
    ],
    chart: { barLayout: 'stacked', yAxis: { domain: [0, 18] } },
  }),
];

/**
 * Examples covering mixed chart behavior.
 */
export const mixedChartExamples: readonly SnapshotExample[] = mixedChartDefinitions.flatMap(
  ({ title, spec }) =>
    forEachRenderer((renderer: Renderer) => ({
      group: 'renderChart',
      title: `${title} [${renderer}]`,
      renderer,
      render: () => withExampleTerminal(() => renderChart({ ...spec, renderer })),
    })),
);
