import {
  ChartAnnotation,
  ChartSpec,
  ChartValueLabels,
  ChartX,
  ValueLabelContext,
  XScale,
} from '@types';
import { rangeError } from '@services/errors';

const getScale = (value: ChartX): XScale =>
  typeof value === 'string' ? 'band' : value instanceof Date ? 'time' : 'linear';

/**
 * Returns data xvalues.
 * @param {ChartSpec<X>} spec - The spec.
 * @returns {X[]} - Computed result.
 */
export const getDataXValues = <X extends ChartX>(spec: ChartSpec<X>): X[] =>
  spec.series.flatMap((series) => series.data.map(([x]) => x));

/**
 * Resolves scale.
 * @param {ChartSpec<X>} spec - The spec.
 * @returns {XScale} - Computed result.
 */
export const resolveScale = <X extends ChartX>(spec: ChartSpec<X>): XScale => {
  if (spec.xAxis?.scale) return spec.xAxis.scale;
  const candidate =
    getDataXValues(spec)[0] ??
    spec.xAxis?.domain?.[0] ??
    (Array.isArray(spec.xAxis?.ticks) ? spec.xAxis.ticks[0] : undefined);
  return candidate === undefined ? 'linear' : getScale(candidate);
};

const normalizeValueLabels = <X extends ChartX>(
  valueLabels: ChartValueLabels<X> | undefined,
  decode: (value: number) => X,
): ChartValueLabels<number> | undefined => {
  if (valueLabels === undefined || typeof valueLabels === 'boolean') return valueLabels;
  if (!valueLabels.formatter) return { color: valueLabels.color };
  const formatter = valueLabels.formatter;
  return {
    color: valueLabels.color,
    formatter: (value, context) =>
      formatter(value, {
        ...context,
        x: decode(context.x),
      } as ValueLabelContext<X>),
  };
};

/**
 * Normalizes spec.
 * @param {ChartSpec<X>} spec - The spec.
 * @param {(value: X) => number} encode - The encode.
 * @param {(value: number) => X} decode - The decode.
 * @param {ChartSpec<number>['xAxis']} xAxis - The x axis.
 * @param {boolean} bandSpan - The band span.
 * @returns {ChartSpec<number>} - Computed result.
 */
export const normalizeSpec = <X extends ChartX>(
  spec: ChartSpec<X>,
  encode: (value: X) => number,
  decode: (value: number) => X,
  xAxis: ChartSpec<number>['xAxis'],
  bandSpan = false,
): ChartSpec<number> => ({
  ...spec,
  series: spec.series.map((series) => ({
    ...series,
    data: series.data.map(([x, y]) => [encode(x), y] as const),
  })),
  xAxis,
  points: spec.points?.map((point) => ({ ...point, x: encode(point.x) })),
  thresholds: spec.thresholds?.map((threshold) => ({
    ...threshold,
    x: threshold.x === undefined ? undefined : encode(threshold.x),
  })),
  annotations: spec.annotations?.map((annotation, index): ChartAnnotation<number> => {
    if (annotation.type === 'span') {
      if (annotation.axis === 'y') return annotation;
      const from = encode(annotation.from);
      const to = encode(annotation.to);
      if (bandSpan && from > to) {
        rangeError(`annotations[${index}].to`, 'must not precede from');
      }
      return {
        ...annotation,
        from: bandSpan ? from - 0.5 : from,
        to: bandSpan ? to + 0.5 : to,
      };
    }
    if (annotation.type === 'text') return { ...annotation, x: encode(annotation.x) };
    if (annotation.type === 'arrow') {
      return {
        ...annotation,
        from: [encode(annotation.from[0]), annotation.from[1]],
        to: [encode(annotation.to[0]), annotation.to[1]],
      };
    }
    return { ...annotation, x: encode(annotation.x) };
  }),
  valueLabels: normalizeValueLabels(spec.valueLabels, decode),
});
