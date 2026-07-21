import { heatmap } from '@services/renderers/heatmap';

import type { SnapshotExample, ThresholdHeatmapScenario } from './types';

/**
 * Scenario definitions for threshold heatmap examples.
 */
export const thresholdHeatmapScenarios = [
  {
    title: 'CPU saturation threshold heatmap',
    columns: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    rows: ['API', 'Workers', 'Database'],
    data: [
      [42, 55, 68, 83, 91, 74],
      [35, 61, 79, 88, 76, 52],
      [48, 64, null, 81, 86, 69],
    ],
    threshold: {
      value: 80,
      belowColor: 'ansiCyan',
      aboveColor: 'ansiBrightRed',
      belowSymbol: '·',
      aboveSymbol: '!',
      belowLabel: 'Healthy (<80%)',
      aboveLabel: 'Saturated (>=80%)',
    },
  },
  {
    title: 'Latency SLA threshold heatmap',
    columns: ['us-east', 'us-west', 'eu-west', 'eu-central', 'ap-south'],
    rows: ['Gateway', 'Search', 'Checkout'],
    data: [
      [122, 184, 241, 276, 318],
      [98, 205, 267, 232, 289],
      [145, 229, 248, 301, null],
    ],
    threshold: {
      value: 250,
      belowColor: 'ansiGreen',
      aboveColor: 'ansiBrightRed',
      belowLabel: 'Within SLA',
      aboveLabel: 'SLA breach',
    },
  },
  {
    title: 'Error-rate alert threshold heatmap',
    columns: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    rows: ['Web', 'Mobile', 'Partner'],
    data: [
      [1.2, 2.1, 4.8, 5, 7.4, 3.6, 1.9],
      [0.8, 1.7, 2.9, 6.2, 5.4, 4.1, 2.2],
      [2.4, 3.5, null, 4.9, 8.1, 6.7, 3.8],
    ],
    threshold: {
      value: 5,
      belowColor: 'ansiBrightGreen',
      aboveColor: 'ansiRed',
      belowSymbol: '✓',
      aboveSymbol: '×',
      belowLabel: 'Below 5%',
      aboveLabel: 'At least 5%',
    },
  },
  {
    title: 'Memory pressure threshold heatmap',
    columns: ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'],
    rows: ['Heap', 'RSS', 'Cache'],
    data: [
      [58, 67, 74, 79, 88],
      [63, 72, 75, 82, 91],
      [45, 56, null, 76, 84],
    ],
    threshold: {
      value: 75,
      belowColor: 'ansiBrightBlue',
      aboveColor: 'ansiMagenta',
      belowSymbol: '░',
      aboveSymbol: '▓',
      belowLabel: 'Normal memory',
      aboveLabel: 'Pressure',
    },
  },
  {
    title: 'Disk capacity threshold heatmap',
    columns: ['/var', '/tmp', '/data', '/logs', '/backup'],
    rows: ['prod-1', 'prod-2', 'prod-3'],
    data: [
      [62, 71, 86, 93, 78],
      [58, 84, 85, 89, 74],
      [67, null, 82, 91, 87],
    ],
    threshold: {
      value: 85,
      belowColor: 'ansiBlue',
      aboveColor: 'ansiBrightYellow',
      belowSymbol: '○',
      aboveSymbol: '●',
      belowLabel: 'Capacity available',
      aboveLabel: 'Capacity risk',
    },
  },
  {
    title: 'Cold-chain temperature threshold heatmap',
    columns: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    rows: ['Truck 7', 'Truck 12', 'Warehouse'],
    data: [
      [3.2, 4.1, 5.8, 8, 9.4, 6.7],
      [2.8, 3.9, 7.6, 8.3, 7.1, 5.2],
      [4.4, 5.3, null, 6.9, 8.7, 7.4],
    ],
    threshold: {
      value: 8,
      belowColor: 'ansiCyan',
      aboveColor: 'ansiBrightMagenta',
      belowSymbol: '*',
      aboveSymbol: '!',
      belowLabel: 'Safe temperature',
      aboveLabel: 'Temperature alert',
    },
  },
  {
    title: 'Battery readiness threshold heatmap',
    columns: ['Drone 1', 'Drone 2', 'Drone 3', 'Drone 4', 'Drone 5'],
    rows: ['Pack A', 'Pack B', 'Pack C'],
    data: [
      [72, 84, 90, 96, 100],
      [68, 79, 88, 93, 98],
      [75, null, 87, 91, 97],
    ],
    threshold: {
      value: 90,
      belowColor: 'ansiYellow',
      aboveColor: 'ansiBrightGreen',
      belowSymbol: '○',
      aboveSymbol: '●',
      belowLabel: 'Charging',
      aboveLabel: 'Ready (>=90%)',
    },
  },
  {
    title: 'Queue backlog threshold heatmap',
    columns: ['00', '04', '08', '12', '16', '20'],
    rows: ['Email', 'Billing', 'Exports'],
    data: [
      [4, 8, 17, 20, 29, 11],
      [2, 13, 22, 31, 18, 9],
      [6, 15, null, 24, 27, 14],
    ],
    threshold: {
      value: 20,
      belowColor: 'ansiGreen',
      aboveColor: 'ansiBrightMagenta',
      belowSymbol: '·',
      aboveSymbol: '#',
      belowLabel: 'Queue clear',
      aboveLabel: 'Backlog',
    },
  },
  {
    title: 'Cache hit-rate target heatmap',
    columns: ['edge-1', 'edge-2', 'edge-3', 'edge-4', 'edge-5'],
    rows: ['Images', 'API', 'Pages'],
    data: [
      [91, 94, 95, 97, 99],
      [86, 92, 96, 98, 93],
      [89, null, 94, 97, 96],
    ],
    threshold: {
      value: 95,
      belowColor: 'ansiBrightRed',
      aboveColor: 'ansiBrightGreen',
      belowSymbol: '↓',
      aboveSymbol: '↑',
      belowLabel: 'Below target',
      aboveLabel: 'Target met',
    },
  },
  {
    title: 'Test coverage target heatmap',
    columns: ['core', 'render', 'types', 'cli', 'examples'],
    rows: ['Statements', 'Branches', 'Functions', 'Lines'],
    data: [
      [99, 96, 100, 88, 94],
      [97, 93, 98, 84, 91],
      [100, 95, 100, 89, 96],
      [99, 96, null, 87, 93],
    ],
    threshold: {
      value: 92,
      belowColor: 'ansiBrightRed',
      aboveColor: 'ansiCyan',
      belowSymbol: '×',
      aboveSymbol: '✓',
      belowLabel: 'Below gate',
      aboveLabel: 'Gate passed',
    },
  },
] as const satisfies readonly ThresholdHeatmapScenario[];

/**
 * Examples covering threshold heatmap behavior.
 */
export const thresholdHeatmapExamples: readonly SnapshotExample[] = thresholdHeatmapScenarios.map(
  (scenario) => ({
    group: 'heatmap',
    title: scenario.title,
    render: () =>
      heatmap({
        title: scenario.title,
        columns: scenario.columns,
        rows: scenario.rows,
        data: scenario.data,
        threshold: scenario.threshold,
        legend: true,
      }),
  }),
);
