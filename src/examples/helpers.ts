import { Color, HeatmapSpec } from '@types';
import { ANSI_COLORS } from '@constants/ansi';
import { heatmap } from '@services/renderers/heatmap';
import { histogram } from '@services/renderers/histogram';
import { sparkline } from '@services/renderers/sparkline';

import { additionalLargeHeatmapExamples } from './additional-large-heatmap-examples';
import { additionalLargeSparklineExamples } from './additional-large-sparkline-examples';
import { largeHeatmapExamples } from './large-heatmap-examples';
import { largeSparklineExamples } from './large-sparkline-examples';

import type { HelperExample } from './types';

export type { HelperExample } from './types';

const ciHeatmap = {
  columns: ['Linux', 'macOS', 'Windows'],
  rows: ['Node 22', 'Node 24'],
  data: [
    ['pass', 'pass', 'fail'],
    ['pass', 'pending', 'pass'],
  ],
  levels: [
    { value: 'pass', symbol: '●', color: 'ansiGreen', label: 'Passed' },
    { value: 'pending', symbol: '○', color: 'ansiYellow', label: 'Pending' },
    { value: 'fail', symbol: '×', color: 'ansiRed', label: 'Failed' },
  ],
  legend: true,
} as const satisfies HeatmapSpec;

const calendarHeatmap = {
  columns: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  rows: ['Week 1', 'Week 2'],
  data: [
    [0, 1, 3, 2, 1, 0, null],
    [1, 2, 2, 3, 3, 1, 0],
  ],
  levels: [
    { value: 0, symbol: '·', label: 'None' },
    { value: 1, symbol: '░', label: 'Low' },
    { value: 2, symbol: '▒', label: 'Medium' },
    { value: 3, symbol: '█', label: 'High' },
  ],
} as const satisfies HeatmapSpec;

const monitoringHeatmap = {
  columns: ['09:00', '09:05', '09:10'],
  rows: ['API', 'DB', 'Queue'],
  data: [
    ['up', 'up', 'slow'],
    ['up', 'down', 'up'],
    ['slow', 'up', 'up'],
  ],
  levels: [
    { value: 'up', symbol: '●', color: 'ansiGreen' },
    { value: 'slow', symbol: '!', color: 'ansiYellow' },
    { value: 'down', symbol: '×', color: 'ansiRed' },
  ],
} as const satisfies HeatmapSpec;

const ansiColors = Object.keys(ANSI_COLORS) as Color[];

const ansiPaletteHeatmap = {
  title: 'ANSI palette',
  data: [ansiColors.map((_, index) => index)],
  levels: ansiColors.map((color, index) => ({
    value: index,
    symbol: '■',
    color,
    label: color,
  })),
  legend: true,
} satisfies HeatmapSpec;

/** Small-helper examples kept separate from chart-renderer snapshots. */
export const helperExamples: readonly HelperExample[] = [
  {
    helper: 'histogram',
    title: 'automatic histogram bins',
    code: 'histogram([1, 1, 2, 2, 2, 4])',
    output: JSON.stringify(histogram([1, 1, 2, 2, 2, 4])),
  },
  {
    helper: 'histogram',
    title: 'explicit histogram bin count',
    code: 'histogram([0, 4], { binCount: 4 })',
    output: JSON.stringify(histogram([0, 4], { binCount: 4 })),
  },
  {
    helper: 'heatmap',
    title: 'CI compatibility matrix',
    code: 'heatmap({ columns, rows, data, levels, legend: true })',
    output: heatmap(ciHeatmap),
  },
  {
    helper: 'heatmap',
    title: 'calendar activity',
    code: 'heatmap({ columns: weekdays, rows: weeks, data: activity, levels })',
    output: heatmap(calendarHeatmap),
  },
  {
    helper: 'heatmap',
    title: 'service monitoring',
    code: 'heatmap({ columns: times, rows: services, data: statuses, levels })',
    output: heatmap(monitoringHeatmap),
  },
  {
    helper: 'sparkline',
    title: 'ascending values',
    code: 'sparkline([0, 1, 2, 3, 4, 5, 6, 7])',
    output: sparkline([0, 1, 2, 3, 4, 5, 6, 7]),
  },
  {
    helper: 'sparkline',
    title: 'descending values',
    code: 'sparkline([7, 6, 5, 4, 3, 2, 1, 0])',
    output: sparkline([7, 6, 5, 4, 3, 2, 1, 0]),
  },
  {
    helper: 'sparkline',
    title: 'mixed negative and positive values',
    code: 'sparkline([-4, -2, 0, 2, 4])',
    output: sparkline([-4, -2, 0, 2, 4]),
  },
  {
    helper: 'sparkline',
    title: 'null gaps',
    code: 'sparkline([1, null, 3, null, 2])',
    output: sparkline([1, null, 3, null, 2]),
  },
  {
    helper: 'sparkline',
    title: 'constant values',
    code: 'sparkline([5, 5, 5])',
    output: sparkline([5, 5, 5]),
  },
  {
    helper: 'sparkline',
    title: 'volatile values',
    code: 'sparkline([10, 100, 20, 80, 30, 60, 40])',
    output: sparkline([10, 100, 20, 80, 30, 60, 40]),
  },
  {
    helper: 'heatmap',
    title: 'minimal unlabeled heatmap',
    code: 'heatmap({ data: [[0, 1], [1, null]], levels: [{ value: 0 }, { value: 1 }] })',
    output: heatmap({
      data: [
        [0, 1],
        [1, null],
      ],
      levels: [{ value: 0 }, { value: 1, symbol: '·' }],
    }),
  },
  {
    helper: 'heatmap',
    title: 'Unicode labels and title',
    code: 'heatmap({ title: "世界", columns: ["東", "西"], rows: ["東京"], data, levels })',
    output: heatmap({
      title: '世界',
      columns: ['東', '西'],
      rows: ['東京'],
      data: [['ok', 'warn']],
      levels: [
        { value: 'ok', symbol: '✓', color: 'ansiGreen' },
        { value: 'warn', symbol: '!', color: 'ansiYellow' },
      ],
    }),
  },
  {
    helper: 'heatmap',
    title: 'standalone legend with empty data',
    code: 'heatmap({ data: [], levels, title: "Status", legend: true })',
    output: heatmap({
      data: [],
      title: 'Status',
      levels: [
        { value: 'ready', symbol: '●', label: 'Ready' },
        { value: 'blocked', symbol: '×', label: 'Blocked' },
      ],
      legend: true,
    }),
  },
  {
    helper: 'sparkline',
    title: 'single value',
    code: 'sparkline([42])',
    output: sparkline([42]),
  },
  {
    helper: 'heatmap',
    title: 'ANSI color palette heatmap',
    code: 'heatmap({ data: [ANSI_COLORS], levels: colorLevels, legend: true })',
    output: heatmap(ansiPaletteHeatmap),
  },
  {
    helper: 'heatmap',
    title: 'numeric decimal heatmap',
    code: 'heatmap({ data: [[0.1, 0.5, 0.9]], levels: decimalLevels })',
    output: heatmap({
      columns: ['0.1', '0.5', '0.9'],
      data: [[0.1, 0.5, 0.9]],
      levels: [
        { value: 0.1, symbol: '░', label: 'Low' },
        { value: 0.5, symbol: '▒', label: 'Medium' },
        { value: 0.9, symbol: '▓', label: 'High' },
      ],
      legend: true,
    }),
  },
  {
    helper: 'heatmap',
    title: 'null checkerboard heatmap',
    code: 'heatmap({ data: [[1, null, 1], [null, 1, null]], levels: [{ value: 1 }] })',
    output: heatmap({
      data: [
        [1, null, 1],
        [null, 1, null],
        [1, null, 1],
      ],
      levels: [{ value: 1, symbol: '◆', color: 'ansiBrightBlue' }],
    }),
  },
  {
    helper: 'heatmap',
    title: 'negative numeric heatmap',
    code: 'heatmap({ data: [[-1, 0, 1]], levels: signedLevels })',
    output: heatmap({
      rows: ['delta'],
      columns: ['negative', 'zero', 'positive'],
      data: [[-1, 0, 1]],
      levels: [
        { value: -1, symbol: '-', color: 'ansiRed' },
        { value: 0, symbol: '0', color: 'ansiYellow' },
        { value: 1, symbol: '+', color: 'ansiGreen' },
      ],
    }),
  },
  {
    helper: 'heatmap',
    title: 'default-symbol heatmap',
    code: 'heatmap({ data: [["cold", "hot"]], levels: [{ value: "cold" }, { value: "hot" }] })',
    output: heatmap({
      data: [['cold', 'hot']],
      levels: [{ value: 'cold' }, { value: 'hot' }],
    }),
  },
  {
    helper: 'heatmap',
    title: 'long-label heatmap',
    code: 'heatmap({ rows: ["background worker"], columns: ["north america"], data, levels })',
    output: heatmap({
      title: 'Long labels',
      rows: ['background worker', 'scheduled processor'],
      columns: ['north america', 'asia pacific'],
      data: [
        ['healthy', 'degraded'],
        ['degraded', 'healthy'],
      ],
      levels: [
        { value: 'healthy', symbol: '●', color: 'ansiGreen' },
        { value: 'degraded', symbol: '!', color: 'ansiYellow' },
      ],
    }),
  },
  {
    helper: 'heatmap',
    title: 'fallback legend labels',
    code: 'heatmap({ data: [[1, 2]], levels: [{ value: 1 }, { value: 2 }], legend: true })',
    output: heatmap({
      data: [[1, 2]],
      levels: [
        { value: 1, symbol: '1' },
        { value: 2, symbol: '2' },
      ],
      legend: true,
    }),
  },
  {
    helper: 'heatmap',
    title: 'deployment readiness heatmap',
    code: 'heatmap({ rows: services, columns: environments, data: readiness, levels })',
    output: heatmap({
      title: 'Deployment readiness',
      rows: ['API', 'Worker', 'Web'],
      columns: ['Dev', 'Stage', 'Prod'],
      data: [
        ['ready', 'ready', 'blocked'],
        ['ready', 'warning', 'warning'],
        ['ready', 'ready', 'ready'],
      ],
      levels: [
        { value: 'ready', symbol: '●', color: 'ansiGreen', label: 'Ready' },
        { value: 'warning', symbol: '!', color: 'ansiYellow', label: 'Warning' },
        { value: 'blocked', symbol: '×', color: 'ansiRed', label: 'Blocked' },
      ],
      legend: true,
    }),
  },
  {
    helper: 'heatmap',
    title: 'regional latency heatmap',
    code: 'heatmap({ rows: regions, columns: endpoints, data: latencyBands, levels })',
    output: heatmap({
      title: 'Regional latency',
      rows: ['EU', 'US', 'APAC'],
      columns: ['/api', '/search', '/checkout'],
      data: [
        [1, 1, 2],
        [1, 2, 2],
        [2, 3, 3],
      ],
      levels: [
        { value: 1, symbol: '░', color: 'ansiGreen', label: '<100ms' },
        { value: 2, symbol: '▒', color: 'ansiYellow', label: '<300ms' },
        { value: 3, symbol: '▓', color: 'ansiRed', label: '300ms+' },
      ],
      legend: true,
    }),
  },
  {
    helper: 'heatmap',
    title: 'feature rollout heatmap',
    code: 'heatmap({ rows: cohorts, columns: features, data: rollout, levels })',
    output: heatmap({
      rows: ['Internal', 'Beta', 'Public'],
      columns: ['Search', 'Export', 'Alerts'],
      data: [
        ['on', 'on', 'on'],
        ['on', 'partial', 'off'],
        ['partial', 'off', 'off'],
      ],
      levels: [
        { value: 'on', symbol: '■', color: 'ansiGreen' },
        { value: 'partial', symbol: '◐', color: 'ansiYellow' },
        { value: 'off', symbol: '□', color: 'ansiBrightBlack' },
      ],
    }),
  },
  {
    helper: 'heatmap',
    title: 'role permissions heatmap',
    code: 'heatmap({ rows: roles, columns: actions, data: permissions, levels })',
    output: heatmap({
      rows: ['Admin', 'Editor', 'Viewer'],
      columns: ['Read', 'Write', 'Delete'],
      data: [
        ['allow', 'allow', 'allow'],
        ['allow', 'allow', 'deny'],
        ['allow', 'deny', 'deny'],
      ],
      levels: [
        { value: 'allow', symbol: '✓', color: 'ansiGreen' },
        { value: 'deny', symbol: '·', color: 'ansiBrightBlack' },
      ],
    }),
  },
  {
    helper: 'heatmap',
    title: 'incident severity heatmap',
    code: 'heatmap({ rows: systems, columns: days, data: incidents, levels })',
    output: heatmap({
      rows: ['Auth', 'Billing', 'Search'],
      columns: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      data: [
        [null, 'p2', null, null, 'p1'],
        ['p1', null, null, 'p2', null],
        [null, null, 'p0', 'p1', null],
      ],
      levels: [
        { value: 'p2', symbol: '2', color: 'ansiYellow' },
        { value: 'p1', symbol: '1', color: 'ansiRed' },
        { value: 'p0', symbol: '0', color: 'ansiBrightRed' },
      ],
    }),
  },
  {
    helper: 'sparkline',
    title: 'alternating extremes sparkline',
    code: 'sparkline([0, 10, 0, 10, 0, 10])',
    output: sparkline([0, 10, 0, 10, 0, 10]),
  },
  {
    helper: 'sparkline',
    title: 'decimal trend sparkline',
    code: 'sparkline([0.1, 0.15, 0.13, 0.2, 0.24, 0.3])',
    output: sparkline([0.1, 0.15, 0.13, 0.2, 0.24, 0.3]),
  },
  {
    helper: 'sparkline',
    title: 'negative values sparkline',
    code: 'sparkline([-8, -5, -7, -3, -1])',
    output: sparkline([-8, -5, -7, -3, -1]),
  },
  {
    helper: 'sparkline',
    title: 'sparse observations sparkline',
    code: 'sparkline([3, null, 9, null, 6, 12])',
    output: sparkline([3, null, 9, null, 6, 12]),
  },
  {
    helper: 'sparkline',
    title: 'recovery curve sparkline',
    code: 'sparkline([100, 80, 50, 30, 15, 8, 3])',
    output: sparkline([100, 80, 50, 30, 15, 8, 3]),
  },
  ...largeSparklineExamples,
  ...largeHeatmapExamples,
  ...additionalLargeSparklineExamples,
  ...additionalLargeHeatmapExamples,
];
