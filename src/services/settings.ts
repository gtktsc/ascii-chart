import { CHART } from '../constants';
import { Color, Formatter } from '../types';

export const getAnsiColor = (color: Color): string => {
  switch (color) {
    case 'ansiBlack':
      return '\u001b[30m';
    case 'ansiRed':
      return '\u001b[31m';
    case 'ansiGreen':
      return '\u001b[32m';
    case 'ansiYellow':
      return '\u001b[33m';
    case 'ansiBlue':
      return '\u001b[34m';
    case 'ansiMagenta':
      return '\u001b[35m';
    case 'ansiCyan':
      return '\u001b[36m';
    case 'ansiWhite':
    default:
      return '\u001b[37m';
  }
};

export const getChartSymbols = (
  color: Color | Color[] | undefined,
  series: number,
  chartSymbols: Partial<typeof CHART> | void,
  fillArea?: boolean,
) => {
  const chart = { ...CHART, ...chartSymbols };
  if (fillArea) {
    Object.entries(chart).forEach(([key]) => {
      chart[key as keyof typeof chart] = chart.area;
    });
  }
  if (color) {
    let currentColor = '';
    if (Array.isArray(color)) {
      currentColor = color[series];
    } else {
      currentColor = color;
    }

    Object.entries(chart).forEach(([key, sign]) => {
      chart[key as keyof typeof chart] = `${getAnsiColor(currentColor as Color)}${sign}\u001b[0m`;
    });
  }
  return chart;
};

export const defaultFormatter: Formatter = (value) => {
  if (Math.abs(value) >= 1000) return `${Number(value.toFixed(3)) / 1000}k`;
  return Number(value.toFixed(3));
};
