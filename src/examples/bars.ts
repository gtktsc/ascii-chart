import { create, Example } from './conversion';

/**
 * Examples covering bar behavior.
 */
export const barExamples: Example[] = [
  create(
    [
      [
        [0, 2],
        [1, 5],
        [2, 3],
      ],
      [
        [0, 4],
        [1, 1],
        [2, 6],
      ],
    ],
    {
      title: 'bar options: grouped positive values',
      mode: 'bar',
      barLayout: 'grouped',
      width: 18,
      height: 8,
      color: ['ansiCyan', 'ansiMagenta'],
    },
  ),
  create(
    [
      [
        [0, 0],
        [1, 3],
        [2, 6],
      ],
      [
        [0, 2],
        [1, 5],
        [2, 1],
      ],
      [
        [0, 4],
        [1, 1],
        [2, 3],
      ],
    ],
    {
      title: 'bar options: grouped three series with zero',
      mode: 'bar',
      barLayout: 'grouped',
      width: 20,
      height: 8,
      color: ['ansiRed', 'ansiGreen', 'ansiBlue'],
    },
  ),
  create(
    [
      [
        [0, -4],
        [1, 3],
        [2, -2],
      ],
      [
        [0, 2],
        [1, -5],
        [2, 4],
      ],
    ],
    {
      title: 'bar options: grouped mixed signs',
      mode: 'bar',
      barLayout: 'grouped',
      axisCenter: [undefined, 0],
      width: 18,
      height: 10,
      color: ['ansiYellow', 'ansiBlue'],
    },
  ),
  create(
    [
      [
        [0, 2],
        [1, 7],
        [2, 4],
      ],
      [
        [0, 8],
        [1, 3],
        [2, 6],
      ],
    ],
    {
      title: 'bar options: grouped baseline five',
      mode: 'bar',
      barLayout: 'grouped',
      axisCenter: [undefined, 5],
      width: 18,
      height: 9,
      color: ['ansiBrightCyan', 'ansiBrightMagenta'],
    },
  ),
  create(
    [
      [
        [0, 2],
        [1, 3],
        [2, 1],
      ],
      [
        [0, 4],
        [1, 2],
        [2, 5],
      ],
      [
        [0, 1],
        [1, 4],
        [2, 2],
      ],
    ],
    {
      title: 'bar options: stacked three positive series',
      mode: 'bar',
      barLayout: 'stacked',
      width: 18,
      height: 10,
      color: ['ansiRed', 'ansiGreen', 'ansiBlue'],
    },
  ),
  create(
    [
      [
        [0, 4],
        [1, -2],
        [2, 3],
      ],
      [
        [0, -3],
        [1, 5],
        [2, -4],
      ],
      [
        [0, 2],
        [1, -1],
        [2, 1],
      ],
    ],
    {
      title: 'bar options: diverging stacked values',
      mode: 'bar',
      barLayout: 'stacked',
      width: 18,
      height: 12,
      color: ['ansiGreen', 'ansiRed', 'ansiYellow'],
    },
  ),
  create(
    [
      [
        [0, 3],
        [1, -2],
        [2, 1],
      ],
      [
        [0, 2],
        [1, -1],
        [2, 4],
      ],
    ],
    {
      title: 'bar options: stacked baseline five',
      mode: 'bar',
      barLayout: 'stacked',
      axisCenter: [undefined, 5],
      width: 18,
      height: 10,
      color: ['ansiBrightGreen', 'ansiBrightRed'],
    },
  ),
  create(
    [
      [
        [2, 0],
        [5, 1],
        [3, 2],
      ],
      [
        [4, 0],
        [1, 1],
        [6, 2],
      ],
    ],
    {
      title: 'bar options: grouped horizontal values',
      mode: 'horizontalBar',
      barLayout: 'grouped',
      width: 20,
      height: 8,
      color: ['ansiCyan', 'ansiMagenta'],
    },
  ),
  create(
    [
      [
        [4, 0],
        [-2, 1],
        [3, 2],
      ],
      [
        [-3, 0],
        [5, 1],
        [-4, 2],
      ],
    ],
    {
      title: 'bar options: diverging stacked horizontal values',
      mode: 'horizontalBar',
      barLayout: 'stacked',
      width: 22,
      height: 8,
      color: ['ansiGreen', 'ansiRed'],
    },
  ),
  create(
    [
      [0, 1500],
      [1, 2250],
      [2, 750],
    ],
    {
      title: 'bar options: compact default value labels',
      mode: 'bar',
      valueLabels: true,
      width: 20,
      height: 10,
      yRange: [0, 3000],
      xAxis: { domain: [-0.5, 2.5] },
      color: 'ansiBrightBlue',
    },
  ),
  create(
    [
      [
        [0, 12],
        [1, 18],
        [2, 9],
      ],
      [
        [0, 8],
        [1, 14],
        [2, 16],
      ],
    ],
    {
      title: 'bar options: grouped currency labels',
      mode: 'bar',
      barLayout: 'grouped',
      valueLabels: { formatter: (value) => `$${value}` },
      width: 24,
      height: 12,
      color: ['ansiBrightGreen', 'ansiBrightYellow'],
    },
  ),
  create(
    [
      [
        [3, 0],
        [5, 1],
        [2, 2],
      ],
      [
        [2, 0],
        [1, 1],
        [4, 2],
      ],
    ],
    {
      title: 'bar options: stacked horizontal series labels',
      mode: 'horizontalBar',
      barLayout: 'stacked',
      valueLabels: {
        formatter: (value, { seriesName }) => `${seriesName}:${value}`,
      },
      legend: { position: 'bottom', series: ['North', 'South'] },
      width: 28,
      height: 9,
      color: ['ansiBrightCyan', 'ansiBrightMagenta'],
    },
  ),
  create(
    [
      [
        [0, 2],
        [2, 5],
      ],
      [[1, 4]],
      [
        [0, 3],
        [1, 1],
        [2, 6],
      ],
    ],
    {
      title: 'bar options: grouped sparse categories',
      mode: 'bar',
      barLayout: 'grouped',
      width: 24,
      height: 9,
      color: ['ansiRed', 'ansiGreen', 'ansiBlue'],
    },
  ),
  create(
    [
      [
        [0, 0.25],
        [1, 1.5],
        [2, 2.75],
      ],
      [
        [0, 1.25],
        [1, 0.5],
        [2, 2.1],
      ],
    ],
    {
      title: 'bar options: grouped fractional values',
      mode: 'bar',
      barLayout: 'grouped',
      valueLabels: { formatter: (value) => value.toFixed(2) },
      width: 24,
      height: 10,
      color: ['ansiBrightBlue', 'ansiBrightYellow'],
    },
  ),
  create(
    [
      [
        [-10, 4],
        [0, 2],
        [10, 5],
      ],
      [
        [-10, 1],
        [0, 6],
        [10, 3],
      ],
    ],
    {
      title: 'bar options: grouped edge categories',
      mode: 'bar',
      barLayout: 'grouped',
      width: 26,
      height: 9,
      color: ['ansiCyan', 'ansiMagenta'],
    },
  ),
  create(
    [
      [
        [2, 0],
        [8, 1],
        [4, 2],
      ],
      [
        [7, 0],
        [3, 1],
        [9, 2],
      ],
    ],
    {
      title: 'bar options: grouped horizontal baseline five',
      mode: 'horizontalBar',
      barLayout: 'grouped',
      axisCenter: [5, undefined],
      width: 24,
      height: 9,
      color: ['ansiBrightCyan', 'ansiBrightMagenta'],
    },
  ),
  create(
    [
      [
        [0, 1],
        [1, 2],
        [2, 3],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 3],
        [1, 2],
        [2, 1],
      ],
      [
        [0, 1],
        [1, 3],
        [2, 2],
      ],
    ],
    {
      title: 'bar options: stacked four series',
      mode: 'bar',
      barLayout: 'stacked',
      width: 20,
      height: 12,
      color: ['ansiRed', 'ansiGreen', 'ansiBlue', 'ansiYellow'],
    },
  ),
  create(
    [
      [
        [0, 0.5],
        [1, 1.25],
        [2, -0.75],
      ],
      [
        [0, 1.75],
        [1, -0.5],
        [2, 1.5],
      ],
      [
        [0, -0.25],
        [1, 0.75],
        [2, -1.25],
      ],
    ],
    {
      title: 'bar options: stacked fractional values',
      mode: 'bar',
      barLayout: 'stacked',
      valueLabels: { formatter: (value) => value.toFixed(2) },
      width: 22,
      height: 12,
      color: ['ansiBrightGreen', 'ansiBrightRed', 'ansiBrightBlue'],
    },
  ),
  create(
    [
      [
        [0, -2],
        [1, -4],
        [2, -1],
      ],
      [
        [0, -3],
        [1, -1],
        [2, -5],
      ],
      [
        [0, -1],
        [1, -2],
        [2, -2],
      ],
    ],
    {
      title: 'bar options: stacked all negative values',
      mode: 'bar',
      barLayout: 'stacked',
      width: 20,
      height: 11,
      color: ['ansiRed', 'ansiBrightRed', 'ansiMagenta'],
    },
  ),
  create(
    [
      [
        [3, 0],
        [-2, 1],
        [4, 2],
      ],
      [
        [2, 0],
        [5, 1],
        [-1, 2],
      ],
    ],
    {
      title: 'bar options: stacked horizontal baseline ten',
      mode: 'horizontalBar',
      barLayout: 'stacked',
      axisCenter: [10, undefined],
      width: 26,
      height: 8,
      color: ['ansiBrightGreen', 'ansiBrightBlue'],
    },
  ),
  create(
    [
      [
        [0, 2],
        [1, 5],
        [2, 3],
      ],
      [
        [0, 4],
        [1, 1],
        [2, 6],
      ],
    ],
    {
      title: 'bar options: overlapping multi-series bars',
      mode: 'bar',
      barLayout: 'overlap',
      valueLabels: true,
      width: 22,
      height: 10,
      color: ['ansiCyan', 'ansiMagenta'],
    },
  ),
  create(
    [
      [
        [0, 25],
        [1, 40],
        [2, 65],
      ],
      [
        [0, 45],
        [1, 30],
        [2, 20],
      ],
    ],
    {
      title: 'bar options: grouped percentage labels',
      mode: 'bar',
      barLayout: 'grouped',
      valueLabels: { formatter: (value) => `${value}%` },
      width: 26,
      height: 12,
      color: ['ansiBrightCyan', 'ansiBrightMagenta'],
    },
  ),
  create(
    [
      [
        [0, 4],
        [1, -3],
        [2, 2],
      ],
      [
        [0, -2],
        [1, 5],
        [2, -4],
      ],
    ],
    {
      title: 'bar options: stacked mixed-sign value labels',
      mode: 'bar',
      barLayout: 'stacked',
      valueLabels: {
        formatter: (value, { seriesIndex, datumIndex }) => `${seriesIndex}.${datumIndex}:${value}`,
      },
      width: 28,
      height: 12,
      color: ['ansiGreen', 'ansiRed'],
    },
  ),
  create(
    [
      [
        [-2, 0],
        [-5, 1],
        [-3, 2],
      ],
      [
        [-4, 0],
        [-1, 1],
        [-6, 2],
      ],
    ],
    {
      title: 'bar options: grouped horizontal negative values',
      mode: 'horizontalBar',
      barLayout: 'grouped',
      width: 22,
      height: 8,
      color: ['ansiYellow', 'ansiBlue'],
    },
  ),
];
