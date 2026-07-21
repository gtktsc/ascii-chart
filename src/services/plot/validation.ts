import { LEGEND_POSITIONS } from '@constants/validation';
import { assertDisplayText } from '@helpers/terminal-text';
import { assertAxis } from '@services/chart/validation/axes';
import { assertBarOptions, isGraphMode } from '@services/chart/validation/options';
import {
  assertColor,
  assertFiniteNumber,
  assertOptionalBoolean,
  assertOptionalString,
  assertRecord,
} from '@services/chart/validation/primitives';
import {
  assertColoring,
  assertInterpolation,
  assertOverflow,
  assertRenderer,
} from '@services/chart/validation/styles';
import { assertSymbols } from '@services/chart/validation/symbols';
import { rangeError, typeError } from '@services/errors';

/**
 * Validates coordinates.
 * @param {unknown} value - The value.
 */
export const validateCoordinates = (value: unknown): void => {
  if (!Array.isArray(value)) typeError('coordinates', 'must be an array');
  const coordinates = value as unknown[];
  if (coordinates.length === 0) return;

  const validateDatum = (datum: unknown, path: string) => {
    if (!Array.isArray(datum) || datum.length !== 2) {
      typeError(path, 'must contain exactly x and y');
    }
    const values = datum as unknown[];
    assertFiniteNumber(values[0], `${path}[0]`);
    if (values[1] !== null) assertFiniteNumber(values[1], `${path}[1]`);
  };

  const first = coordinates[0];
  const isMultiLine = Array.isArray(first) && (first.length === 0 || Array.isArray(first[0]));
  if (!isMultiLine) {
    coordinates.forEach((datum, index) => validateDatum(datum, `coordinates[${index}]`));
    return;
  }

  coordinates.forEach((line, seriesIndex) => {
    if (!Array.isArray(line)) typeError(`coordinates[${seriesIndex}]`, 'must be an array');
    (line as unknown[]).forEach((datum, datumIndex) =>
      validateDatum(datum, `coordinates[${seriesIndex}][${datumIndex}]`),
    );
  });
};

const assertPlotColor = (value: unknown): void => {
  if (value === undefined || typeof value === 'function') return;
  if (Array.isArray(value)) {
    value.forEach((color, index) => assertColor(color, `settings.color[${index}]`));
    return;
  }
  assertColor(value, 'settings.color');
};

const assertPlotPoints = (value: unknown): void => {
  if (value === undefined) return;
  if (!Array.isArray(value)) typeError('settings.points', 'must be an array');
  (value as unknown[]).forEach((item, index) => {
    const point = assertRecord(item, `settings.points[${index}]`);
    assertFiniteNumber(point.x, `settings.points[${index}].x`);
    assertFiniteNumber(point.y, `settings.points[${index}].y`);
    assertColor(point.color, `settings.points[${index}].color`);
  });
};

const assertPlotThresholds = (value: unknown): void => {
  if (value === undefined) return;
  if (!Array.isArray(value)) typeError('settings.thresholds', 'must be an array');
  (value as unknown[]).forEach((item, index) => {
    const threshold = assertRecord(item, `settings.thresholds[${index}]`);
    if (threshold.x === undefined && threshold.y === undefined) {
      typeError(`settings.thresholds[${index}]`, 'must define x, y, or both');
    }
    if (threshold.x !== undefined) {
      assertFiniteNumber(threshold.x, `settings.thresholds[${index}].x`);
    }
    if (threshold.y !== undefined) {
      assertFiniteNumber(threshold.y, `settings.thresholds[${index}].y`);
    }
    assertColor(threshold.color, `settings.thresholds[${index}].color`);
  });
};

const assertPlotLegend = (value: unknown): void => {
  if (value === undefined) return;
  const legend = assertRecord(value, 'settings.legend');
  if (legend.position !== undefined && !LEGEND_POSITIONS.has(legend.position as string)) {
    rangeError('settings.legend.position', `unsupported position "${String(legend.position)}"`);
  }
  assertColor(legend.color, 'settings.legend.color');
  for (const field of ['series', 'points', 'thresholds'] as const) {
    const labels = legend[field];
    if (labels === undefined) continue;
    if (typeof labels === 'string') {
      assertDisplayText(labels, `settings.legend.${field}`);
      continue;
    }
    if (!Array.isArray(labels)) typeError(`settings.legend.${field}`, 'must be a string or array');
    (labels as unknown[]).forEach((label, index) => {
      assertDisplayText(label, `settings.legend.${field}[${index}]`);
    });
  }
};

const assertPlotDimensions = (settings: Record<string, unknown>): void => {
  if (settings.width !== undefined && settings.width !== 'auto') {
    const width = assertFiniteNumber(settings.width, 'settings.width');
    if (!Number.isInteger(width) || width < 1) {
      rangeError('settings.width', 'must be a positive integer');
    }
  }
  if (settings.height !== undefined) {
    const height = assertFiniteNumber(settings.height, 'settings.height');
    if (!Number.isInteger(height) || height < 1) {
      rangeError('settings.height', 'must be a positive integer');
    }
  }
  if (settings.aspectRatio !== undefined) {
    const aspectRatio = assertFiniteNumber(settings.aspectRatio, 'settings.aspectRatio');
    if (aspectRatio <= 0) rangeError('settings.aspectRatio', 'must be greater than zero');
  }
};

const assertPlotAxes = (settings: Record<string, unknown>): void => {
  assertAxis(settings.xAxis, 'settings.xAxis');
  assertAxis(settings.yAxis, 'settings.yAxis');
  if (settings.yRange !== undefined) assertAxis({ domain: settings.yRange }, 'settings.yAxis');
  if (settings.customXAxisTicks !== undefined) {
    assertAxis({ ticks: settings.customXAxisTicks }, 'settings.xAxis');
  }
  if (settings.customYAxisTicks !== undefined) {
    assertAxis({ ticks: settings.customYAxisTicks }, 'settings.yAxis');
  }
};

const assertPlotTextAndColors = (settings: Record<string, unknown>): void => {
  for (const field of ['title', 'xLabel', 'yLabel'] as const) {
    assertOptionalString(settings[field], `settings.${field}`);
  }
  for (const field of ['titleColor', 'borderColor', 'backgroundColor'] as const) {
    assertColor(settings[field], `settings.${field}`);
  }
};

const assertPlotFlags = (settings: Record<string, unknown>): void => {
  for (const field of [
    'showTickLabel',
    'hideXAxis',
    'hideXAxisTicks',
    'hideYAxis',
    'hideYAxisTicks',
    'fillArea',
    'debugMode',
  ] as const) {
    assertOptionalBoolean(settings[field], `settings.${field}`);
  }
  for (const field of ['formatter', 'lineFormatter'] as const) {
    if (settings[field] !== undefined && typeof settings[field] !== 'function') {
      typeError(`settings.${field}`, 'must be a function');
    }
  }
};

const assertPlotModeAndStyle = (settings: Record<string, unknown>): void => {
  if (settings.mode !== undefined && !isGraphMode(settings.mode)) {
    rangeError('settings.mode', `unsupported mode "${String(settings.mode)}"`);
  }
  assertInterpolation(settings.interpolation, 'settings.interpolation');
  assertOverflow(settings.overflow, 'settings.overflow');
  assertRenderer(settings.renderer, 'settings.renderer');
  assertBarOptions(settings, 'settings');
};

const assertPlotColoring = (value: unknown): void => {
  if (value === undefined) return;
  if (!Array.isArray(value)) return assertColoring(value, 'settings.coloring');
  value.forEach((coloring, index) => {
    if (coloring !== undefined) assertColoring(coloring, `settings.coloring[${index}]`);
  });
};

const assertPlotAxisCenter = (value: unknown): void => {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length !== 2) {
    typeError('settings.axisCenter', 'must contain x and y');
  }
  (value as unknown[]).forEach((coordinate, index) => {
    if (coordinate !== undefined) assertFiniteNumber(coordinate, `settings.axisCenter[${index}]`);
  });
};

/**
 * Validates plot settings.
 * @param {unknown} value - The value.
 */
export const validatePlotSettings = (value: unknown): void => {
  if (value === undefined) return;
  const settings = assertRecord(value, 'settings');
  assertPlotDimensions(settings);
  assertPlotAxes(settings);
  assertPlotTextAndColors(settings);
  assertPlotFlags(settings);
  assertPlotModeAndStyle(settings);
  assertPlotColor(settings.color);
  assertPlotColoring(settings.coloring);
  assertPlotPoints(settings.points);
  assertPlotThresholds(settings.thresholds);
  assertPlotLegend(settings.legend);
  assertPlotAxisCenter(settings.axisCenter);
  assertSymbols(settings.symbols, 'settings.symbols');
};
