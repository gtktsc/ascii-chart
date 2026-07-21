import { Interpolation, Overflow, Renderer } from '@types';
import { INTERPOLATIONS, OVERFLOW_POLICIES, RENDERERS } from '@constants/validation';
import { rangeError, typeError } from '@services/errors';

import { assertColor, assertFiniteNumber, assertRecord } from './primitives';

/**
 * Validates interpolation and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertInterpolation = (value: unknown, path: string): void => {
  if (value !== undefined && !INTERPOLATIONS.has(value as Interpolation)) {
    rangeError(path, `unsupported interpolation "${String(value)}"`);
  }
};

/**
 * Validates overflow and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertOverflow = (value: unknown, path: string): void => {
  if (value !== undefined && !OVERFLOW_POLICIES.has(value as Overflow)) {
    rangeError(path, `unsupported overflow policy "${String(value)}"`);
  }
};

/**
 * Validates renderer and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertRenderer = (value: unknown, path: string): void => {
  if (value !== undefined && !RENDERERS.has(value as Renderer)) {
    rangeError(path, `unsupported renderer "${String(value)}"`);
  }
};

/**
 * Validates coloring and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertColoring = (value: unknown, path: string): void => {
  const coloring = assertRecord(value, path);
  if (coloring.type === 'conditional') {
    if (typeof coloring.getColor !== 'function') {
      typeError(`${path}.getColor`, 'must be a function');
    }
    return;
  }
  if (coloring.type !== 'gradient') {
    rangeError(`${path}.type`, `unsupported coloring type "${String(coloring.type)}"`);
  }
  if (coloring.by !== 'x' && coloring.by !== 'y') {
    rangeError(`${path}.by`, `unsupported gradient axis "${String(coloring.by)}"`);
  }
  if (!Array.isArray(coloring.colors)) typeError(`${path}.colors`, 'must be an array');
  if ((coloring.colors as unknown[]).length < 2) {
    rangeError(`${path}.colors`, 'must contain at least two colors');
  }
  (coloring.colors as unknown[]).forEach((color, index) =>
    assertColor(color, `${path}.colors[${index}]`),
  );
  if (coloring.domain !== undefined) {
    if (!Array.isArray(coloring.domain) || coloring.domain.length !== 2) {
      typeError(`${path}.domain`, 'must contain exactly two numbers');
    }
    const domain = coloring.domain as unknown[];
    const min = assertFiniteNumber(domain[0], `${path}.domain[0]`);
    const max = assertFiniteNumber(domain[1], `${path}.domain[1]`);
    if (min >= max) rangeError(`${path}.domain`, 'minimum must be less than maximum');
  }
};
