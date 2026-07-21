import type { DisplayToken } from '@types';
import {
  ANSI_SGR_PATTERN,
  COMBINING_PATTERN,
  ESCAPE,
  EXTENDED_PICTOGRAPHIC_PATTERN,
  FULLWIDTH_CODE_POINTS,
  FULLWIDTH_RANGES,
  GRAPHEME_SEGMENTER,
  PRINTABLE_ASCII_PATTERN,
  REGIONAL_INDICATOR_PATTERN,
} from '@constants/terminal';
import { rangeError, typeError } from '@services/errors';

const isPrintableAscii = (value: string): boolean => PRINTABLE_ASCII_PATTERN.test(value);

/**
 * Returns whether one code point occupies two terminal columns.
 * @param {number} codePoint - Unicode code point.
 * @returns {boolean} - Whether code point is fullwidth.
 */
const isFullwidthCodePoint = (codePoint: number): boolean => {
  if (codePoint < FULLWIDTH_RANGES[0][0] || codePoint === 0x303f) return false;
  if (FULLWIDTH_CODE_POINTS.has(codePoint)) return true;
  return FULLWIDTH_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
};

/**
 * Returns display width for one segmented grapheme.
 * @param {string} grapheme - Segmented grapheme.
 * @returns {number} - Terminal-column width.
 */
const graphemeWidth = (grapheme: string): number => {
  if (
    EXTENDED_PICTOGRAPHIC_PATTERN.test(grapheme) ||
    REGIONAL_INDICATOR_PATTERN.test(grapheme) ||
    grapheme.includes('\ufe0f') ||
    grapheme.includes('\u20e3')
  ) {
    return 2;
  }
  const base = Array.from(grapheme).find((character) => !COMBINING_PATTERN.test(character));
  return base && isFullwidthCodePoint(base.codePointAt(0) as number) ? 2 : 1;
};

/**
 * Removes supported ANSI SGR sequences.
 * @param {string} value - Text to strip.
 * @returns {string} - Text without SGR sequences.
 */
export const stripAnsi = (value: string): string => value.replace(ANSI_SGR_PATTERN, '');

/**
 * Validates visible terminal text and rejects layout-changing controls.
 * @param {unknown} value - Unknown boundary value.
 * @param {string} path - Public error path.
 * @returns {string} - Validated text.
 */
export const assertDisplayText = (value: unknown, path: string): string => {
  if (typeof value !== 'string') return typeError(path, 'must be a string');
  const plain = stripAnsi(value);
  const hasControl = Array.from(plain).some((character) => {
    const codePoint = character.codePointAt(0) as number;
    return codePoint <= 31 || (codePoint >= 127 && codePoint <= 159);
  });
  if (hasControl || plain.includes(ESCAPE)) {
    return rangeError(path, 'must not contain control characters or non-SGR escapes');
  }
  return value;
};

/**
 * Validates formatter output as finite numeric or safe visible text.
 * @param {unknown} value - Formatter result.
 * @param {string} path - Public error path.
 * @returns {number | string} - Validated display value.
 */
export const assertDisplayValue = (value: unknown, path: string): number | string => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return rangeError(path, 'must be finite');
    return value;
  }
  if (typeof value !== 'string') return typeError(path, 'must be a number or string');
  return assertDisplayText(value, path);
};

/**
 * Splits styled text into grapheme tokens with terminal-column widths.
 * @param {number | string} value - Text or number to split.
 * @returns {DisplayToken[]} - Styled display tokens.
 */
export const toDisplayTokens = (value: number | string): DisplayToken[] => {
  const input = String(value);
  if (isPrintableAscii(input)) {
    return Array.from(input, (text) => ({ text, width: 1 }));
  }
  const tokens: DisplayToken[] = [];
  let cursor = 0;
  let pendingAnsi = '';

  const addPlain = (plain: string) => {
    for (const { segment } of GRAPHEME_SEGMENTER.segment(plain)) {
      tokens.push({ text: `${pendingAnsi}${segment}`, width: graphemeWidth(segment) });
      pendingAnsi = '';
    }
  };

  for (const match of input.matchAll(ANSI_SGR_PATTERN)) {
    addPlain(input.slice(cursor, match.index));
    const ansi = match[0];
    if ((ansi === `${ESCAPE}[m` || ansi === `${ESCAPE}[0m`) && tokens.length > 0) {
      tokens[tokens.length - 1].text += ansi;
    } else {
      pendingAnsi += ansi;
    }
    cursor = match.index + ansi.length;
  }
  addPlain(input.slice(cursor));
  if (pendingAnsi && tokens.length > 0) tokens[tokens.length - 1].text += pendingAnsi;
  return tokens;
};

/**
 * Converts text into logical terminal cells, reserving wide continuations.
 * @param {number | string} value - Text or number to split.
 * @returns {string[]} - Logical terminal cells.
 */
export const toDisplayCells = (value: number | string): string[] => {
  const input = String(value);
  if (isPrintableAscii(input)) return Array.from(input);
  return toDisplayTokens(input).flatMap(({ text, width }) => [
    text,
    ...Array(Math.max(0, width - 1)).fill(''),
  ]);
};

/**
 * Returns terminal display width in columns.
 * @param {number | string} value - Text or number to measure.
 * @returns {number} - Terminal-column width.
 */
export const displayWidth = (value: number | string): number => {
  const input = String(value);
  if (isPrintableAscii(input)) return input.length;
  return toDisplayTokens(input).reduce((width, token) => width + token.width, 0);
};

/**
 * Validates a grid symbol as exactly one terminal column.
 * @param {unknown} value - Unknown boundary value.
 * @param {string} path - Public error path.
 * @returns {string} - Validated one-column symbol.
 */
export const assertCellSymbol = (value: unknown, path: string): string => {
  const symbol = assertDisplayText(value, path);
  if (displayWidth(symbol) !== 1) {
    return rangeError(path, 'must occupy exactly one terminal column');
  }
  return symbol;
};
