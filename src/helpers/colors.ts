import { CHART } from '@constants';
import type { Color, ColorGetter, MultiLine } from '@types';
import { ANSI_COLORS, ANSI_RESET } from '@constants/ansi';

/**
 * Returns ansi color.
 * @param {Color} color - The color.
 * @returns {string} - Computed result.
 */
export const getAnsiColor = (color: Color): string => ANSI_COLORS[color] || ANSI_COLORS.ansiWhite;

/**
 * Applies terminal color to symbol.
 * @param {string} symbol - The symbol.
 * @param {Color} color - The color.
 * @returns {string} - Computed result.
 */
export const colorizeSymbol = (symbol: string, color?: Color): string =>
  color ? `${getAnsiColor(color)}${symbol}${ANSI_RESET}` : symbol;

/**
 * Returns series color.
 * @param {Color | Array<Color | undefined> | undefined | ColorGetter} color - The color.
 * @param {number} series - The series.
 * @param {MultiLine} input - The input.
 * @returns {"ansiRed" | "ansiGreen" | "ansiBlack" | "ansiYellow" | "ansiBlue" | "ansiMagenta" | "ansiCyan" | "ansiWhite" | "ansiBrightBlack" | "ansiBrightRed" | "ansiBrightGreen" | "ansiBrightYellow" | "ansiBrightBlue" | "ansiBrightMagenta" | "ansiBrightCyan" | "ansiBrightWhite" | undefined} - Computed result.
 */
export const getSeriesColor = (
  color: Color | Array<Color | undefined> | undefined | ColorGetter,
  series: number,
  input: MultiLine,
): Color | undefined => {
  if (Array.isArray(color)) return color[series];
  if (typeof color === 'function') return color(series, input);
  return color;
};

/**
 * Resolves and colorizes chart line symbols for one series.
 * @param {Color | Array<Color | undefined> | undefined | ColorGetter} color - The color.
 * @param {number} series - The series.
 * @param {Partial<typeof CHART> | void} chartSymbols - The chart symbols.
 * @param {MultiLine} input - The input.
 * @param {boolean} fillArea - The fill area.
 * @returns {{ we: string; wns: string; ns: string; nse: string; wsn: string; sne: string; area: string; } | { we: string; wns: string; ns: string; nse: string; wsn: string; sne: string; area: string; }} - Computed result.
 */
export const getChartSymbols = (
  color: Color | Array<Color | undefined> | undefined | ColorGetter,
  series: number,
  chartSymbols: Partial<typeof CHART> | void,
  input: MultiLine,
  fillArea?: boolean,
) => {
  const chart = { ...CHART, ...chartSymbols };
  if (fillArea) {
    Object.keys(chart).forEach((key) => {
      chart[key as keyof typeof chart] = chart.area;
    });
  }
  if (color) {
    const currentColor = getSeriesColor(color, series, input);
    Object.keys(chart).forEach((key) => {
      const chartKey = key as keyof typeof chart;
      chart[chartKey] = colorizeSymbol(chart[chartKey], currentColor);
    });
  }
  return chart;
};
