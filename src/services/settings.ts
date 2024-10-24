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

export const getAnsiColor = (color: Color): string => colorMap[color] || colorMap.ansiWhite;

export const getChartSymbols = (
  color: Color | Color[] | undefined | ColorGetter,
  series: number,
  chartSymbols: Partial<typeof CHART> | void,
  input: MultiLine,
  fillArea?: boolean,
) => {
  const chart = { ...CHART, ...chartSymbols };
  if (fillArea) {
    Object.entries(chart).forEach(([key]) => {
      chart[key as keyof typeof chart] = chart.area;
    });
  }
  if (color) {
    let currentColor: Color = 'ansiWhite';

    if (Array.isArray(color)) {
      currentColor = color[series];
    } else if (typeof color === 'function') {
      currentColor = color(series, input);
    } else if (color) {
      currentColor = color;
    }

    Object.entries(chart).forEach(([key, sign]) => {
      chart[key as keyof typeof chart] = `${getAnsiColor(currentColor)}${sign}\u001b[0m`;
    });
  }
  return chart;
};

export const defaultFormatter: Formatter = (value) => {
  if (Math.abs(value) >= 1000) return `${Number(value.toFixed(3)) / 1000}k`;
  return Number(value.toFixed(3));
};
