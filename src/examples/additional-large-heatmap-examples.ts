import { HeatmapSpec } from '@types';
import { heatmap } from '@services/renderers/heatmap';

const createMatrix = <T>(
  rowCount: number,
  columnCount: number,
  valueAt: (row: number, column: number) => T,
): T[][] =>
  Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: columnCount }, (_, column) => valueAt(row, column)),
  );

const kubernetesCapacityHeatmap = {
  title: 'Kubernetes capacity by cluster',
  rows: ['gateway', 'auth', 'catalog', 'search', 'checkout', 'payments', 'orders', 'worker'],
  columns: [
    'us-e1',
    'us-e2',
    'us-w1',
    'ca-c1',
    'eu-w1',
    'eu-c1',
    'eu-n1',
    'ap-s1',
    'ap-ne1',
    'ap-se1',
    'sa-e1',
    'af-s1',
  ],
  data: createMatrix(8, 12, (row, column) => (row * 5 + column * 3 + Math.floor(column / 3)) % 4),
  levels: [
    { value: 0, symbol: '░', color: 'ansiGreen', label: '<50%' },
    { value: 1, symbol: '▒', color: 'ansiCyan', label: '50-69%' },
    { value: 2, symbol: '▓', color: 'ansiYellow', label: '70-84%' },
    { value: 3, symbol: '█', color: 'ansiRed', label: '85%+' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const multiPlatformCiHeatmap = {
  title: 'Multi-platform CI',
  rows: ['Node 18', 'Node 20', 'Node 22', 'Node 24', 'Bun 1.2', 'Deno 2', 'Electron', 'Browser'],
  columns: [
    'linux-x64',
    'linux-arm',
    'mac-x64',
    'mac-arm',
    'win-x64',
    'win-arm',
    'alpine',
    'freebsd',
    'chrome',
    'firefox',
  ],
  data: createMatrix(8, 10, (row, column) => {
    const signal = (row * 7 + column * 5) % 13;
    if ((row + column) % 11 === 0) return 'skip';
    if (signal === 0) return 'fail';
    if (signal < 3) return 'flaky';
    return 'pass';
  }),
  levels: [
    { value: 'pass', symbol: '✓', color: 'ansiBrightGreen', label: 'Passed' },
    { value: 'flaky', symbol: '~', color: 'ansiYellow', label: 'Flaky' },
    { value: 'fail', symbol: '×', color: 'ansiBrightRed', label: 'Failed' },
    { value: 'skip', symbol: '·', color: 'ansiBrightBlack', label: 'Skipped' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const weeklyTrafficDensityHeatmap = {
  title: 'Weekly traffic density',
  rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  columns: Array.from({ length: 24 }, (_, hour) => hour.toString().padStart(2, '0')),
  data: createMatrix(7, 24, (day, hour) => {
    const morning = Math.max(0, 3 - Math.floor(Math.abs(hour - 9) / 2));
    const evening = Math.max(0, 4 - Math.floor(Math.abs(hour - 18) / 2));
    const weekendPenalty = day >= 5 ? 1 : 0;
    return Math.max(0, Math.min(4, Math.max(morning, evening) - weekendPenalty));
  }),
  levels: [
    { value: 0, symbol: '·', color: 'ansiBrightBlack', label: 'Idle' },
    { value: 1, symbol: '░', color: 'ansiGreen', label: 'Low' },
    { value: 2, symbol: '▒', color: 'ansiCyan', label: 'Medium' },
    { value: 3, symbol: '▓', color: 'ansiMagenta', label: 'High' },
    { value: 4, symbol: '█', color: 'ansiBrightRed', label: 'Peak' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const errorBudgetBurnHeatmap = {
  title: 'Error budget burn by sprint',
  rows: [
    'Gateway',
    'Identity',
    'Catalog',
    'Search',
    'Cart',
    'Checkout',
    'Payments',
    'Orders',
    'Shipping',
    'Messaging',
  ],
  columns: ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08'],
  data: createMatrix(10, 8, (row, column) => {
    const signal = (row * 11 + column * 7) % 17;
    if (signal >= 15) return 'exhausted';
    if (signal >= 11) return 'burn';
    if (signal >= 7) return 'watch';
    return 'safe';
  }),
  levels: [
    { value: 'safe', symbol: '●', color: 'ansiGreen', label: 'Safe' },
    { value: 'watch', symbol: '○', color: 'ansiCyan', label: 'Watch' },
    { value: 'burn', symbol: '!', color: 'ansiYellow', label: 'Burning' },
    { value: 'exhausted', symbol: '×', color: 'ansiRed', label: 'Exhausted' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const replicationLagHeatmap = {
  title: 'Replication lag bands',
  rows: ['primary', 'us-read', 'ca-read', 'eu-read', 'ap-read', 'archive', 'analytics', 'backup'],
  columns: Array.from({ length: 12 }, (_, index) => `${(index * 5).toString().padStart(2, '0')}m`),
  data: createMatrix(8, 12, (row, column) => (row * 7 + column * 3 + (column > 7 ? 2 : 0)) % 5),
  levels: [
    { value: 0, symbol: '.', color: 'ansiGreen', label: '<50ms' },
    { value: 1, symbol: ':', color: 'ansiCyan', label: '<250ms' },
    { value: 2, symbol: '+', color: 'ansiBlue', label: '<1s' },
    { value: 3, symbol: '#', color: 'ansiYellow', label: '<5s' },
    { value: 4, symbol: '@', color: 'ansiRed', label: '5s+' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const featureCohortHeatmap = {
  title: 'Feature rollout by cohort',
  rows: [
    'Staff',
    'Internal',
    'Design partners',
    'Alpha',
    'Beta 1',
    'Beta 2',
    'Pro',
    'Teams',
    'Enterprise',
    'Public',
  ],
  columns: [
    'Search',
    'Export',
    'Alerts',
    'Audit',
    'Themes',
    'Sharing',
    'API v2',
    'Offline',
    'Mobile',
    'Insights',
  ],
  data: createMatrix(10, 10, (row, column) => {
    const signal = (row * 3 + column * 5) % 12;
    if (signal === 0) return 'off';
    if (signal < 4) return 'pilot';
    if (signal < 8) return 'partial';
    return 'on';
  }),
  levels: [
    { value: 'off', symbol: '□', color: 'ansiBrightBlack', label: 'Off' },
    { value: 'pilot', symbol: '◔', color: 'ansiBlue', label: 'Pilot' },
    { value: 'partial', symbol: '◐', color: 'ansiYellow', label: 'Partial' },
    { value: 'on', symbol: '■', color: 'ansiGreen', label: 'Enabled' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const patchComplianceHeatmap = {
  title: 'Security patch compliance',
  rows: [
    'edge',
    'gateway',
    'auth',
    'catalog',
    'search',
    'checkout',
    'payments',
    'orders',
    'worker',
    'scheduler',
    'analytics',
    'admin',
  ],
  columns: ['Dev', 'QA', 'Stage', 'Prod-US', 'Prod-EU', 'Prod-AP', 'DR', 'Sandbox'],
  data: createMatrix(12, 8, (row, column) => {
    const signal = (row * 7 + column * 2) % 15;
    if (signal === 0) return 'exempt';
    if (signal < 3) return 'overdue';
    if (signal < 7) return 'due';
    return 'patched';
  }),
  levels: [
    { value: 'patched', symbol: '✓', color: 'ansiGreen', label: 'Patched' },
    { value: 'due', symbol: '!', color: 'ansiYellow', label: 'Due soon' },
    { value: 'overdue', symbol: '×', color: 'ansiRed', label: 'Overdue' },
    { value: 'exempt', symbol: '-', color: 'ansiBrightBlack', label: 'Exempt' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const modelEvaluationHeatmap = {
  title: 'Model evaluation matrix',
  rows: [
    'baseline',
    'linear-v2',
    'tree-v4',
    'forest-v3',
    'boost-v5',
    'neural-s',
    'neural-m',
    'ensemble',
  ],
  columns: [
    'Accuracy',
    'Recall',
    'Precision',
    'F1',
    'Latency',
    'Memory',
    'Robustness',
    'Fairness',
    'Drift',
    'Cost',
  ],
  data: createMatrix(8, 10, (row, column) => {
    const signal = (row * 9 + column * 4) % 13;
    if (signal === 0) return 'na';
    if (signal < 4) return 'loss';
    if (signal < 7) return 'tie';
    return 'win';
  }),
  levels: [
    { value: 'win', symbol: '+', color: 'ansiBrightGreen', label: 'Improved' },
    { value: 'tie', symbol: '=', color: 'ansiCyan', label: 'Equivalent' },
    { value: 'loss', symbol: '-', color: 'ansiRed', label: 'Regressed' },
    { value: 'na', symbol: '·', color: 'ansiBrightBlack', label: 'N/A' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const storageUtilizationHeatmap = {
  title: 'Storage utilization by month',
  rows: [
    'users',
    'uploads',
    'media',
    'events',
    'logs',
    'metrics',
    'backups',
    'exports',
    'archive',
    'scratch',
  ],
  columns: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  data: createMatrix(10, 12, (row, column) =>
    Math.min(4, Math.floor(((row * 9 + column * 7) % 101) / 20)),
  ),
  levels: [
    { value: 0, symbol: '▁', color: 'ansiGreen', label: '<20%' },
    { value: 1, symbol: '▂', color: 'ansiCyan', label: '20-39%' },
    { value: 2, symbol: '▄', color: 'ansiBlue', label: '40-59%' },
    { value: 3, symbol: '▆', color: 'ansiYellow', label: '60-79%' },
    { value: 4, symbol: '█', color: 'ansiRed', label: '80%+' },
  ],
  legend: true,
} satisfies HeatmapSpec;

const onCallCoverageHeatmap = {
  title: 'On-call coverage by hour',
  rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  columns: Array.from({ length: 24 }, (_, hour) => hour.toString().padStart(2, '0')),
  data: createMatrix(7, 24, (day, hour) => {
    const signal = (day * 5 + hour * 3) % 17;
    if (signal === 0) return 'gap';
    if (signal < 4) return 'overlap';
    return hour >= 8 && hour < 18 ? 'primary' : 'secondary';
  }),
  levels: [
    { value: 'primary', symbol: 'P', color: 'ansiGreen', label: 'Primary' },
    { value: 'secondary', symbol: 'S', color: 'ansiBlue', label: 'Secondary' },
    { value: 'overlap', symbol: '+', color: 'ansiCyan', label: 'Overlap' },
    { value: 'gap', symbol: '!', color: 'ansiBrightRed', label: 'Coverage gap' },
  ],
  legend: true,
} satisfies HeatmapSpec;

/**
 * Examples covering additional large heatmap behavior.
 */
export const additionalLargeHeatmapExamples = [
  {
    helper: 'heatmap',
    title: 'Kubernetes capacity heatmap',
    code: 'heatmap(kubernetesCapacityHeatmap)',
    output: heatmap(kubernetesCapacityHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'multi-platform CI heatmap',
    code: 'heatmap(multiPlatformCiHeatmap)',
    output: heatmap(multiPlatformCiHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'weekly traffic density heatmap',
    code: 'heatmap(weeklyTrafficDensityHeatmap)',
    output: heatmap(weeklyTrafficDensityHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'error budget burn heatmap',
    code: 'heatmap(errorBudgetBurnHeatmap)',
    output: heatmap(errorBudgetBurnHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'replication lag heatmap',
    code: 'heatmap(replicationLagHeatmap)',
    output: heatmap(replicationLagHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'feature cohort heatmap',
    code: 'heatmap(featureCohortHeatmap)',
    output: heatmap(featureCohortHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'patch compliance heatmap',
    code: 'heatmap(patchComplianceHeatmap)',
    output: heatmap(patchComplianceHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'model evaluation heatmap',
    code: 'heatmap(modelEvaluationHeatmap)',
    output: heatmap(modelEvaluationHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'storage utilization heatmap',
    code: 'heatmap(storageUtilizationHeatmap)',
    output: heatmap(storageUtilizationHeatmap),
    size: 'large',
  },
  {
    helper: 'heatmap',
    title: 'on-call coverage heatmap',
    code: 'heatmap(onCallCoverageHeatmap)',
    output: heatmap(onCallCoverageHeatmap),
    size: 'large',
  },
] satisfies readonly import('./helpers').HelperExample[];
