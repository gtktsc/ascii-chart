import { CandlestickSpec } from '@types';
import { candlestick } from '@services/renderers/candlestick';

import { withExampleTerminal } from './terminal';
import { SnapshotExample } from './types';

const createCandlestickExample = (title: string, spec: CandlestickSpec): SnapshotExample => ({
  group: 'candlestick',
  title,
  render: () => withExampleTerminal(() => candlestick(spec)),
});

/**
 * Examples covering candlestick behavior.
 */
export const candlestickExamples: readonly SnapshotExample[] = [
  createCandlestickExample('rising falling and unchanged candles', {
    width: 28,
    height: 10,
    title: 'OHLC',
    data: [
      [1, 10, 15, 8, 14],
      [2, 14, 16, 9, 11],
      [3, 11, 13, 10, 11],
      [4, 11, 18, 10, 17],
    ],
  }),
  createCandlestickExample('complete custom specification', {
    width: 34,
    height: 12,
    title: 'Custom candles',
    data: [
      [10, 100, 120, 90, 115],
      [20, 115, 125, 95, 102],
      [30, 102, 110, 98, 102],
    ],
    xAxis: {
      domain: [0, 40],
      ticks: [0, 10, 20, 30, 40],
      label: 'day',
      formatter: (value) => `D${value}`,
    },
    yAxis: {
      domain: [80, 130],
      ticks: [80, 100, 120],
      label: 'price',
      formatter: (value) => `$${value}`,
    },
    style: {
      wick: '│',
      rising: { symbol: '░', color: 'ansiGreen' },
      falling: { symbol: '█', color: 'ansiRed' },
      unchanged: { symbol: '─', color: 'ansiYellow' },
    },
    symbols: { border: '│', background: ' ' },
    debugMode: false,
  }),
  createCandlestickExample('filtered domain', {
    width: 20,
    height: 8,
    data: [
      [1, 10, 12, 8, 11],
      [2, 11, 15, 10, 14],
      [3, 14, 16, 12, 13],
    ],
    xAxis: { domain: [2, 3] },
    yAxis: { domain: [10, 16] },
  }),
  createCandlestickExample('single unchanged zero-span candle', {
    width: 16,
    height: 6,
    data: [[1, 5, 5, 5, 5]],
  }),
  createCandlestickExample('unsorted candle input', {
    width: 24,
    height: 8,
    data: [
      [3, 12, 15, 10, 14],
      [1, 10, 13, 8, 12],
      [2, 12, 14, 9, 10],
    ],
  }),
  createCandlestickExample('negative value candles', {
    width: 24,
    height: 9,
    data: [
      [1, -8, -3, -10, -4],
      [2, -4, -2, -9, -7],
      [3, -7, -5, -11, -7],
    ],
    yAxis: { domain: [-12, 0], ticks: [-12, -8, -4, 0] },
  }),
  createCandlestickExample('fractional value candles', {
    width: 28,
    height: 8,
    data: [
      [0.1, 0.001, 0.004, 0.0005, 0.003],
      [0.2, 0.003, 0.0035, 0.001, 0.0015],
      [0.3, 0.0015, 0.0025, 0.001, 0.002],
    ],
    xAxis: { formatter: (value) => value.toFixed(1) },
    yAxis: { formatter: (value) => value.toExponential(1) },
  }),
];

const marketData = [
  [1, 100, 108, 96, 105],
  [2, 105, 111, 101, 103],
  [3, 103, 107, 99, 103],
  [4, 103, 115, 102, 112],
  [5, 112, 114, 104, 106],
  [6, 106, 118, 105, 116],
] as const;

const paletteSpecs: readonly Readonly<{
  title: string;
  style: NonNullable<CandlestickSpec['style']>;
}>[] = [
  {
    title: 'color palette: market green and red',
    style: {
      rising: { color: 'ansiGreen' },
      falling: { color: 'ansiRed' },
      unchanged: { color: 'ansiYellow' },
    },
  },
  {
    title: 'color palette: bright market',
    style: {
      rising: { color: 'ansiBrightGreen' },
      falling: { color: 'ansiBrightRed' },
      unchanged: { color: 'ansiBrightYellow' },
    },
  },
  {
    title: 'color palette: cyan and magenta',
    style: {
      rising: { color: 'ansiCyan' },
      falling: { color: 'ansiMagenta' },
      unchanged: { color: 'ansiWhite' },
    },
  },
  {
    title: 'color palette: blue and yellow',
    style: {
      rising: { color: 'ansiBrightBlue' },
      falling: { color: 'ansiYellow' },
      unchanged: { color: 'ansiBrightWhite' },
    },
  },
  {
    title: 'color palette: monochrome',
    style: {
      rising: { color: 'ansiBrightWhite' },
      falling: { color: 'ansiBrightBlack' },
      unchanged: { color: 'ansiWhite' },
    },
  },
  {
    title: 'color palette: amber and blue',
    style: {
      rising: { color: 'ansiBrightYellow' },
      falling: { color: 'ansiBlue' },
      unchanged: { color: 'ansiCyan' },
    },
  },
];

const thresholdSpecs: readonly Readonly<{ title: string; spec: CandlestickSpec }>[] = [
  {
    title: 'threshold: profit target',
    spec: {
      data: marketData,
      thresholds: [{ id: 'target', name: 'Target 112', y: 112, color: 'ansiBrightGreen' }],
    },
  },
  {
    title: 'threshold: stop loss',
    spec: {
      data: marketData,
      thresholds: [{ id: 'stop', name: 'Stop 100', y: 100, color: 'ansiBrightRed' }],
    },
  },
  {
    title: 'threshold: support and resistance',
    spec: {
      data: marketData,
      thresholds: [
        { id: 'support', name: 'Support', y: 102, color: 'ansiCyan' },
        { id: 'resistance', name: 'Resistance', y: 114, color: 'ansiMagenta' },
      ],
    },
  },
  {
    title: 'threshold: session divider',
    spec: {
      data: marketData,
      thresholds: [{ id: 'session', name: 'New session', x: 3.5, color: 'ansiYellow' }],
    },
  },
  {
    title: 'threshold: price event crosshair',
    spec: {
      data: marketData,
      thresholds: [{ id: 'event', name: 'Price event', x: 4, y: 110, color: 'ansiBrightCyan' }],
    },
  },
  {
    title: 'threshold: custom reference symbols',
    spec: {
      data: marketData,
      thresholds: [{ id: 'reference', name: 'Reference', y: 108, color: 'ansiBrightYellow' }],
      symbols: { thresholds: { x: '=', y: '!' } },
    },
  },
];

const optionSpecs: readonly Readonly<{ title: string; spec: CandlestickSpec }>[] = [
  {
    title: 'option: compact chart',
    spec: { data: marketData, width: 16, height: 6 },
  },
  {
    title: 'option: wide low profile chart',
    spec: { data: marketData, width: 48, height: 7 },
  },
  {
    title: 'option: exact tick counts',
    spec: { data: marketData, xAxis: { ticks: 4 }, yAxis: { ticks: 5 } },
  },
  {
    title: 'option: hidden axes',
    spec: {
      data: marketData,
      width: 20,
      height: 8,
      xAxis: { hidden: true, hideTicks: true },
      yAxis: { hidden: true, hideTicks: true },
    },
  },
  {
    title: 'option: currency axis formatters',
    spec: {
      data: marketData,
      title: 'Daily close',
      xAxis: { label: 'day', formatter: (value) => `D${value}` },
      yAxis: { label: 'USD', formatter: (value) => `$${value}` },
    },
  },
  {
    title: 'option: percentage axis formatter',
    spec: {
      data: [
        [1, 0.2, 0.45, 0.1, 0.4],
        [2, 0.4, 0.6, 0.25, 0.3],
        [3, 0.3, 0.55, 0.2, 0.5],
      ],
      yAxis: { formatter: (value) => `${Math.round(value * 100)}%` },
    },
  },
  {
    title: 'option: hollow candle symbols',
    spec: {
      data: marketData,
      style: {
        rising: { symbol: '□', color: 'ansiGreen' },
        falling: { symbol: '■', color: 'ansiRed' },
        unchanged: { symbol: '═', color: 'ansiYellow' },
      },
    },
  },
  {
    title: 'option: custom wick symbols',
    spec: {
      data: marketData,
      style: {
        wick: '┆',
        rising: { symbol: '▒' },
        falling: { symbol: '▓' },
        unchanged: { symbol: '┄' },
      },
    },
  },
  {
    title: 'option: custom frame and background',
    spec: {
      data: marketData,
      symbols: { border: '#', background: '.', empty: ' ' },
    },
  },
  {
    title: 'option: explicit zoom window',
    spec: {
      data: marketData,
      xAxis: { domain: [2, 5], ticks: [2, 3, 4, 5] },
      yAxis: { domain: [98, 116], ticks: [98, 104, 110, 116] },
    },
  },
  {
    title: 'option: debug bounds',
    spec: { data: marketData, width: 24, height: 9, debugMode: true },
  },
];

/**
 * Examples covering additional candlestick behavior.
 */
export const additionalCandlestickExamples: readonly SnapshotExample[] = [
  ...paletteSpecs.map(({ title, style }) =>
    createCandlestickExample(title, {
      data: marketData,
      width: 30,
      height: 10,
      style,
    }),
  ),
  ...thresholdSpecs.map(({ title, spec }) =>
    createCandlestickExample(title, { width: 30, height: 10, ...spec }),
  ),
  ...optionSpecs.map(({ title, spec }) => createCandlestickExample(title, spec)),
];
