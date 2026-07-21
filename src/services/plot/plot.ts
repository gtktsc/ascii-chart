import { Coordinates, MultiLine, Plot, Settings } from '@types';
import { ANSI_COLORS } from '@constants/ansi';
import { rangeError, typeError } from '@services/errors';

import { renderPlot } from './render';
import { prepareAdvancedBarPlot } from './routing/advanced-bars';
import { getPlotSeries, prepareAxisPlot, prepareSegmentedPlot } from './routing/series';
import { validateCoordinates, validatePlotSettings } from './validation';

export { renderPlot };

const getValidatedColor = (settings?: Settings): Settings['color'] => {
  const colorGetter = typeof settings?.color === 'function' ? settings.color : undefined;
  if (!colorGetter) return settings?.color;
  return (seriesIndex: number, input: MultiLine) => {
    const result = colorGetter(seriesIndex, input);
    if (typeof result !== 'string') {
      typeError('settings.color.result', 'must be a color');
    }
    if (!(result in ANSI_COLORS)) {
      rangeError('settings.color.result', `unsupported color "${String(result)}"`);
    }
    return result;
  };
};

const hasAdvancedBarSettings = (settings: Settings): boolean =>
  (settings.barLayout ?? 'overlap') !== 'overlap' || Boolean(settings.valueLabels);

const hasConfiguredAxes = (settings: Settings | undefined): boolean =>
  Boolean(settings?.xAxis || settings?.yAxis);

const canRenderDirectly = (settings: Settings | undefined, hasMissingValues: boolean): boolean =>
  !hasConfiguredAxes(settings) && !hasMissingValues && !settings?.yRange;

/**
 * Renders legacy coordinate input as a terminal chart.
 * @param {PlotCoordinates} coordinates - The coordinates.
 * @param {Settings | undefined} settings - The settings.
 * @returns {string} - Computed result.
 */
export const plot: Plot = (coordinates, settings) => {
  validateCoordinates(coordinates);
  validatePlotSettings(settings);
  const color = getValidatedColor(settings);
  const series = getPlotSeries(coordinates);
  if (settings && hasAdvancedBarSettings(settings)) {
    const advanced = prepareAdvancedBarPlot(series, settings, color);
    return advanced ? renderPlot(advanced.input, advanced.settings) : '';
  }

  const hasMissingValues = series.some((line) => line.some(([, y]) => y === null));
  if (canRenderDirectly(settings, hasMissingValues)) {
    return renderPlot(coordinates as Coordinates, { ...settings, color });
  }
  if (hasConfiguredAxes(settings)) {
    const routed = prepareAxisPlot(series, settings, color);
    return routed ? renderPlot(routed.input, routed.settings) : '';
  }
  const routed = prepareSegmentedPlot(series, settings, color);
  return renderPlot(routed.input, routed.settings);
};

export default plot;
