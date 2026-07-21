import { Settings, XAxis, YAxis } from '@types';
import { rangeError } from '@services/errors';

/**
 * Resolves structured x-axis fields over flat option aliases.
 * @param {Settings} [settings] - Plot settings.
 * @returns {XAxis} - Normalized x-axis settings.
 */
export const resolveXAxisSettings = (settings?: Settings): XAxis => {
  const source = settings ?? {};
  const axis = source.xAxis ?? {};
  return {
    domain: axis.domain,
    ticks: axis.ticks ?? source.customXAxisTicks,
    label: axis.label ?? source.xLabel,
    formatter: axis.formatter,
    hidden: axis.hidden ?? source.hideXAxis,
    hideTicks: axis.hideTicks ?? source.hideXAxisTicks,
    labelCollision: axis.labelCollision,
    color: axis.color,
  };
};

/**
 * Resolves structured y-axis fields over flat option aliases.
 * @param {Settings} [settings] - Plot settings.
 * @returns {YAxis} - Normalized y-axis settings.
 */
export const resolveYAxisSettings = (settings?: Settings): YAxis => {
  const source = settings ?? {};
  const axis = source.yAxis ?? {};
  return {
    domain: axis.domain ?? source.yRange,
    ticks: axis.ticks ?? source.customYAxisTicks,
    label: axis.label ?? source.yLabel,
    formatter: axis.formatter,
    hidden: axis.hidden ?? source.hideYAxis,
    hideTicks: axis.hideTicks ?? source.hideYAxisTicks,
    showTickLabel: axis.showTickLabel ?? source.showTickLabel,
    color: axis.color,
  };
};

/**
 * Resolves both plot axes.
 * @param {Settings} [settings] - Plot settings.
 * @returns {object} - Normalized axis pair.
 */
export const resolveSettingsAxes = (settings?: Settings) => ({
  xAxis: resolveXAxisSettings(settings),
  yAxis: resolveYAxisSettings(settings),
});

/**
 * Validates an axis center against resolved domains.
 * @param {Settings['axisCenter']} axisCenter - Optional configured axis center.
 * @param {readonly [number, number]} xDomain - Resolved x domain.
 * @param {readonly [number, number]} yDomain - Resolved y domain.
 */
export const assertAxisCenterInDomains = (
  axisCenter: Settings['axisCenter'],
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
) => {
  axisCenter?.forEach((coordinate, index) => {
    if (coordinate === undefined) return;
    const domain = index === 0 ? xDomain : yDomain;
    if (coordinate < domain[0] || coordinate > domain[1]) {
      rangeError(
        `settings.axisCenter[${index}]`,
        'must fall within the resolved domain',
        'ERR_CHART_OUT_OF_DOMAIN',
      );
    }
  });
};
