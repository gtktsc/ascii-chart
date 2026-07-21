import { ChartSpec, ChartX, RenderChart } from '@types';
import { getBarDataInput } from '@services/plot/bars/preparation';
import { renderPlot } from '@services/plot/plot';
import { clipOverlaysToDomains, resolveAxisFormatter } from '@services/plot/rendering/policy';

import { prepareStructuredBars } from './bars/structured';
import { getSecondaryYAxisSettings, resolveChartAxes } from './rendering/axes';
import { resolveLegendSettings } from './rendering/selection';
import { getCustomXAxisTicks, getSeriesInput } from './rendering/series';
import { validateChartSpec } from './validation/input';
import { normalizeChartX } from './x-axis/normalize';

/**
 * Renders chart.
 * @param {ChartSpec<X>} rawSpec - The raw spec.
 * @returns {string} - Computed result.
 */
export const renderChart: RenderChart = <X extends ChartX>(rawSpec: ChartSpec<X>) => {
  validateChartSpec(rawSpec);
  const normalized = normalizeChartX(rawSpec);
  const spec = normalized.spec;

  const bars = prepareStructuredBars(spec);
  const axes = resolveChartAxes(spec, bars, normalized.hasConfiguredTicks);
  if (!axes) return '';
  const xAxis = spec.xAxis ?? {};
  const yAxis = spec.yAxis ?? {};
  const { xDomain, yDomain, secondaryYDomain, width, height, xTicks, yTicks, secondaryYTicks } =
    axes;

  const { input, axisInput, seriesSettings } = getSeriesInput(
    spec,
    bars.advanced,
    xDomain,
    yDomain,
    secondaryYDomain,
  );
  const formatter = resolveAxisFormatter(xAxis.formatter, yAxis.formatter);
  const overlays = clipOverlaysToDomains(spec.points, spec.thresholds, xDomain, yDomain);
  const points = (overlays.points ?? []).map(({ x, y, color }) => ({ x, y, color }));
  const thresholds = (overlays.thresholds ?? []).map(({ x, y, color }) => ({ x, y, color }));
  const dataInput = getBarDataInput(axisInput, bars.prepared.segments, xDomain, yDomain);
  const legend = resolveLegendSettings(spec);

  return renderPlot(input, {
    width,
    height,
    aspectRatio: spec.aspectRatio,
    renderer: spec.renderer,
    xRange: xDomain,
    yRange: yDomain,
    customXAxisTicks: getCustomXAxisTicks(xTicks, xAxis.ticks, normalized.usesNativeTicks),
    customYAxisTicks: yAxis.ticks === undefined ? undefined : yTicks,
    hideXAxis: xAxis.hidden,
    hideYAxis: yAxis.hidden,
    hideXAxisTicks: xAxis.hideTicks,
    hideYAxisTicks: yAxis.hideTicks,
    showTickLabel: yAxis.showTickLabel,
    xLabel: xAxis.label,
    yLabel: yAxis.label,
    title: spec.title,
    titleColor: spec.titleColor,
    borderColor: spec.borderColor,
    backgroundColor: spec.backgroundColor,
    axisCenter: bars.axisCenter,
    points,
    thresholds,
    annotations: spec.annotations,
    symbols: spec.symbols,
    debugMode: spec.debugMode,
    formatter,
    xAxis,
    yAxis,
    xTickPath: 'xAxis.ticks',
    seriesSettings,
    axisInput: dataInput,
    barSegments: bars.prepared.segments,
    dataInput: bars.advanced ? dataInput : undefined,
    barFormatterPath: 'valueLabels.formatter.result',
    barLayoutPath: 'barLayout',
    barLayout: bars.layout,
    valueLabels: spec.valueLabels,
    secondaryYAxis: getSecondaryYAxisSettings(
      spec.secondaryYAxis,
      secondaryYDomain,
      secondaryYTicks,
    ),
    ...legend,
  });
};
