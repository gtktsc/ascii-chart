import { BarLayout, GraphMode } from '@types';
import { BAR_LAYOUTS, GRAPH_MODES } from '@constants/validation';
import { rangeError, typeError } from '@services/errors';

import { assertColor, assertRecord } from './primitives';

/**
 * Validates selector and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {Set<string>} ids - The ids.
 * @param {string} path - The path.
 */
export const assertSelector = (value: unknown, ids: Set<string>, path: string): void => {
  if (value === undefined || typeof value === 'boolean') return;
  if (!Array.isArray(value)) typeError(path, 'must be a boolean or an array of ids');
  (value as unknown[]).forEach((id, index) => {
    if (typeof id !== 'string') typeError(`${path}[${index}]`, 'must be a string id');
    const stringId = id as string;
    if (!ids.has(stringId)) rangeError(`${path}[${index}]`, `unknown id "${stringId}"`);
  });
};

/**
 * Option metadata for assert bar.
 * @param {Record<string, unknown>} value - The value.
 * @param {string} prefix - The prefix.
 */
export const assertBarOptions = (value: Record<string, unknown>, prefix = ''): void => {
  const path = (field: string) => (prefix ? `${prefix}.${field}` : field);
  if (value.barLayout !== undefined && !BAR_LAYOUTS.has(value.barLayout as BarLayout)) {
    rangeError(path('barLayout'), `unsupported layout "${String(value.barLayout)}"`);
  }
  if (value.valueLabels === undefined || typeof value.valueLabels === 'boolean') return;
  const labels = assertRecord(value.valueLabels, path('valueLabels'));
  assertColor(labels.color, `${path('valueLabels')}.color`);
  if (labels.formatter !== undefined && typeof labels.formatter !== 'function') {
    typeError(`${path('valueLabels')}.formatter`, 'must be a function');
  }
};

/**
 * Checks whether input is graph mode.
 * @param {unknown} value - The value.
 * @returns {boolean} - Computed result.
 */
export const isGraphMode = (value: unknown): value is GraphMode =>
  GRAPH_MODES.has(value as GraphMode);
