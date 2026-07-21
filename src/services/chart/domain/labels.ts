import { ChartAxis, Formatter } from '@types';
import { defaultFormatter } from '@helpers/formatting';
import { assertDisplayValue, displayWidth } from '@helpers/terminal-text';
import { rangeError } from '@services/errors';

/**
 * Validates xaxis labels fit and throws when it is invalid.
 * @param {object} options - Structured options.
 * @param {ChartAxis | undefined} options.axis - The axis.
 * @param {number[]} options.ticks - The ticks.
 * @param {readonly [number, number]} options.xDomain - The x domain.
 * @param {readonly [number, number]} options.yDomain - The y domain.
 * @param {number} options.width - The width.
 */
export const assertXAxisLabelsFit = ({
  axis,
  ticks,
  xDomain,
  yDomain,
  width,
}: {
  axis: ChartAxis | undefined;
  ticks: number[];
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  width: number;
}): void => {
  if (axis?.ticks === undefined || ticks.length < 2) return;
  const formatter: Formatter = axis.formatter ?? defaultFormatter;
  const labelLengths = ticks.map((tick) => {
    const value = assertDisplayValue(
      formatter(tick, { axis: 'x', xRange: [...xDomain], yRange: [...yDomain] }),
      'xAxis.formatter.result',
    );
    return displayWidth(value);
  });
  const span = xDomain[1] - xDomain[0];
  const positions = ticks.map((tick) => (span === 0 ? 0 : ((tick - xDomain[0]) / span) * width));
  for (let index = 1; index < positions.length; index++) {
    const requiredSpace = Math.ceil((labelLengths[index - 1] + labelLengths[index]) / 2);
    if (positions[index] - positions[index - 1] < requiredSpace) {
      rangeError(
        'xAxis.ticks',
        'formatted labels do not fit; increase width or reduce ticks',
        'ERR_CHART_LAYOUT',
      );
    }
  }
};
