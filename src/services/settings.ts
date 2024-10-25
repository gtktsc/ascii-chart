import { CHART } from '../constants/index';
import { Color, ColorGetter, Formatter, MultiLine } from '../types/index';

const colorMap: Record<Color, string> = {
  ansiBlack: '\u001b[30m',
  ansiRed: '\u001b[31m',
  ansiGreen: '\u001b[32m',
  ansiYellow: '\u001b[33m',
  ansiBlue: '\u001b[34m',
  ansiMagenta: '\u001b[35m',
  ansiCyan: '\u001b[36m',
  ansiWhite: '\u001b[37m',
};

/**
 * Maps a color name to its corresponding ANSI color code.
 * @param {Color} color - The color to map.
 * @returns {string} - The ANSI escape code for the specified color.
 */
export const getAnsiColor = (color: Color): string => colorMap[color] || colorMap.ansiWhite;

/**
 * Configures and applies colors to chart symbols based on the specified color or series.
 * @param {Color | Color[] | ColorGetter | undefined} color - The color setting for the series.
 * @param {number} series - The index of the series.
 * @param {Partial<typeof CHART> | undefined} chartSymbols - Custom symbols for the chart, if any.
 * @param {MultiLine} input - The dataset used in the chart.
 * @param {boolean} [fillArea] - If true, fills the area under the plot with the chart's fill symbol.
 * @returns {object} - An object with chart symbols applied in the specified color(s).
 */
export const getChartSymbols = (
  color: Color | Color[] | undefined | ColorGetter,
  series: number,
  chartSymbols: Partial<typeof CHART> | void,
  input: MultiLine,
  fillArea?: boolean,
) => {
  const chart = { ...CHART, ...chartSymbols };

  // Apply the fill area symbol to all chart symbols if fillArea is true
  if (fillArea) {
    Object.entries(chart).forEach(([key]) => {
      chart[key as keyof typeof chart] = chart.area;
    });
  }

  // Determine the color for the current series and apply it to all chart symbols
  if (color) {
    let currentColor: Color = 'ansiWhite';

    if (Array.isArray(color)) {
      currentColor = color[series];
    } else if (typeof color === 'function') {
      currentColor = color(series, input);
    } else {
      currentColor = color;
    }

    Object.entries(chart).forEach(([key, symbol]) => {
      chart[key as keyof typeof chart] = `${getAnsiColor(currentColor)}${symbol}\u001b[0m`;
    });
  }

  return chart;
};

/**
 * Formats a number for display, converting values >= 1000 to a "k" notation.
 * @param {number} value - The value to format.
 * @returns {string | number} - The formatted value as a string with "k" for thousands or as a rounded number.
 */
export const defaultFormatter: Formatter = (value) => {
  if (Math.abs(value) >= 1000) {
    const rounded = value / 1000;
    return rounded % 1 === 0 ? `${rounded}k` : `${rounded.toFixed(3)}k`;
  }
  return Number(value.toFixed(3));
};
