import { XScale } from '@types';
import { ANSI_COLORS } from '@constants/ansi';
import { assertDisplayText } from '@helpers/terminal-text';
import { rangeError, typeError } from '@services/errors';

/**
 * Validates record and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 * @returns {Record<string, unknown>} - Computed result.
 */
export const assertRecord = (value: unknown, path: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return typeError(path, 'must be an object');
  }
  return value as Record<string, unknown>;
};

/**
 * Validates optional string and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertOptionalString = (value: unknown, path: string): void => {
  if (value !== undefined) assertDisplayText(value, path);
};

/**
 * Validates optional boolean and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertOptionalBoolean = (value: unknown, path: string): void => {
  if (value !== undefined && typeof value !== 'boolean') typeError(path, 'must be a boolean');
};

/**
 * Validates finite number and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 * @returns {number} - Computed result.
 */
export const assertFiniteNumber = (value: unknown, path: string): number => {
  if (typeof value !== 'number') return typeError(path, 'must be a number');
  if (!Number.isFinite(value)) return rangeError(path, 'must be finite');
  return value;
};

/**
 * Validates chart x and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 * @returns {XScale} - Computed result.
 */
export const assertChartX = (value: unknown, path: string): XScale => {
  if (typeof value === 'number') {
    assertFiniteNumber(value, path);
    return 'linear';
  }
  if (typeof value === 'string') {
    assertDisplayText(value, path);
    return 'band';
  }
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) rangeError(path, 'must be a valid Date');
    return 'time';
  }
  return typeError(path, 'must be a string, number, or Date');
};

/**
 * Merges an inferred X scale with the next observed scale and rejects mixed value kinds.
 * @param {XScale | undefined} current - The current.
 * @param {XScale} next - The next.
 * @param {string} path - The path.
 * @returns {XScale} - Computed result.
 */
export const mergeXScale = (current: XScale | undefined, next: XScale, path: string): XScale => {
  if (current !== undefined && current !== next) {
    typeError(path, `must use ${current} X values consistently`);
  }
  return next;
};

/**
 * Validates id and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 * @returns {string} - Computed result.
 */
export const assertId = (value: unknown, path: string): string => {
  if (typeof value !== 'string' || value.trim() === '') return typeError(path, 'must be non-empty');
  assertDisplayText(value, path);
  return value;
};

/**
 * Validates unique ids and throws when it is invalid.
 * @param {unknown} items - The items.
 * @param {string} path - The path.
 * @returns {Set<string>} - Computed result.
 */
export const assertUniqueIds = (items: unknown, path: string): Set<string> => {
  if (items === undefined) return new Set();
  if (!Array.isArray(items)) return typeError(path, 'must be an array');
  const ids = new Set<string>();
  items.forEach((item, index) => {
    const record = assertRecord(item, `${path}[${index}]`);
    const id = assertId(record.id, `${path}[${index}].id`);
    if (ids.has(id)) {
      typeError(`${path}[${index}].id`, `duplicate id "${id}"`, 'ERR_CHART_DUPLICATE_ID');
    }
    ids.add(id);
    assertOptionalString(record.name, `${path}[${index}].name`);
  });
  return ids;
};

/**
 * Validates color and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertColor = (value: unknown, path: string): void => {
  if (value === undefined) return;
  if (typeof value !== 'string' || !(value in ANSI_COLORS)) {
    rangeError(path, `unsupported color "${String(value)}"`);
  }
};
