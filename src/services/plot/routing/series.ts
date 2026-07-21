import { MultiLine, Overflow, Plot, Settings } from '@types';
import { segmentSeries } from '@services/chart/domain/clipping';
import { assertXAxisLabelsFit } from '@services/chart/domain/labels';
import { resolveDomain, resolveTicks } from '@services/chart/domain/ranges';
import { assertAxisCenterInDomains, resolveSettingsAxes } from '@services/plot/layout/axes';
import { clipOverlaysToDomains, resolveAxisFormatter } from '@services/plot/rendering/policy';

import type { PlotInput, RoutedPlot } from './types';

/**
 * Normalizes the legacy plot coordinate union into a series collection.
 * @param {Parameters<Plot>[0]} coordinates - Single-series or multi-series coordinates.
 * @returns {PlotInput} - Normalized series collection.
 */
export const getPlotSeries = (coordinates: Parameters<Plot>[0]): PlotInput => {
  const raw = coordinates as readonly (readonly [number, number | null])[];
  const coordinateValues = coordinates as unknown[];
  const first = coordinateValues[0] as unknown[] | undefined;
  return raw.length === 0
    ? []
    : Array.isArray(first) && (first.length === 0 || Array.isArray(first[0]))
      ? (coordinates as PlotInput)
      : [raw];
};

const collectSegments = (
  series: PlotInput,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
  overflow: Overflow | undefined,
) => {
  const input: MultiLine = [];
  const seriesIndexes: number[] = [];
  const legendInput: MultiLine = series.map(() => []);
  series.forEach((line, seriesIndex) => {
    segmentSeries(line, xDomain, yDomain, overflow).forEach((segment) => {
      input.push(segment);
      seriesIndexes.push(seriesIndex);
      legendInput[seriesIndex].push(...segment);
    });
  });
  if (input.length === 0) {
    input.push([]);
    seriesIndexes.push(0);
  }
  return { input, seriesIndexes, legendInput };
};

/**
 * Prepares a missing-value or y-range plot for the shared renderer.
 * @param {PlotInput} series - Normalized plot series.
 * @param {Settings | undefined} settings - Legacy plot settings.
 * @param {Settings['color']} color - Validated color settings.
 * @returns {RoutedPlot} - Routed input and internal render settings.
 */
export const prepareSegmentedPlot = (
  series: PlotInput,
  settings: Settings | undefined,
  color: Settings['color'],
): RoutedPlot => {
  const source: Settings = { ...settings };
  const xValues = series.flatMap((line) => line.map(([x]) => x));
  const valuesInsideYRange = series.flatMap((line) =>
    line.flatMap(([x, y]) =>
      y !== null && (!source.yRange || (y >= source.yRange[0] && y <= source.yRange[1]))
        ? [[x, y] as [number, number]]
        : [],
    ),
  );
  const filteredXValues = valuesInsideYRange.map(([x]) => x);
  const filteredYValues = valuesInsideYRange.map(([, y]) => y);
  const xDomain = resolveDomain(
    undefined,
    source.overflow === 'clip' ? xValues : filteredXValues.length ? filteredXValues : xValues,
  );
  const yDomain = source.yRange ?? resolveDomain(undefined, filteredYValues);
  if (!xDomain || !yDomain) return { input: [[]], settings: { ...settings, color } };

  const overflow = (source.mode ?? 'line') === 'line' ? source.overflow : 'discard';
  const { input, seriesIndexes, legendInput } = collectSegments(series, xDomain, yDomain, overflow);
  const isInsideY = (value: number) => value >= yDomain[0] && value <= yDomain[1];
  return {
    input,
    settings: {
      ...settings,
      color,
      seriesIndexes,
      legendInput,
      points: source.points?.filter(({ y }) => isInsideY(y)),
      thresholds: source.thresholds?.filter(({ y }) => y === undefined || isInsideY(y)),
    },
  };
};

/**
 * Prepares an axis-configured legacy plot for the shared renderer.
 * @param {PlotInput} series - Normalized plot series.
 * @param {Settings | undefined} settings - Legacy plot settings.
 * @param {Settings['color']} color - Validated color settings.
 * @returns {RoutedPlot | undefined} - Routed input and internal render settings, or undefined without domains.
 */
export const prepareAxisPlot = (
  series: PlotInput,
  settings: Settings | undefined,
  color: Settings['color'],
): RoutedPlot | undefined => {
  const source: Settings = { ...settings };
  const xValues = series.flatMap((line) => line.map(([x]) => x));
  const yValues = series.flatMap((line) => line.flatMap(([, y]) => (y === null ? [] : [y])));
  const { xAxis, yAxis } = resolveSettingsAxes(source);
  const xDomain = resolveDomain(xAxis, xValues);
  const yDomain = resolveDomain(yAxis, yValues);
  if (!xDomain || !yDomain) return undefined;

  const xTicks = resolveTicks(xAxis, xDomain, xValues, 'settings.xAxis');
  const yTicks = resolveTicks(yAxis, yDomain, yValues, 'settings.yAxis');
  if (xAxis.ticks !== undefined && source.width !== 'auto' && xAxis.labelCollision === undefined) {
    assertXAxisLabelsFit({
      axis: xAxis,
      ticks: xTicks,
      xDomain,
      yDomain,
      width: typeof source.width === 'number' ? source.width : Math.max(1, new Set(xValues).size),
    });
  }

  assertAxisCenterInDomains(source.axisCenter, xDomain, yDomain);

  const overflow = (source.mode ?? 'line') === 'line' ? source.overflow : 'discard';
  const { input, seriesIndexes, legendInput } = collectSegments(series, xDomain, yDomain, overflow);
  const formatter = resolveAxisFormatter(xAxis.formatter, yAxis.formatter, source.formatter);
  const { points, thresholds } = clipOverlaysToDomains(
    source.points,
    source.thresholds,
    xDomain,
    yDomain,
  );

  return {
    input,
    settings: {
      ...settings,
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
      formatter,
      seriesIndexes,
      legendInput,
      points,
      thresholds,
    },
  };
};
