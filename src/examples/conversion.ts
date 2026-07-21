import {
  ChartSpec,
  Color,
  Coloring,
  Coordinates,
  Formatter,
  MultiLine,
  Settings,
  SingleLine,
} from '@types';
import { defaultFormatter } from '@helpers/formatting';
import { prepareBarSegments } from '@services/plot/bars/preparation';
import { getChartSize } from '@services/plot/defaults';

import type { Example, ExampleSettings } from './types';

export type { Example, ExampleSettings } from './types';

const toLabels = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const toMultiLine = (data: Coordinates): MultiLine =>
  typeof data[0]?.[0] === 'number' ? [data as SingleLine] : (data as MultiLine);

const resolveExampleDomain = (values: number[]): [number, number] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? [min, min + 1] : [min, max];
};

const getAdvancedBarValues = (input: MultiLine, settings: ExampleSettings) => {
  const advanced =
    (settings.mode === 'bar' || settings.mode === 'horizontalBar') &&
    ((settings.barLayout ?? 'overlap') !== 'overlap' || Boolean(settings.valueLabels));
  if (!advanced) return undefined;
  const axisCenter =
    settings.mode === 'bar'
      ? ([settings.axisCenter?.[0], settings.axisCenter?.[1] ?? 0] as Settings['axisCenter'])
      : ([settings.axisCenter?.[0] ?? 0, settings.axisCenter?.[1]] as Settings['axisCenter']);
  return prepareBarSegments(
    input.map((data, seriesIndex) => ({
      seriesIndex,
      data,
      mode: settings.mode as 'bar' | 'horizontalBar',
    })),
    settings.barLayout ?? 'overlap',
    axisCenter,
  );
};

/**
 * Converts input to chart spec.
 * @param {Coordinates} data - The data.
 * @param {ExampleSettings} settings - The settings.
 * @returns {ChartSpec} - Computed result.
 */
export const toChartSpec = (data: Coordinates, settings: ExampleSettings): ChartSpec => {
  const input = toMultiLine(data);
  const filteredInput = settings.yRange
    ? input.map((line) =>
        line.filter(([, y]) => y >= settings.yRange![0] && y <= settings.yRange![1]),
      )
    : input;
  const seriesLabels = toLabels(settings.legend?.series);
  const pointLabels = toLabels(settings.legend?.points);
  const thresholdLabels = toLabels(settings.legend?.thresholds);
  const size = getChartSize({
    input: filteredInput,
    width: typeof settings.width === 'number' ? settings.width : undefined,
    height: settings.height,
    yRange: settings.yRange,
    axisCenter: settings.axisCenter,
  });
  const advancedBars = getAdvancedBarValues(filteredInput, settings);
  const xValues = advancedBars?.xValues ?? size.expansionX;
  const yValues = advancedBars?.yValues ?? size.expansionY;
  const xDomain = Number.isFinite(xValues[0])
    ? resolveExampleDomain(xValues)
    : ([0, 1] as [number, number]);
  const yDomain = settings.yRange ?? resolveExampleDomain(yValues);
  const hasXValues = filteredInput.some((line) => line.length > 0);
  const xFormatter: Formatter | undefined = hasXValues
    ? settings.formatter
    : (_value, helpers) =>
        settings.formatter
          ? settings.formatter(Number.POSITIVE_INFINITY, helpers)
          : defaultFormatter(Number.POSITIVE_INFINITY, helpers);
  const xTicks = settings.customXAxisTicks?.filter(
    (tick) => tick >= xDomain[0] && tick <= xDomain[1],
  );
  const yTicks = settings.customYAxisTicks?.filter(
    (tick) => tick >= yDomain[0] && tick <= yDomain[1],
  );
  const seriesIds = input.map((_, index) => `series-${index + 1}`);
  const pointIds = (settings.points ?? []).map((_, index) => `point-${index + 1}`);
  const thresholdIds = (settings.thresholds ?? []).map((_, index) => `threshold-${index + 1}`);
  const getSeriesColor = (index: number): Color | undefined => {
    if (typeof settings.color === 'function') return settings.color(index, input);
    if (Array.isArray(settings.color)) return settings.color[index];
    return settings.color;
  };
  const getSeriesColoring = (index: number): Coloring | undefined =>
    Array.isArray(settings.coloring)
      ? settings.coloring[index]
      : (settings.coloring as Coloring | undefined);

  return {
    series: input.map((line, index) => ({
      id: seriesIds[index],
      name: seriesLabels[index] ?? seriesIds[index],
      data: line,
      mode: settings.mode,
      interpolation: settings.interpolation,
      color: getSeriesColor(index),
      coloring: getSeriesColoring(index),
      fillArea: settings.fillArea,
      lineFormatter: settings.lineFormatter,
    })),
    width: size.plotWidth,
    height: size.plotHeight,
    renderer: settings.renderer,
    title: settings.title,
    xAxis: {
      domain: settings.xAxis?.domain ?? xDomain,
      ticks: xTicks,
      label: settings.xLabel,
      formatter: xFormatter,
      hidden: settings.hideXAxis,
      hideTicks: settings.hideXAxisTicks,
    },
    yAxis: {
      domain: settings.yAxis?.domain ?? settings.yRange ?? yDomain,
      ticks: yTicks,
      label: settings.yLabel,
      formatter: settings.formatter,
      hidden: settings.hideYAxis,
      hideTicks: settings.hideYAxisTicks,
      showTickLabel: settings.showTickLabel,
    },
    legend: settings.legend
      ? {
          position: settings.legend.position ?? 'bottom',
          series: settings.legend.series ? seriesIds.slice(0, seriesLabels.length) : false,
          points: settings.legend.points ? pointIds.slice(0, pointLabels.length) : false,
          thresholds: settings.legend.thresholds
            ? thresholdIds.slice(0, thresholdLabels.length)
            : false,
        }
      : undefined,
    axisCenter: settings.axisCenter,
    points: settings.points?.map((point, index) => ({
      ...point,
      id: pointIds[index],
      name: pointLabels[index] ?? pointIds[index],
    })),
    thresholds: settings.thresholds?.map((threshold, index) => ({
      ...threshold,
      id: thresholdIds[index],
      name: thresholdLabels[index] ?? thresholdIds[index],
    })),
    symbols: settings.symbols,
    debugMode: settings.debugMode,
    barLayout: settings.barLayout,
    valueLabels: settings.valueLabels,
  };
};

/**
 * Creates a legacy example tuple and its matching structured chart specification.
 * @param {Coordinates} data - The data.
 * @param {ExampleSettings} settings - The settings.
 * @returns {Example} - Computed result.
 */
export const create = (data: Coordinates, settings: ExampleSettings): Example => [
  data,
  settings,
  toChartSpec(data, settings),
];
