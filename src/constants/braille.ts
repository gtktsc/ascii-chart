/**
 * Unicode base code point for an empty Braille cell.
 */
export const BRAILLE_BASE = 0x2800;
/**
 * Number of horizontal plot pixels encoded by one Braille cell.
 */
export const BRAILLE_CELL_WIDTH = 2;
/**
 * Number of vertical plot pixels encoded by one Braille cell.
 */
export const BRAILLE_CELL_HEIGHT = 4;

const ANSI_SGR = `${String.fromCharCode(27)}\\[[0-9;]*m`;

/**
 * Pattern used to recognize leading ansi.
 */
export const LEADING_ANSI_PATTERN = new RegExp(`^(?:${ANSI_SGR})*`);
/**
 * Pattern used to recognize trailing ansi.
 */
export const TRAILING_ANSI_PATTERN = new RegExp(`(?:${ANSI_SGR})*$`);
/**
 * Bit masks mapping local Braille pixel coordinates to Unicode dots.
 */
export const BRAILLE_DOT_MASKS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
] as const;
