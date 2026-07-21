import { assertCellSymbol, assertDisplayText, displayWidth } from '@helpers/terminal-text';
import {
  assertColor,
  assertFiniteNumber,
  assertRecord,
  assertUniqueIds,
} from '@services/chart/validation/primitives';
import { rangeError, typeError } from '@services/errors';

import type { AddAnnotationXValue } from './types';

const assertMagnitude = (value: unknown, path: string): void => {
  const values = Array.isArray(value) ? value : [value];
  if (Array.isArray(value) && value.length !== 2) {
    typeError(path, 'must be a number or contain exactly minus and plus');
  }
  values.forEach((entry, index) => {
    const entryPath = Array.isArray(value) ? `${path}[${index}]` : path;
    if (assertFiniteNumber(entry, entryPath) < 0) rangeError(entryPath, 'must be non-negative');
  });
};

const assertPoint = (
  value: unknown,
  path: string,
  addXValue: AddAnnotationXValue,
): readonly [unknown, number] => {
  if (!Array.isArray(value) || value.length !== 2) {
    return typeError(path, 'must contain exactly x and y');
  }
  addXValue(value[0], `${path}[0]`);
  return [value[0], assertFiniteNumber(value[1], `${path}[1]`)];
};

const comparableX = (value: unknown): unknown => (value instanceof Date ? value.getTime() : value);

const validateSpan = (
  annotation: Record<string, unknown>,
  path: string,
  addXValue: AddAnnotationXValue,
): void => {
  if (annotation.axis !== 'x' && annotation.axis !== 'y') {
    rangeError(`${path}.axis`, `unsupported axis "${String(annotation.axis)}"`);
  }
  if (annotation.axis === 'x') {
    addXValue(annotation.from, `${path}.from`);
    addXValue(annotation.to, `${path}.to`);
    const from = comparableX(annotation.from);
    const to = comparableX(annotation.to);
    if (typeof from !== 'string' && (from as number) > (to as number)) {
      rangeError(`${path}.to`, 'must not precede from');
    }
  } else {
    const from = assertFiniteNumber(annotation.from, `${path}.from`);
    const to = assertFiniteNumber(annotation.to, `${path}.to`);
    if (from > to) rangeError(`${path}.to`, 'must not precede from');
  }
  if (annotation.symbol !== undefined) assertCellSymbol(annotation.symbol, `${path}.symbol`);
};

const validateText = (
  annotation: Record<string, unknown>,
  path: string,
  addXValue: AddAnnotationXValue,
): void => {
  addXValue(annotation.x, `${path}.x`);
  assertFiniteNumber(annotation.y, `${path}.y`);
  const text = assertDisplayText(annotation.text, `${path}.text`);
  if (displayWidth(text) === 0) rangeError(`${path}.text`, 'must occupy at least one column');
  const align = annotation.align;
  if (align !== undefined && align !== 'left' && align !== 'center' && align !== 'right') {
    rangeError(`${path}.align`, `unsupported alignment "${String(align)}"`);
  }
};

const validateArrow = (
  annotation: Record<string, unknown>,
  path: string,
  addXValue: AddAnnotationXValue,
): void => {
  const from = assertPoint(annotation.from, `${path}.from`, addXValue);
  const to = assertPoint(annotation.to, `${path}.to`, addXValue);
  if (comparableX(from[0]) === comparableX(to[0]) && from[1] === to[1]) {
    rangeError(`${path}.to`, 'must differ from from');
  }
  if (annotation.lineSymbol !== undefined) {
    assertCellSymbol(annotation.lineSymbol, `${path}.lineSymbol`);
  }
};

const validateErrorBar = (
  annotation: Record<string, unknown>,
  path: string,
  addXValue: AddAnnotationXValue,
  categoricalXErrorPaths: string[],
): void => {
  addXValue(annotation.x, `${path}.x`);
  assertFiniteNumber(annotation.y, `${path}.y`);
  if (annotation.xError === undefined && annotation.yError === undefined) {
    typeError(path, 'must define xError, yError, or both');
  }
  if (annotation.xError !== undefined) {
    assertMagnitude(annotation.xError, `${path}.xError`);
    categoricalXErrorPaths.push(`${path}.xError`);
  }
  if (annotation.yError !== undefined) assertMagnitude(annotation.yError, `${path}.yError`);
};

const validateAnnotation = (
  annotation: Record<string, unknown>,
  path: string,
  addXValue: AddAnnotationXValue,
  categoricalXErrorPaths: string[],
): void => {
  assertColor(annotation.color, `${path}.color`);
  if (annotation.type === 'span') return validateSpan(annotation, path, addXValue);
  if (annotation.type === 'text') return validateText(annotation, path, addXValue);
  if (annotation.type === 'arrow') return validateArrow(annotation, path, addXValue);
  if (annotation.type === 'errorBar') {
    return validateErrorBar(annotation, path, addXValue, categoricalXErrorPaths);
  }
  rangeError(`${path}.type`, `unsupported annotation type "${String(annotation.type)}"`);
};

/**
 * Validates structured annotation variants.
 * @param {unknown} value - Unknown annotations collection.
 * @param {AddXValue} addXValue - Registers and validates one native X value.
 * @returns {string[]} - Paths for X errors that categorical scales cannot support.
 */
export const validateAnnotations = (value: unknown, addXValue: AddAnnotationXValue): string[] => {
  assertUniqueIds(value, 'annotations');
  const categoricalXErrorPaths: string[] = [];

  (value as unknown[] | undefined)?.forEach((item, index) => {
    const path = `annotations[${index}]`;
    const annotation = assertRecord(item, path);
    validateAnnotation(annotation, path, addXValue, categoricalXErrorPaths);
  });

  return categoricalXErrorPaths;
};
