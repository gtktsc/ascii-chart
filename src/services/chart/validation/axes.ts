import { LabelCollisionPolicy, XScale } from '@types';
import { LABEL_COLLISION_POLICIES, X_SCALES } from '@constants/validation';
import { rangeError, typeError } from '@services/errors';

import {
  assertChartX,
  assertColor,
  assertFiniteNumber,
  assertOptionalBoolean,
  assertOptionalString,
  assertRecord,
  mergeXScale,
} from './primitives';

import type { XScaleState } from './types';

const assertLabelCollision = (value: unknown, path: string): void => {
  if (value !== undefined && !LABEL_COLLISION_POLICIES.has(value as LabelCollisionPolicy)) {
    rangeError(path, `unsupported collision policy "${String(value)}"`);
  }
};

const assertAxisFields = (axis: Record<string, unknown>, path: string): void => {
  assertOptionalString(axis.label, `${path}.label`);
  assertOptionalBoolean(axis.hidden, `${path}.hidden`);
  assertOptionalBoolean(axis.hideTicks, `${path}.hideTicks`);
  assertOptionalBoolean(axis.showTickLabel, `${path}.showTickLabel`);
  assertLabelCollision(axis.labelCollision, `${path}.labelCollision`);
  assertColor(axis.color, `${path}.color`);
  if (axis.formatter !== undefined && typeof axis.formatter !== 'function') {
    typeError(`${path}.formatter`, 'must be a function');
  }
};

/**
 * Validates axis and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertAxis = (value: unknown, path: string): void => {
  if (value === undefined) return;
  const axis = assertRecord(value, path);
  if (axis.domain !== undefined) {
    if (!Array.isArray(axis.domain) || axis.domain.length !== 2) {
      typeError(`${path}.domain`, 'must contain exactly two numbers');
    }
    const domain = axis.domain as unknown[];
    const min = assertFiniteNumber(domain[0], `${path}.domain[0]`);
    const max = assertFiniteNumber(domain[1], `${path}.domain[1]`);
    if (min >= max) rangeError(`${path}.domain`, 'minimum must be less than maximum');
  }
  if (axis.ticks !== undefined) {
    if (typeof axis.ticks === 'number') {
      if (!Number.isInteger(axis.ticks) || axis.ticks < 2) {
        rangeError(`${path}.ticks`, 'count must be an integer of at least 2');
      }
    } else if (Array.isArray(axis.ticks)) {
      if (axis.ticks.length === 0) rangeError(`${path}.ticks`, 'must not be empty');
      axis.ticks.forEach((tick, index) => assertFiniteNumber(tick, `${path}.ticks[${index}]`));
      for (let index = 1; index < axis.ticks.length; index++) {
        if (axis.ticks[index] <= axis.ticks[index - 1]) {
          rangeError(`${path}.ticks`, 'values must be strictly increasing');
        }
      }
    } else {
      typeError(`${path}.ticks`, 'must be a count or an array of values');
    }
  }
  assertAxisFields(axis, path);
};

const comparableX = (value: string | number | Date): string | number =>
  value instanceof Date ? value.getTime() : value;

const addXScaleValue = (state: XScaleState, entry: unknown, entryPath: string): void => {
  state.value = mergeXScale(state.value, assertChartX(entry, entryPath), entryPath);
};

const assertBandDomain = (domain: Array<string | number | Date>, path: string): void => {
  const seen = new Set<string>();
  domain.forEach((entry, index) => {
    const category = entry as string;
    if (seen.has(category)) rangeError(`${path}.domain[${index}]`, 'must be unique');
    seen.add(category);
  });
};

const assertXDomain = (
  value: unknown,
  path: string,
  state: XScaleState,
): Array<string | number | Date> | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0) {
    typeError(`${path}.domain`, 'must be a non-empty array');
  }
  const domain = value as Array<string | number | Date>;
  domain.forEach((entry, index) => addXScaleValue(state, entry, `${path}.domain[${index}]`));
  if (state.value !== 'band' && domain.length !== 2) {
    typeError(`${path}.domain`, 'must contain exactly two values');
  }
  if (state.value === 'band') assertBandDomain(domain, path);
  if (
    state.value !== 'band' &&
    domain.length === 2 &&
    comparableX(domain[0]) >= comparableX(domain[1])
  ) {
    rangeError(`${path}.domain`, 'minimum must be less than maximum');
  }
  return domain;
};

const assertTickCount = (ticks: number, path: string): void => {
  if (!Number.isInteger(ticks) || ticks < 2) {
    rangeError(`${path}.ticks`, 'count must be an integer of at least 2');
  }
};

const assertOrderedTicks = (ticks: Array<string | number | Date>, path: string): void => {
  for (let index = 1; index < ticks.length; index++) {
    if (comparableX(ticks[index]) <= comparableX(ticks[index - 1])) {
      rangeError(`${path}.ticks`, 'values must be strictly increasing');
    }
  }
};

const assertBandTicks = (
  ticks: Array<string | number | Date>,
  domain: Array<string | number | Date> | undefined,
  path: string,
): void => {
  if (!domain) return;
  ticks.forEach((tick, index) => {
    if (!domain.includes(tick)) {
      rangeError(
        `${path}.ticks[${index}]`,
        'must fall within the resolved domain',
        'ERR_CHART_OUT_OF_DOMAIN',
      );
    }
    if (index > 0 && domain.indexOf(tick) <= domain.indexOf(ticks[index - 1])) {
      rangeError(`${path}.ticks`, 'values must follow domain order');
    }
  });
};

const assertXTicks = (
  value: unknown,
  path: string,
  state: XScaleState,
  domain: Array<string | number | Date> | undefined,
): void => {
  if (value === undefined) return;
  if (typeof value === 'number') return assertTickCount(value, path);
  if (!Array.isArray(value)) typeError(`${path}.ticks`, 'must be a count or an array of values');
  const ticks = value as Array<string | number | Date>;
  if (ticks.length === 0) rangeError(`${path}.ticks`, 'must not be empty');
  ticks.forEach((tick, index) => addXScaleValue(state, tick, `${path}.ticks[${index}]`));
  if (state.value === 'band') assertBandTicks(ticks, domain, path);
  else assertOrderedTicks(ticks, path);
};

const assertXScaleCompatibility = (
  explicitScale: XScale | undefined,
  inferredScale: XScale | undefined,
  path: string,
): void => {
  if (
    explicitScale !== undefined &&
    inferredScale !== undefined &&
    explicitScale !== inferredScale
  ) {
    rangeError(`${path}.scale`, `requires ${explicitScale} X values`);
  }
};

/**
 * Validates xaxis and throws when it is invalid.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 * @param {XScale | undefined} dataScale - The data scale.
 * @returns {XScale | undefined} - Computed result.
 */
export const assertXAxis = (
  value: unknown,
  path: string,
  dataScale: XScale | undefined,
): XScale | undefined => {
  if (value === undefined) return dataScale;
  const axis = assertRecord(value, path);
  if (axis.scale !== undefined && !X_SCALES.has(axis.scale as XScale)) {
    rangeError(`${path}.scale`, `unsupported scale "${String(axis.scale)}"`);
  }
  const explicitScale = axis.scale as XScale | undefined;
  const state = { value: dataScale };
  const domain = assertXDomain(axis.domain, path, state);
  assertXTicks(axis.ticks, path, state, domain);
  assertXScaleCompatibility(explicitScale, state.value, path);
  assertAxisFields(axis, path);
  return explicitScale ?? state.value;
};
