import { plot } from './services/plot';
import { Coordinates, Settings } from './types';

const examples: Array<[Coordinates, Settings & { only?: boolean }]> = [
  [
    [
      [1, 2],
      [2, 3],
    ],
    { title: 'simple example' },
  ],
  [
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    { title: 'bar chart', width: 10, mode: 'bar', height: 10 },
  ],
  [
    [
      [-1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    { title: 'horizontal bar chart', width: 20, mode: 'horizontalBar', height: 10 },
  ],
  [
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    { title: 'area', width: 20, fillArea: true, height: 10 },
  ],
  [
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    { title: 'labels', width: 20, xLabel: 'x', yLabel: 'y', height: 10 },
  ],
  [
    [
      [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 1],
      ],
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
  ],
  [
    [
      [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 1],
      ],
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
  ],
  [
    [
      [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 1],
      ],
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
  ],
  [
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 8],
    ],
    { title: 'yRange', width: 20, height: 10, yRange: [1, 3] },
  ],
  [
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    { title: 'yRange', width: 20, height: 10, yRange: [0, 5] },
  ],
  [
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
      [5, 5],
      [6, 10],
    ],
    { title: 'showTickLabel', width: 20, height: 10, showTickLabel: true },
  ],
  [
    [
      [1, 2],
      [2, 3],
      [5, 5],
      [6, 10],
    ],
    { title: 'hideXAxis', width: 20, height: 10, hideXAxis: true },
  ],
  [
    [
      [1, 2],
      [2, 3],
      [5, 5],
      [6, 10],
    ],
    { title: 'hideYAxis', width: 20, height: 10, hideYAxis: true },
  ],
  [
    [
      [-1, 2],
      [1, 2],
      [2, 3],
      [5, 5],
      [6, -2],
    ],
    { title: 'axisCenter', width: 20, height: 10, axisCenter: [0, 0], showTickLabel: true },
  ],
  [
    [
      [-1, 2],
      [1, 2],
      [2, 3],
      [5, 5],
      [6, -2],
    ],
    {
      title: 'lineFormatter',
      width: 20,
      height: 10,
      lineFormatter: (props) => {
        const output = [{ x: props.plotX, y: props.plotY, symbol: '█' }];
        const [minX] = props.toPlotCoordinates(props.minX, props.minY);
        let i = minX;

        while (i <= props.plotX) {
          output.push({ x: i, y: props.plotY, symbol: '█' });
          i += 1;
        }

        return output;
      },
    },
  ],
  [
    [
      [-1, 2],
      [1, 2],
      [2, 3],
      [5, 5],
      [6, -2],
    ],
    {
      title: 'lineFormatter',
      width: 20,
      height: 10,
      lineFormatter: (props) => {
        const output = [{ x: props.plotX, y: props.plotY, symbol: '█' }];
        const [_, maxY] = props.toPlotCoordinates(props.x, props.minY);
        let i = props.plotY;

        while (i <= maxY + 1) {
          output.push({ x: props.plotX, y: i, symbol: '█' });
          i += 1;
        }

        return output;
      },
    },
  ],
  [
    [
      [-1, 2],
      [1, 2],
      [2, 3],
      [5, 5],
      [6, -2],
    ],
    {
      title: 'symbols',
      width: 20,
      height: 10,
      symbols: {
        background: '█',
        border: 'A',
        empty: 'B',
      },
    },
  ],
  [
    [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    { title: 'colors', width: 20, color: 'ansiGreen', height: 10 },
  ],
  [
    [
      [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 1],
      ],
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
      thresholds: [{ x: 2, y: 2, color: 'ansiBlue' }],
      color: ['ansiGreen', 'ansiMagenta'],
      height: 10,
      legend: { position: 'bottom', series: ['first', 'second'] },
    },
  ],
  [
    [
      [1, 1],
      [2, 4],
      [3, 4],
      [4, 2],
      [5, -1],
      [6, 3],
      [7, -1],
      [8, 9],
    ],
    {
      width: 40,
      title: 'thresholds',
      thresholds: [
        {
          y: 5,
          x: 5,
          color: 'ansiBlue',
        },
        {
          y: 2,
          color: 'ansiGreen',
        },
      ],
    },
  ],
  [
    [
      [1, 1],
      [2, 4],
      [3, 4],
      [4, 2],
      [5, -1],
      [6, 3],
      [7, -1],
      [8, 9],
    ],
    {
      width: 40,
      title: 'thresholds',
      symbols: {
        thresholds: {
          x: 'X',
          y: 'Y',
        },
      },
      thresholds: [
        {
          y: 5,
          x: 5,
          color: 'ansiBlue',
        },
        {
          y: 2,
          color: 'ansiGreen',
        },
      ],
    },
  ],
  [
    [
      [
        [1, 2],
        [2, -2],
        [3, 4],
        [4, 1],
      ],
      [
        [1, 6],
        [2, -3],
        [3, 0],
        [4, 0],
      ],
    ],
    {
      width: 40,
      color: ['ansiGreen', 'ansiMagenta', 'ansiBlack', 'ansiYellow'],
      legend: {
        position: 'left',
        series: ['series 1', 'series 2'],
        points: ['point 1', 'point 2', 'point 3'],
        thresholds: ['threshold 1', 'threshold 2'],
      },
      title: 'Points',
      thresholds: [
        {
          y: 5,
          x: 2,
          color: 'ansiBlue',
        },
        {
          y: 2,
          color: 'ansiGreen',
        },
      ],
      points: [
        {
          y: 5,
          x: 5,
          color: 'ansiBlue',
        },
        {
          y: -1,
          x: 1,
          color: 'ansiCyan',
        },
        {
          y: 2,
          x: 2,
          color: 'ansiRed',
        },
      ],
    },
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
    [
      [1, 0],
      [2, 20],
      [3, 29],
    ],
    { height: 10, mode: 'horizontalBar', width: 20, showTickLabel: true },
  ],
  [
    [
      [1, 0],
      [2, 20],
      [3, 29],
    ],
    { height: 10, mode: 'bar', width: 20, showTickLabel: true },
  ],
];

const hasFilter = examples.some(([, { only }]) => only !== undefined);

console.clear();
examples
  .filter((example) => (hasFilter ? example[1].only : true))
  .forEach(([data, options]) => {
    console.log(plot(data, options));
  });
