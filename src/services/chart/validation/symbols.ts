import { AXIS, CHART, THRESHOLDS } from '@constants';
import { DEFAULT_ANNOTATION_SYMBOLS } from '@constants/symbols/annotations';
import { DEFAULT_CANDLESTICK_SYMBOLS } from '@constants/symbols/candlestick';
import { assertCellSymbol } from '@helpers/terminal-text';

import { assertRecord } from './primitives';

/**
 * Validates every configurable chart symbol and nested symbol group.
 * @param {unknown} value - The value.
 * @param {string} path - The path.
 */
export const assertSymbols = (value: unknown, path: string): void => {
  if (value === undefined) return;
  const symbols = assertRecord(value, path);
  for (const field of ['empty', 'background', 'border', 'point', 'ellipsis'] as const) {
    if (symbols[field] !== undefined) assertCellSymbol(symbols[field], `${path}.${field}`);
  }
  for (const [field, defaults] of [
    ['axis', AXIS],
    ['chart', CHART],
    ['thresholds', THRESHOLDS],
  ] as const) {
    if (symbols[field] === undefined) continue;
    const group = assertRecord(symbols[field], `${path}.${field}`);
    Object.keys(defaults).forEach((key) => {
      if (group[key] !== undefined) assertCellSymbol(group[key], `${path}.${field}.${key}`);
    });
  }
  if (symbols.candlestick !== undefined) {
    const candlestick = assertRecord(symbols.candlestick, `${path}.candlestick`);
    Object.keys(DEFAULT_CANDLESTICK_SYMBOLS).forEach((key) => {
      if (candlestick[key] !== undefined) {
        assertCellSymbol(candlestick[key], `${path}.candlestick.${key}`);
      }
    });
  }
  if (symbols.annotations !== undefined) {
    const annotations = assertRecord(symbols.annotations, `${path}.annotations`);
    for (const field of ['span', 'arrowLine'] as const) {
      if (annotations[field] !== undefined) {
        assertCellSymbol(annotations[field], `${path}.annotations.${field}`);
      }
    }
    for (const field of ['arrowHeads', 'errorBar'] as const) {
      if (annotations[field] === undefined) continue;
      const group = assertRecord(annotations[field], `${path}.annotations.${field}`);
      Object.keys(DEFAULT_ANNOTATION_SYMBOLS[field]).forEach((key) => {
        if (group[key] !== undefined) {
          assertCellSymbol(group[key], `${path}.annotations.${field}.${key}`);
        }
      });
    }
  }
};
