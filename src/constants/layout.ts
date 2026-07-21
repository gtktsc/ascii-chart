import {
  DEFAULT_DECIMAL_PLACES,
  DEFAULT_PADDING,
  DEFAULT_Y_SHIFT_OFFSET,
  K_FORMAT_THRESHOLD,
} from './formatting';

/**
 * Minimum dimensions and padding constraints shared by plot layout.
 */
export const LAYOUT = {
  MIN_PLOT_HEIGHT: 3,
  DEFAULT_DECIMAL_PLACES,
  K_FORMAT_THRESHOLD,
  DEFAULT_PADDING,
  DEFAULT_Y_SHIFT_OFFSET,
} as const;

/**
 * Default chart width used when callers provide no override.
 */
export const DEFAULT_CHART_WIDTH = 60;
/**
 * Default chart height used when callers provide no override.
 */
export const DEFAULT_CHART_HEIGHT = 15;
/**
 * Terminal width used when the runtime cannot report its column count.
 */
export const FALLBACK_TERMINAL_COLUMNS = 80;
/**
 * Approximate terminal character height-to-width ratio used for aspect sizing.
 */
export const TERMINAL_CELL_HEIGHT_RATIO = 2;
/**
 * First graph row reserved for plot data after the top axis boundary.
 */
export const FIRST_PLOT_ROW = 1;
/**
 * Number of discrete glyph levels required by sparkline rendering.
 */
export const SPARKLINE_LEVEL_COUNT = 8;
/**
 * Middle sparkline level used when every finite input value is equal.
 */
export const CONSTANT_SPARKLINE_LEVEL = 3;
