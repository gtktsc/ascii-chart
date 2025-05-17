import { Coordinates, Settings, SingleLine } from './types';

type Example = [Coordinates, Settings & { only?: boolean; title: string }];

const create = (
  data: Coordinates,
  settings: Settings & { only?: boolean; title: string },
): Example => [data, settings];

const settingsSchema = {
  showTickLabel: 'boolean',
  hideXAxis: 'boolean',
  hideXAxisTicks: 'boolean',
  hideYAxis: 'boolean',
  hideYAxisTicks: 'boolean',
  fillArea: 'boolean',
  debugMode: 'boolean',
  width: 'number',
  height: 'number',
  title: 'string',
  xLabel: 'string',
  yLabel: 'string',
  yRange: 'tuple:number:number',
  axisCenter: 'tuple:number:number',
} as const;

const typedSettings = <T extends Settings>(settings: T): T => {
  return settings;
};

const generateAllSettingsExamples = (
  data: Coordinates,
): [Coordinates, Settings & { title: string }][] => {
  const examples: [Coordinates, Settings & { title: string }][] = [];

  for (const [key, type] of Object.entries(settingsSchema)) {
    if (key === 'debugMode') continue;

    if (type === 'boolean') {
      for (const value of [true, false]) {
        examples.push(
          create(
            data,
            typedSettings({
              title: `${key} = ${value}`,
              [key]: value,
            } as const),
          ),
        );
      }
    } else if (type === 'number') {
      for (const value of [10, 50]) {
        examples.push(
          create(
            data,
            typedSettings({
              title: `${key} = ${value}`,
              [key]: value,
            } as const),
          ),
        );
      }
    } else if (type === 'tuple:number:number') {
      for (const value of [
        [0, 10],
        [-5, 5],
      ] as [number, number][]) {
        examples.push(
          create(
            data,
            typedSettings({
              title: `${key} = [${value.join(', ')}]`,
              [key]: value,
            } as const),
          ),
        );
      }
    } else if (type === 'string') {
      if (key !== 'title') {
        examples.push(
          create(
            data,
            typedSettings({
              title: `${key} = "label"`,
              [key]: 'label',
            } as const),
          ),
        );
      }
    }
  }

  return examples;
};

const datasets: Record<string, SingleLine> = {
  default: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 1],
    [5, -1],
    [6, 3],
    [7, -1],
    [8, 9],
    [9, 10],
    [10, 11],
  ],
  small: [
    [0.001, 0.001],
    [0.002, 0.004],
    [0.003, 0.002],
    [0.004, -0.001],
    [0.005, 0.004],
    [0.006, 0.014],
  ],
  short: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 1],
  ],
  negativeMixed: [
    [-1, 2],
    [1, 2],
    [2, 3],
    [5, 5],
    [6, -2],
  ],
  simpleHigh: [
    [1, 10],
    [2, 20],
    [3, 30],
    [4, 40],
    [5, 50],
  ],
  limited: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 8],
  ],
  tickTest: [
    [1, 2],
    [2, 3],
    [5, 5],
    [6, 10],
  ],
  thresholds: [
    [1, 1],
    [2, 4],
    [3, 4],
    [4, 2],
    [5, -1],
    [6, 3],
    [7, -1],
    [8, 9],
  ],
};

export const examples: Example[] = [
  create(datasets.default, { title: 'simple example' }),
  create(datasets.small, {
    title: 'small numbers',
    hideYAxisTicks: true,
    width: 20,
    height: 10,
  }),
  create(datasets.default, {
    title: 'Tick Label',
    hideYAxisTicks: true,
    showTickLabel: true,
    yRange: [0, 120],
    width: 50,
    height: 27,
  }),
  create(datasets.default, {
    title: 'Border',
    symbols: { border: '█' },
    xLabel: 'x',
    yLabel: 'y',
    width: 20,
    height: 8,
  }),
  create(datasets.simpleHigh, { title: 'Simple chart', width: 10, height: 5, yRange: [60, 70] }),
  create(datasets.short, { title: 'bar chart', width: 10, mode: 'bar', height: 10 }),
  create(
    [
      [-1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    { title: 'horizontal bar chart', width: 20, mode: 'horizontalBar', height: 10 },
  ),
  create(datasets.short, { title: 'area', width: 20, fillArea: true, height: 10 }),
  create(datasets.short, { title: 'labels', width: 20, xLabel: 'x', yLabel: 'y', height: 10 }),
  create(
    [
      datasets.short,
      [
        [1, -2],
        [2, -3],
        [3, 3],
        [4, 0],
      ],
    ],
    {
      title: 'legend',
      width: 20,
      legend: { position: 'bottom', series: ['first', 'second'] },
      xLabel: 'x',
      yLabel: 'y',
      height: 10,
    },
  ),
  create(
    [
      datasets.short,
      [
        [1, -2],
        [2, -3],
        [3, 3],
        [4, 0],
      ],
      [
        [1, -6],
        [2, -3],
        [3, 3],
        [4, 0],
      ],
      [
        [1, -2],
        [2, -3],
        [3, 3],
        [4, 0],
        [5, 3],
      ],
    ],
    {
      title: 'multiline',
      width: 50,
    },
  ),
  create(
    [
      datasets.short,
      [
        [1, -2],
        [2, -3],
        [3, 3],
        [4, 0],
      ],
      [
        [1, -6],
        [2, -3],
        [3, 3],
        [4, 0],
      ],
      [
        [1, -2],
        [2, -3],
        [3, 3],
        [4, 0],
        [5, 3],
      ],
    ],
    {
      title: 'multiline points',
      width: 50,
      mode: 'point',
    },
  ),
  create(datasets.limited, { title: 'yRange', width: 20, height: 10, yRange: [1, 3] }),
  create(datasets.short, { title: 'yRange', width: 20, height: 10, yRange: [0, 5] }),
  create([...datasets.short, [5, 5], [6, 10]], {
    title: 'showTickLabel',
    width: 20,
    height: 10,
    showTickLabel: true,
  }),
  create(datasets.tickTest, { title: 'hideXAxis', width: 20, height: 10, hideXAxis: true }),
  create(datasets.tickTest, { title: 'hideYAxis', width: 20, height: 10, hideYAxis: true }),
  create(datasets.negativeMixed, {
    title: 'axisCenter',
    width: 20,
    height: 10,
    axisCenter: [0, 0],
    showTickLabel: true,
  }),
  create(datasets.negativeMixed, {
    title: 'lineFormatter',
    width: 20,
    height: 10,
    lineFormatter: (props) => {
      const output = [{ x: props.plotX, y: props.plotY, symbol: '█' }];
      const [minX] = props.toPlotCoordinates(props.minX, props.minY);
      let i = minX;
      while (i <= props.plotX) output.push({ x: i++, y: props.plotY, symbol: '█' });
      return output;
    },
  }),
  create(datasets.negativeMixed, {
    title: 'lineFormatter',
    width: 20,
    height: 10,
    lineFormatter: (props) => {
      const output = [{ x: props.plotX, y: props.plotY, symbol: '█' }];
      const [, maxY] = props.toPlotCoordinates(props.x, props.minY);
      let i = props.plotY;
      while (i <= maxY + 1) output.push({ x: props.plotX, y: i++, symbol: '█' });
      return output;
    },
  }),
  create(datasets.negativeMixed, {
    title: 'symbols',
    width: 20,
    height: 10,
    symbols: {
      background: '█',
      border: 'A',
      empty: 'B',
    },
  }),
  create(datasets.short, { title: 'colors', width: 20, color: 'ansiGreen', height: 10 }),
  create(datasets.default, {
    title: 'custom y axis',
    width: 20,
    height: 10,
    customYAxisTicks: [-30, -2, 0, 2, 4, 6, 30],
    customXAxisTicks: [-30, 0, 2, 4, 6, 30],
  }),
  create(datasets.default, {
    title: 'custom ticks and axis center',

    width: 20,
    height: 10,
    axisCenter: [3, 3],
    customYAxisTicks: [-30, -2, 0, 2, 4, 6, 30],
    customXAxisTicks: [-30, 0, 2, 4, 6, 30],
  }),
  create(datasets.default, {
    title: 'custom ticks and axis center, hide x axis',

    width: 20,
    height: 10,
    hideXAxis: true,
    axisCenter: [3, 3],
    customYAxisTicks: [-30, -2, 0, 2, 4, 6, 30],
    customXAxisTicks: [-30, 0, 2, 4, 6, 30],
  }),
  create(datasets.default, {
    title: 'custom ticks and axis center, hide y axis',
    width: 20,
    height: 10,
    hideYAxis: true,
    axisCenter: [3, 3],
    customYAxisTicks: [-30, -2, 0, 2, 4, 6, 30],
    customXAxisTicks: [-30, 0, 2, 4, 6, 30],
  }),
  create(datasets.default, {
    title: 'custom ticks and axis center, hide y axis, show tick label',
    width: 20,
    height: 10,
    hideXAxis: true,
    axisCenter: [3, 3],
    showTickLabel: true,
    customXAxisTicks: [-30, 0, 2, 4, 6, 30],
  }),
  create(
    [
      datasets.short,
      [
        [1, 3],
        [2, 1],
        [3, 0],
        [4, 4],
      ],
    ],
    {
      title: 'colors with legend',
      width: 20,
      height: 10,
      thresholds: [{ x: 2, y: 2, color: 'ansiBlue' }],
      color: ['ansiGreen', 'ansiMagenta'],
      legend: { position: 'bottom', series: ['first', 'second'] },
    },
  ),
  create(datasets.thresholds, {
    width: 40,
    title: 'thresholds',
    thresholds: [
      { y: 5, x: 5, color: 'ansiBlue' },
      { y: 2, color: 'ansiGreen' },
    ],
  }),
  create(datasets.thresholds, {
    width: 40,
    title: 'thresholds',
    symbols: {
      thresholds: {
        x: 'X',
        y: 'Y',
      },
    },
    thresholds: [
      { y: 5, x: 5, color: 'ansiBlue' },
      { y: 2, color: 'ansiGreen' },
    ],
  }),
  create(
    [
      [0, 3],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, -2],
      [5, -5],
      [6, 2],
      [7, 0],
    ],
    {
      title: 'with axis center',
      color: 'ansiGreen',
      showTickLabel: true,
      width: 40,
      axisCenter: [0, 2],
    },
  ),
  create(
    [
      [0, 3],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, -2],
      [5, -5],
      [6, 2],
      [7, 0],
    ],
    {
      title: 'bar chart with colors',
      color: 'ansiGreen',
      mode: 'bar',
      showTickLabel: true,
      width: 40,
      axisCenter: [0, 0],
    },
  ),
  create(
    [
      [0, 3],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, -2],
      [5, -5],
      [6, 2],
      [7, 0],
    ],
    {
      title: 'horizontal bar chart with axis center',
      mode: 'horizontalBar',

      showTickLabel: true,
      width: 40,
      height: 20,
      axisCenter: [3, 1],
    },
  ),
  create(
    [
      [1, 0],
      [2, 20],
      [3, 29],
    ],
    {
      height: 10,
      mode: 'horizontalBar',
      width: 20,
      showTickLabel: true,
      title: 'horizontal bar chart',
    },
  ),
  create(
    [
      [1, 0],
      [2, 20],
      [3, 29],
    ],
    {
      height: 10,
      mode: 'bar',
      width: 20,
      showTickLabel: true,
      title: 'bar chart',
    },
  ),

  create(datasets.default, {
    width: 20,
    axisCenter: [3, 5],
    title: 'axis center',
  }),

  create(datasets.default, {
    axisCenter: [3, 5],
    title: 'axis center',
  }),
  create(datasets.default, {
    axisCenter: [0, -10],
    title: 'axis center',
  }),
  create(datasets.default, {
    axisCenter: [0, 0],
    title: 'axis center',
  }),
  create(datasets.default, {
    axisCenter: [0, 0],
    title: 'axis center',
  }),
  create(datasets.default, {
    axisCenter: [0, 0],
    title: 'axis center',
  }),
  create(
    [
      [-8, 8],
      [-4, 4],
      [-3, 3],
      [80, 80],
    ],
    { title: 'Small and big values', width: 60, height: 10 },
  ),
  ...generateAllSettingsExamples(datasets.default),
  create(datasets.default, {
    axisCenter: [-20, 5],
    width: 50,
    height: 20,
    title: 'axis center',
  }),
  create(datasets.default, {
    axisCenter: [20, 5],
    width: 50,
    height: 20,
    title: 'axis center',
  }),
  create(datasets.default, {
    axisCenter: [0, 20],
    width: 50,
    height: 20,
    title: 'axis center',
  }),
  create(datasets.default, {
    axisCenter: [0, -20],
    width: 50,
    height: 20,
    title: 'axis center',
  }),
  create(datasets.default, {
    axisCenter: [0, -20],
    hideXAxis: true,
    width: 50,
    height: 20,
    title: 'axis center',
  }),
  create(
    [
      [
        [-8, -8],
        [-4, -4],
        [-3, -3],
        [-2, -2],
        [-1, -1],
        [0, 0],
        [2, 2],
        [3, 3],
        [4, 4],
        [8, 8],
      ],
    ],
    {
      title: 'raws two complicated graphs with moved axis',
      width: 40,
      height: 20,
      axisCenter: [0, 0],
    },
  ),
  create(
    [
      [-5, 2],
      [2, -3],
      [13, 0.1],
      [4, 2],
      [5, -2],
      [6, 12],
    ],
    {
      title: 'hide axis',
      width: 40,
      height: 10,
      hideYAxis: true,
      hideXAxis: true,
    },
  ),
  create(
    [
      [0, 3],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, -2],
      [5, -5],
      [6, 2],
      [7, 0],
    ],
    {
      title: 'bar chart with axis',
      mode: 'bar',
      showTickLabel: true,
      width: 40,
      axisCenter: [0, 0],
    },
  ),
];
