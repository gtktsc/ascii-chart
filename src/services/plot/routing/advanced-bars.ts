import { Coordinates, Settings } from '@types';
import { assertXAxisLabelsFit } from '@services/chart/domain/labels';
import { resolveDomain, resolveTicks } from '@services/chart/domain/ranges';
import { rangeError } from '@services/errors';
import { getBarDataInput, prepareBarSegments } from '@services/plot/bars/preparation';
import { BarMode, BarSeriesInput } from '@services/plot/bars/types';
import { assertAxisCenterInDomains, resolveSettingsAxes } from '@services/plot/layout/axes';
import { resolveColoring } from '@services/plot/rendering/coloring';
import { clipOverlaysToDomains, resolveAxisFormatter } from '@services/plot/rendering/policy';

import type { AdvancedBarSettings, PlotInput } from './types';

const assertOptions = (settings: Settings): BarMode => {
  if (settings.mode !== 'bar' && settings.mode !== 'horizontalBar') {
    rangeError(
      settings.valueLabels ? 'settings.valueLabels' : 'settings.barLayout',
      'requires mode "bar" or "horizontalBar"',
    );
  }
  if ((settings.barLayout ?? 'overlap') !== 'overlap' && settings.fillArea) {
    rangeError('settings.fillArea', 'is not supported with grouped, stacked, or normalized bars');
  }
  if (settings.lineFormatter) {
    rangeError(
      'settings.lineFormatter',
      'is not supported with grouped, stacked, or normalized bars or value labels',
    );
  }
  return settings.mode as BarMode;
};

const getAxisCenter = (settings: Settings, mode: BarMode): Settings['axisCenter'] => {
  return mode === 'bar'
    ? [settings.axisCenter?.[0], settings.axisCenter?.[1] ?? 0]
    : [settings.axisCenter?.[0] ?? 0, settings.axisCenter?.[1]];
};

const getSeries = (series: PlotInput, settings: Settings, mode: BarMode): BarSeriesInput[] => {
  const labels =
    settings.legend?.series === undefined
      ? []
      : Array.isArray(settings.legend.series)
        ? settings.legend.series
        : [settings.legend.series];
  return series.map((data, seriesIndex) => ({
    seriesIndex,
    seriesName: labels[seriesIndex],
    data,
    mode,
    coloring: resolveColoring(settings.coloring, seriesIndex),
    dataPath: series.length === 1 ? 'coordinates' : `coordinates[${seriesIndex}]`,
  }));
};

const assertBaseline = (
  settings: Settings,
  mode: BarMode,
  axisCenter: Settings['axisCenter'],
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
) => {
  assertAxisCenterInDomains(settings.axisCenter, xDomain, yDomain);
  const domain = mode === 'bar' ? yDomain : xDomain;
  const baseline = mode === 'bar' ? axisCenter?.[1] : axisCenter?.[0];
  if (baseline !== undefined && (baseline < domain[0] || baseline > domain[1])) {
    rangeError(
      mode === 'bar' ? 'settings.yAxis.domain' : 'settings.xAxis.domain',
      'must contain the bar baseline',
      'ERR_CHART_OUT_OF_DOMAIN',
    );
  }
};

const getDimensions = (
  settings: Settings,
  mode: BarMode,
  categoryCount: number,
  seriesCount: number,
) => {
  const size = Math.max(1, categoryCount * seriesCount + Math.max(0, categoryCount - 1));
  return {
    width:
      settings.width ?? (settings.barLayout === 'grouped' && mode === 'bar' ? size : undefined),
    height:
      settings.height ??
      (settings.barLayout === 'grouped' && mode === 'horizontalBar' ? size : undefined),
  };
};

/**
 * Resolves one complete internal render request for advanced plot bars.
 * @param {PlotInput} series - Bar series to validate and prepare.
 * @param {Settings} settings - Plot settings, axes, layout, and overlays.
 * @param {Settings['color']} color - Static color configuration for the prepared render.
 * @returns {object | undefined} - Prepared render input and settings, or undefined for an empty domain.
 */
export const prepareAdvancedBarPlot = (
  series: PlotInput,
  settings: Settings,
  color: Settings['color'],
): { input: Coordinates; settings: AdvancedBarSettings } | undefined => {
  const mode = assertOptions(settings);
  const axisCenter = getAxisCenter(settings, mode);
  const prepared = prepareBarSegments(
    getSeries(series, settings, mode),
    settings.barLayout ?? 'overlap',
    axisCenter,
  );
  const { xAxis, yAxis } = resolveSettingsAxes(settings);
  const xDomain = resolveDomain(xAxis, prepared.xValues);
  const yDomain = resolveDomain(yAxis, prepared.yValues);
  if (!xDomain || !yDomain) return undefined;
  assertBaseline(settings, mode, axisCenter, xDomain, yDomain);

  const xTicks = resolveTicks(xAxis, xDomain, prepared.xValues, 'settings.xAxis');
  const yTicks = resolveTicks(yAxis, yDomain, prepared.yValues, 'settings.yAxis');
  const categories = new Set(prepared.segments.map(({ category }) => category)).size;
  const { width, height } = getDimensions(settings, mode, categories, series.length || 1);
  if (xAxis.ticks !== undefined && width !== 'auto' && xAxis.labelCollision === undefined) {
    assertXAxisLabelsFit({
      axis: xAxis,
      ticks: xTicks,
      xDomain,
      yDomain,
      width: width ?? Math.max(1, new Set(prepared.xValues).size),
    });
  }
  const legendInput = series.map((line) =>
    line.flatMap(([x, y]) => (y === null ? [] : [[x, y] as [number, number]])),
  );
  const dataInput = getBarDataInput([], prepared.segments, xDomain, yDomain);
  const overlays = clipOverlaysToDomains(settings.points, settings.thresholds, xDomain, yDomain);

  return {
    input: [[]],
    settings: {
      ...settings,
      ...overlays,
      width,
      height,
      color,
      xRange: xDomain,
      yRange: yDomain,
      customXAxisTicks: xAxis.ticks === undefined ? undefined : xTicks,
      customYAxisTicks: yAxis.ticks === undefined ? undefined : yTicks,
      xLabel: xAxis.label,
      yLabel: yAxis.label,
      hideXAxis: xAxis.hidden,
      hideYAxis: yAxis.hidden,
      hideXAxisTicks: xAxis.hideTicks,
      hideYAxisTicks: yAxis.hideTicks,
      showTickLabel: yAxis.showTickLabel,
      formatter: resolveAxisFormatter(xAxis.formatter, yAxis.formatter, settings.formatter),
      axisCenter,
      barSegments: prepared.segments,
      dataInput,
      legendInput,
    },
  };
};
