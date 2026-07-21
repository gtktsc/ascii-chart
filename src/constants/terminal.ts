/**
 * Terminal escape character used to construct ANSI sequences.
 */
export const ESCAPE = String.fromCharCode(27);
/**
 * Pattern used to recognize ansi sgr.
 */
export const ANSI_SGR_PATTERN = new RegExp(`${ESCAPE}\\[[0-9;]*m`, 'g');
/**
 * Pattern used to recognize extended pictographic.
 */
export const EXTENDED_PICTOGRAPHIC_PATTERN = /\p{Extended_Pictographic}/u;
/**
 * Pattern used to recognize combining.
 */
export const COMBINING_PATTERN = /\p{Mark}/u;
/**
 * Pattern used to recognize regional indicator.
 */
export const REGIONAL_INDICATOR_PATTERN = /\p{Regional_Indicator}/u;
/**
 * Grapheme segmenter used to measure terminal-visible text safely.
 */
export const GRAPHEME_SEGMENTER = new Intl.Segmenter('en', { granularity: 'grapheme' });

/** Pattern matching strings composed only of printable ASCII characters. */
export const PRINTABLE_ASCII_PATTERN = /^[\x20-\x7e]*$/;

/** Unicode ranges whose code points normally occupy two terminal columns. */
export const FULLWIDTH_RANGES = [
  [0x1100, 0x115f],
  [0x2e80, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe10, 0xfe19],
  [0xfe30, 0xfe6f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  [0x1b000, 0x1b001],
  [0x1f200, 0x1f251],
  [0x20000, 0x3fffd],
] as const;

/** Isolated Unicode code points treated as fullwidth terminal characters. */
export const FULLWIDTH_CODE_POINTS = new Set([0x2329, 0x232a]);
