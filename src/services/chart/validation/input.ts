import { XScale } from '@types';
import { LEGEND_POSITIONS } from '@constants/validation';
import { validateAnnotations } from '@services/chart/annotations/validate';
import { rangeError, typeError } from '@services/errors';

import { assertAxis, assertXAxis } from './axes';
import { assertBarOptions, assertSelector, isGraphMode } from './options';
import {
  assertChartX,
  assertColor,
  assertFiniteNumber,
  assertOptionalBoolean,
  assertOptionalString,
  assertRecord,
  assertUniqueIds,
  mergeXScale,
} from './primitives';
import { assertColoring, assertInterpolation, assertOverflow, assertRenderer } from './styles';
import { assertSymbols } from './symbols';

import type { ChartValidationState, ValidateChartSpec } from './types';

const addXValue = (state: ChartValidationState, entry: unknown, path: string): void => {
  state.xScale = mergeXScale(state.xScale, assertChartX(entry, path), path);
};

const validateSeriesData = (
  value: unknown,
  seriesIndex: number,
  state: ChartValidationState,
): void => {
  if (!Array.isArray(value)) typeError(`series[${seriesIndex}].data`, 'must be an array');
  (value as unknown[]).forEach((datum, datumIndex) => {
    const path = `series[${seriesIndex}].data[${datumIndex}]`;
    if (!Array.isArray(datum) || datum.length !== 2) {
      typeError(path, 'must contain exactly x and y');
    }
    const values = datum as unknown[];
    addXValue(state, values[0], `${path}[0]`);
    if (values[1] !== null) assertFiniteNumber(values[1], `${path}[1]`);
  });
};

const validateSeriesAxes = (series: Record<string, unknown>, path: string): void => {
  if (series.yAxis !== undefined && series.yAxis !== 'primary' && series.yAxis !== 'secondary') {
    rangeError(`${path}.yAxis`, `unsupported Y-axis "${String(series.yAxis)}"`);
  }
  if (series.yAxis === 'secondary' && (series.mode === 'bar' || series.mode === 'horizontalBar')) {
    rangeError(`${path}.yAxis`, 'is not supported for bar series');
  }
};

const validateSeriesStyle = (series: Record<string, unknown>, path: string): void => {
  assertInterpolation(series.interpolation, `${path}.interpolation`);
  assertColor(series.color, `${path}.color`);
  if (series.coloring !== undefined) assertColoring(series.coloring, `${path}.coloring`);
  assertOptionalBoolean(series.fillArea, `${path}.fillArea`);
  if (series.lineFormatter !== undefined && typeof series.lineFormatter !== 'function') {
    typeError(`${path}.lineFormatter`, 'must be a function');
  }
};

const validateSeries = (value: unknown, state: ChartValidationState): Set<string> => {
  if (!Array.isArray(value)) typeError('series', 'must be an array');
  const seriesIds = assertUniqueIds(value, 'series');
  (value as unknown[]).forEach((item, seriesIndex) => {
    const series = item as Record<string, unknown>;
    const path = `series[${seriesIndex}]`;
    validateSeriesData(series.data, seriesIndex, state);
    assertOptionalString(series.name, `${path}.name`);
    if (series.mode !== undefined && !isGraphMode(series.mode)) {
      rangeError(`${path}.mode`, `unsupported mode "${String(series.mode)}"`);
    }
    validateSeriesAxes(series, path);
    validateSeriesStyle(series, path);
  });
  return seriesIds;
};

const validateDimensions = (spec: Record<string, unknown>): void => {
  if (spec.width !== undefined && spec.width !== 'auto') {
    const width = assertFiniteNumber(spec.width, 'width');
    if (!Number.isInteger(width) || width < 1) rangeError('width', 'must be a positive integer');
  }
  if (spec.height !== undefined) {
    const height = assertFiniteNumber(spec.height, 'height');
    if (!Number.isInteger(height) || height < 1) rangeError('height', 'must be a positive integer');
  }
  if (spec.aspectRatio !== undefined) {
    const aspectRatio = assertFiniteNumber(spec.aspectRatio, 'aspectRatio');
    if (aspectRatio <= 0) rangeError('aspectRatio', 'must be greater than zero');
  }
};

const validatePresentation = (spec: Record<string, unknown>): void => {
  assertOptionalString(spec.title, 'title');
  assertColor(spec.titleColor, 'titleColor');
  assertColor(spec.borderColor, 'borderColor');
  assertColor(spec.backgroundColor, 'backgroundColor');
  assertOverflow(spec.overflow, 'overflow');
  assertRenderer(spec.renderer, 'renderer');
  assertOptionalBoolean(spec.debugMode, 'debugMode');
};

const validatePoints = (value: unknown, state: ChartValidationState): Set<string> => {
  const pointIds = assertUniqueIds(value, 'points');
  (value as unknown[] | undefined)?.forEach((item, index) => {
    const point = item as Record<string, unknown>;
    addXValue(state, point.x, `points[${index}].x`);
    assertFiniteNumber(point.y, `points[${index}].y`);
    assertColor(point.color, `points[${index}].color`);
  });
  return pointIds;
};

const validateThresholds = (value: unknown, state: ChartValidationState): Set<string> => {
  const thresholdIds = assertUniqueIds(value, 'thresholds');
  (value as unknown[] | undefined)?.forEach((item, index) => {
    const threshold = item as Record<string, unknown>;
    if (threshold.x === undefined && threshold.y === undefined) {
      typeError(`thresholds[${index}]`, 'must define x, y, or both');
    }
    if (threshold.x !== undefined) addXValue(state, threshold.x, `thresholds[${index}].x`);
    if (threshold.y !== undefined) assertFiniteNumber(threshold.y, `thresholds[${index}].y`);
    assertColor(threshold.color, `thresholds[${index}].color`);
  });
  return thresholdIds;
};

const validateLegend = (
  value: unknown,
  seriesIds: Set<string>,
  pointIds: Set<string>,
  thresholdIds: Set<string>,
): void => {
  if (value === undefined) return;
  const legend = assertRecord(value, 'legend');
  if (!LEGEND_POSITIONS.has(legend.position as string)) {
    rangeError('legend.position', `unsupported position "${String(legend.position)}"`);
  }
  assertSelector(legend.series, seriesIds, 'legend.series');
  assertSelector(legend.points, pointIds, 'legend.points');
  assertSelector(legend.thresholds, thresholdIds, 'legend.thresholds');
  assertColor(legend.color, 'legend.color');
};

const hasSecondaryYAxis = (spec: Record<string, unknown>): boolean =>
  spec.secondaryYAxis !== undefined ||
  (spec.series as Record<string, unknown>[]).some((series) => series.yAxis === 'secondary');

const validateAxisCenter = (spec: Record<string, unknown>, xScale: XScale | undefined): void => {
  if (spec.axisCenter === undefined) return;
  if (!Array.isArray(spec.axisCenter) || spec.axisCenter.length !== 2) {
    typeError('axisCenter', 'must contain x and y');
  }
  const axisCenter = spec.axisCenter as unknown[];
  axisCenter.forEach((coordinate, index) => {
    if (coordinate !== undefined) assertFiniteNumber(coordinate, `axisCenter[${index}]`);
  });
  if (xScale !== undefined && xScale !== 'linear' && axisCenter[0] !== undefined) {
    rangeError('axisCenter[0]', 'is only supported with a linear X scale');
  }
  if (hasSecondaryYAxis(spec)) {
    rangeError('axisCenter', 'is not supported with a secondary Y-axis');
  }
};

const validateHorizontalBars = (
  spec: Record<string, unknown>,
  xScale: XScale | undefined,
): void => {
  if (xScale === undefined || xScale === 'linear') return;
  (spec.series as Record<string, unknown>[]).forEach((series, index) => {
    if (series.mode === 'horizontalBar') {
      rangeError(`series[${index}].mode`, 'requires a linear X scale');
    }
  });
};

/**
 * Validates all runtime input crossing the structured chart boundary.
 * @param {unknown} value - Unknown value supplied to renderChart.
 * @returns {void} - Nothing.
 */
export const validateChartSpec: ValidateChartSpec = (value) => {
  const spec = assertRecord(value, 'spec');
  const state: ChartValidationState = { xScale: undefined };
  const seriesIds = validateSeries(spec.series, state);
  validateDimensions(spec);
  validatePresentation(spec);
  assertBarOptions(spec);
  assertAxis(spec.yAxis, 'yAxis');
  assertAxis(spec.secondaryYAxis, 'secondaryYAxis');
  const pointIds = validatePoints(spec.points, state);
  const thresholdIds = validateThresholds(spec.thresholds, state);
  const categoricalXErrorPaths = validateAnnotations(spec.annotations, (entry, path) =>
    addXValue(state, entry, path),
  );
  state.xScale = assertXAxis(spec.xAxis, 'xAxis', state.xScale);
  if (state.xScale === 'band' && categoricalXErrorPaths.length > 0) {
    rangeError(categoricalXErrorPaths[0], 'is not supported with a band X scale');
  }
  validateLegend(spec.legend, seriesIds, pointIds, thresholdIds);
  validateAxisCenter(spec, state.xScale);
  validateHorizontalBars(spec, state.xScale);
  assertSymbols(spec.symbols, 'symbols');
};
