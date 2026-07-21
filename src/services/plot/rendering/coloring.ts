import { Color, ColorContext, Coloring, Graph, GraphMode, Settings } from '@types';
import { ANSI_COLORS } from '@constants/ansi';
import { colorizeSymbol } from '@helpers/colors';
import { rangeError, typeError } from '@services/errors';

import type { ResolvedColoring } from './types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const fromPlot = (
  position: number,
  size: number,
  domain: readonly [number, number],
  inverted = false,
) => {
  if (size <= 1 || domain[0] === domain[1]) return domain[0];
  const ratio = position / (size - 1);
  return inverted
    ? domain[1] - ratio * (domain[1] - domain[0])
    : domain[0] + ratio * (domain[1] - domain[0]);
};

const getGradientColor = (
  coloring: Extract<Coloring, { type: 'gradient' }>,
  context: ColorContext,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
): Color => {
  const value = context[coloring.by];
  const domain = coloring.domain ?? (coloring.by === 'x' ? xDomain : yDomain);
  if (domain[0] === domain[1]) return coloring.colors[0];
  const ratio = clamp((value - domain[0]) / (domain[1] - domain[0]), 0, 1);
  const index = Math.min(coloring.colors.length - 1, Math.floor(ratio * coloring.colors.length));
  return coloring.colors[index];
};

const assertCallbackColor = (value: unknown, path: string): Color | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return typeError(path, 'must be a color or undefined');
  if (!(value in ANSI_COLORS)) return rangeError(path, `unsupported color "${String(value)}"`);
  return value as Color;
};

/**
 * Builds consistent data-space coordinates for one plot-area cell.
 * @param {object} options - Rendered cell and domain information.
 * @param {number} options.series - Original series index.
 * @param {GraphMode} options.mode - Rendering mode for the series.
 * @param {number} options.plotX - Zero-based plot column.
 * @param {number} options.plotY - Zero-based plot row.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {readonly [number, number]} options.xDomain - Resolved x-axis domain.
 * @param {readonly [number, number]} options.yDomain - Resolved y-axis domain.
 * @returns {ColorContext} - Bounded plot coordinates and corresponding data values.
 */
export const getColorContext = ({
  series,
  mode,
  plotX,
  plotY,
  plotWidth,
  plotHeight,
  xDomain,
  yDomain,
}: {
  series: number;
  mode: GraphMode;
  plotX: number;
  plotY: number;
  plotWidth: number;
  plotHeight: number;
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
}): ColorContext => {
  const boundedX = clamp(plotX, 0, Math.max(0, plotWidth - 1));
  const boundedY = clamp(plotY, 0, Math.max(0, plotHeight - 1));
  return {
    series,
    mode,
    x: fromPlot(boundedX, plotWidth, xDomain),
    y: fromPlot(boundedY, plotHeight, yDomain, true),
    plotX: boundedX,
    plotY: boundedY,
  };
};

/**
 * Resolves dynamic color for one validated strategy and rendered cell.
 * @param {ResolvedColoring} coloring - Validated conditional or gradient strategy.
 * @param {ColorContext} context - Series and cell coordinates supplied to the strategy.
 * @param {readonly [number, number]} xDomain - Resolved x-axis domain.
 * @param {readonly [number, number]} yDomain - Resolved y-axis domain.
 * @returns {Color | undefined} - Dynamic color, or undefined when a callback omits one.
 */
export const getDynamicColor = (
  coloring: ResolvedColoring,
  context: ColorContext,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
): Color | undefined =>
  coloring.value.type === 'conditional'
    ? assertCallbackColor(coloring.value.getColor(context), coloring.resultPath)
    : getGradientColor(coloring.value, context, xDomain, yDomain);

/**
 * Selects one shared or indexed coloring strategy without confusing segment indexes.
 * @param {Settings['coloring']} coloring - Shared or per-series coloring configuration.
 * @param {number} series - Original series index.
 * @returns {ResolvedColoring | undefined} - Selected strategy and its validation path.
 */
export const resolveColoring = (
  coloring: Settings['coloring'],
  series: number,
): ResolvedColoring | undefined => {
  if (coloring === undefined) return undefined;
  if (Array.isArray(coloring)) {
    const value = coloring[series];
    return value ? { value, resultPath: `settings.coloring[${series}].result` } : undefined;
  }
  return { value: coloring as Coloring, resultPath: 'settings.coloring.result' };
};

/**
 * Returns a stable one-cell legend color for dynamic strategies.
 * @param {Coloring | undefined} coloring - Dynamic coloring strategy.
 * @returns {Color | undefined} - First gradient color, or undefined for other strategies.
 */
export const getColoringLegendColor = (coloring: Coloring | undefined): Color | undefined =>
  coloring?.type === 'gradient' ? coloring.colors[0] : undefined;

/**
 * Applies dynamic color to every occupied cell in one isolated series layer.
 * @param {object} options - Options for coloring a rendered series layer.
 * @param {Graph} options.graph - Isolated series graph to modify.
 * @param {string} options.emptySymbol - Symbol identifying unoccupied cells.
 * @param {ResolvedColoring} options.coloring - Validated dynamic coloring strategy.
 * @param {Color} [options.fallbackColor] - Static color used when the strategy omits one.
 * @param {number} options.series - Original series index.
 * @param {GraphMode} options.mode - Rendering mode for the series.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {readonly [number, number]} options.xDomain - Resolved x-axis domain.
 * @param {readonly [number, number]} options.yDomain - Resolved y-axis domain.
 */
export const colorSeriesGraph = ({
  graph,
  emptySymbol,
  coloring,
  fallbackColor,
  series,
  mode,
  plotWidth,
  plotHeight,
  xDomain,
  yDomain,
}: {
  graph: Graph;
  emptySymbol: string;
  coloring: ResolvedColoring;
  fallbackColor?: Color;
  series: number;
  mode: GraphMode;
  plotWidth: number;
  plotHeight: number;
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
}) => {
  graph.forEach((row, graphY) => {
    row.forEach((symbol, graphX) => {
      if (symbol === emptySymbol) return;
      const context = getColorContext({
        series,
        mode,
        plotX: graphX - 1,
        plotY: graphY - 1,
        plotWidth,
        plotHeight,
        xDomain,
        yDomain,
      });
      const dynamicColor = getDynamicColor(coloring, context, xDomain, yDomain);
      row[graphX] = colorizeSymbol(symbol, dynamicColor ?? fallbackColor);
    });
  });
};
