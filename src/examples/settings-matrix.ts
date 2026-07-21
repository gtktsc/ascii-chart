import { PlotCoordinates, Renderer, Settings } from '@types';
import { plot } from '@services/plot/plot';

import { forEachRenderer } from './renderers';
import { withExampleTerminal } from './terminal';
import { SnapshotExample } from './types';

const defaultData = [
  [0, -2],
  [1, 1],
  [2, 4],
  [3, 2],
] as const satisfies PlotCoordinates;

const createSettingsExamples = (
  title: string,
  settings: Settings,
  data: PlotCoordinates = defaultData,
): SnapshotExample[] =>
  forEachRenderer((renderer: Renderer) => ({
    group: 'plot',
    title: `${title} [${renderer}]`,
    renderer,
    render: () =>
      withExampleTerminal(() => plot(data, { width: 28, height: 8, ...settings, renderer })),
  }));

/**
 * Examples covering settings matrix behavior.
 */
export const settingsMatrixExamples: readonly SnapshotExample[] = [
  ...createSettingsExamples('formatter helper parameters', {
    formatter: (value, { axis, xRange, yRange }) =>
      `${axis}:${value}:${xRange.length}:${yRange.length}`,
  }),
  ...createSettingsExamples('line formatter helper parameters', {
    lineFormatter: ({
      x,
      y,
      plotX,
      plotY,
      input,
      index,
      minY,
      minX,
      expansionX,
      expansionY,
      toPlotCoordinates,
    }) => {
      const mapped = toPlotCoordinates(x, y);
      const values = [
        x,
        y,
        plotX,
        plotY,
        input.length,
        index,
        minY,
        minX,
        expansionX.length,
        expansionY.length,
        ...mapped,
      ];
      return { x: plotX, y: plotY, symbol: values.every(Number.isFinite) ? '◆' : '◇' };
    },
  }),
  ...createSettingsExamples('coloring context parameters', {
    coloring: {
      type: 'conditional',
      getColor: ({ series, mode, x, y, plotX, plotY }) =>
        (series + mode.length + x + y + plotX + plotY) % 2 === 0
          ? 'ansiBrightCyan'
          : 'ansiBrightMagenta',
    },
  }),
  ...createSettingsExamples(
    'value label context parameters',
    {
      mode: 'bar',
      barLayout: 'grouped',
      color: ['ansiGreen', 'ansiBlue'],
      legend: { series: ['Alpha', 'Beta'] },
      valueLabels: {
        formatter: (value, { seriesIndex, seriesId, seriesName, datumIndex, x, y, mode, layout }) =>
          `${seriesIndex}.${datumIndex}:${String(x)}:${y}:${mode[0]}:${layout[0]}:${seriesId?.[0] ?? '-'}:${seriesName?.[0] ?? '-'}:${value}`,
      },
    },
    [
      [
        [0, 2],
        [1, 4],
      ],
      [
        [0, 3],
        [1, 1],
      ],
    ],
  ),
  ...createSettingsExamples('scalar color setting', { color: 'ansiBrightGreen' }),
  ...createSettingsExamples('array color setting', { color: ['ansiRed', 'ansiBlue'] }, [
    defaultData,
    defaultData.map(([x, y]) => [x, -y] as const),
  ]),
  ...createSettingsExamples('color getter setting', {
    color: (series, coordinates) =>
      series < coordinates.length ? 'ansiBrightYellow' : 'ansiBrightBlack',
  }),
  ...createSettingsExamples('all visibility booleans false', {
    showTickLabel: false,
    hideXAxis: false,
    hideXAxisTicks: false,
    hideYAxis: false,
    hideYAxisTicks: false,
    fillArea: false,
    debugMode: false,
  }),
  ...createSettingsExamples('all visibility booleans true', {
    showTickLabel: true,
    hideXAxis: true,
    hideXAxisTicks: true,
    hideYAxis: true,
    hideYAxisTicks: true,
    fillArea: true,
    debugMode: true,
  }),
  ...createSettingsExamples('x-only axis center', { axisCenter: [2, undefined] }),
  ...createSettingsExamples('y-only axis center', { axisCenter: [undefined, 0] }),
  ...createSettingsExamples(
    'legend string selections',
    {
      legend: { position: 'left', series: 'Series', points: 'Point', thresholds: 'Limit' },
      points: [{ x: 1, y: 1 }],
      thresholds: [{ y: 2 }],
    },
    [defaultData],
  ),
  ...createSettingsExamples(
    'legend array selections',
    {
      legend: {
        position: 'right',
        series: ['First', 'Second'],
        points: ['Low', 'High'],
        thresholds: ['Floor', 'Ceiling'],
      },
      points: [
        { x: 1, y: 1 },
        { x: 2, y: 4 },
      ],
      thresholds: [{ y: 0 }, { y: 3 }],
    },
    [defaultData, defaultData.map(([x, y]) => [x, y / 2] as const)],
  ),
  ...createSettingsExamples('custom tick arrays', {
    customXAxisTicks: [0, 0.5, 1.5, 3],
    customYAxisTicks: [-2, 0, 2, 4],
  }),
  ...createSettingsExamples('partial symbol families', {
    symbols: {
      axis: { n: '↑', e: '→', we: '═', ns: '║' },
      chart: { we: '-', ns: '|', area: '▓' },
      thresholds: { x: '=', y: '!' },
      empty: ' ',
      background: '·',
      border: '#',
      point: '◉',
    },
  }),
  ...createSettingsExamples('fixed width and derived aspect height', {
    width: 36,
    aspectRatio: 3,
  }),
  ...createSettingsExamples('bar value labels disabled', { mode: 'bar', valueLabels: false }, [
    [0, 2],
    [1, 5],
    [2, 3],
  ]),
  ...createSettingsExamples('bar value labels enabled', { mode: 'bar', valueLabels: true }, [
    [0, 2],
    [1, 5],
    [2, 3],
  ]),
  ...createSettingsExamples('structured axes hidden', {
    xAxis: { hidden: true, hideTicks: true },
    yAxis: { hidden: true, hideTicks: true },
  }),
  ...createSettingsExamples('structured axes visible', {
    xAxis: { hidden: false, hideTicks: false, label: 'X', ticks: 4 },
    yAxis: { hidden: false, hideTicks: false, label: 'Y', ticks: 4, showTickLabel: true },
  }),
];
