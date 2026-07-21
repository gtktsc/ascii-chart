import { POINT } from '@constants';
import { Graph } from '@types';
import { colorizeSymbol, getChartSymbols, getSeriesColor } from '@helpers/colors';
import { getPlotCoords, toPlot, toSorted } from '@helpers/coordinates';
import { drawGraph } from '@services/plot/draw/position';
import { drawCustomLine, drawLine, interpolateLinearPoints } from '@services/plot/draw/series';
import { setFillArea } from '@services/plot/overrides/layout';

import { colorSeriesGraph, resolveColoring } from './coloring';

import type {
  RenderDataSeriesOptions,
  SeriesDrawingContext,
  SeriesRenderSettings,
  SeriesState,
  SeriesStateOptions,
} from './types';

const compositeGraph = (
  target: Graph,
  layer: Graph,
  emptySymbol: string,
  cellPriorities: number[][] | undefined,
  priority: number,
) => {
  layer.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === emptySymbol) return;
      if (cellPriorities && priority < (cellPriorities[y]?.[x] ?? -1)) return;
      target[y][x] = symbol;
      if (cellPriorities?.[y]) cellPriorities[y][x] = priority;
    });
  });
};

const resolveConfiguredSeriesState = (
  options: SeriesStateOptions,
  colorSeries: number,
  setting: SeriesRenderSettings,
) => {
  const coloring = setting.coloring ?? resolveColoring(options.coloring, colorSeries);
  const resolvedFillArea = setting.fillArea ?? options.fillArea;
  return {
    colorSeries,
    setting,
    originalSeries: setting.seriesIndex ?? colorSeries,
    color: setting.color,
    coloring,
    mode: setting.mode ?? options.mode,
    interpolation: setting.interpolation ?? options.interpolation ?? 'step',
    fillArea: resolvedFillArea,
    lineFormatter: setting.lineFormatter ?? options.lineFormatter,
    yRange: setting.yRange,
    usesLayer:
      Number(Boolean(options.seriesSettings)) +
        Number(Boolean(coloring)) +
        Number(Boolean(resolvedFillArea)) >
      0,
  };
};

const resolveDefaultSeriesState = (options: SeriesStateOptions, colorSeries: number) => {
  const coloring = resolveColoring(options.coloring, colorSeries);
  return {
    colorSeries,
    setting: undefined,
    originalSeries: colorSeries,
    color: options.color,
    coloring,
    mode: options.mode,
    interpolation: options.interpolation ?? 'step',
    fillArea: options.fillArea,
    lineFormatter: options.lineFormatter,
    yRange: undefined,
    usesLayer:
      Number(Boolean(options.seriesSettings)) +
        Number(Boolean(coloring)) +
        Number(Boolean(options.fillArea)) >
      0,
  };
};

const resolveSeriesState = (options: SeriesStateOptions, series: number) => {
  const colorSeries = options.seriesIndexes?.[series] ?? series;
  const setting = options.seriesSettings?.[series];
  return setting
    ? resolveConfiguredSeriesState(options, colorSeries, setting)
    : resolveDefaultSeriesState(options, colorSeries);
};

const resolveFillAxis = (
  points: readonly (readonly [number, number])[],
  axis: { x: number; y: number },
): 'x' | 'y' => {
  const graphPoints = points.map(([x, y]) => [x + 1, y + 1] as const);
  const xValues = graphPoints.map(([x]) => x);
  const yValues = graphPoints.map(([, y]) => y);
  const crossesXAxis = Math.min(...yValues) < axis.y && Math.max(...yValues) > axis.y;
  if (!crossesXAxis) return 'x';

  const crossesYAxis = Math.min(...xValues) < axis.x && Math.max(...xValues) > axis.x;
  return crossesYAxis ? 'x' : 'y';
};

const resolvePointSymbol = (
  options: RenderDataSeriesOptions,
  state: SeriesState,
  pointSymbol: string,
): string => {
  if (!options.seriesSettings || state.coloring) return pointSymbol;
  return colorizeSymbol(pointSymbol, state.setting?.color);
};

const drawSeriesPoint = (
  coordinate: [number, number],
  index: number,
  coordinates: [number, number][],
  context: SeriesDrawingContext,
): number[] => {
  const { options, state } = context;
  const [scaledX, scaledY] = context.toPlotCoordinates(...coordinate);
  if (state.lineFormatter) {
    drawCustomLine({
      debugMode: options.debugMode,
      sortedCoords: context.sortedCoords,
      scaledX,
      scaledY,
      input: [context.sortedCoords],
      index,
      lineFormatter: state.lineFormatter,
      graph: context.seriesGraph,
      toPlotCoordinates: context.toPlotCoordinates,
      expansionX: options.expansionX,
      expansionY: context.seriesYRange,
      minY: context.seriesYRange[0],
      minX: options.minX,
    });
  } else {
    drawLine({
      mode: state.mode,
      debugMode: options.debugMode,
      index,
      arr: coordinates,
      graph: context.seriesGraph,
      scaledX,
      scaledY,
      plotHeight: options.plotHeight,
      emptySymbol: options.emptySymbol,
      chartSymbols: context.chartSymbols,
      axis: options.axis,
      axisCenter: options.axisCenter,
      pointSymbol: resolvePointSymbol(options, state, context.pointSymbol),
    });
  }
  return [scaledX, scaledY];
};

const applySeriesLayer = (context: SeriesDrawingContext, drawCoords: [number, number][]): void => {
  const { options, state, seriesGraph, chartSymbols, seriesYRange } = context;
  if (state.fillArea) {
    setFillArea({
      graph: seriesGraph,
      chartSymbols,
      axis: options.fillAxisPosition,
      fillAxis: resolveFillAxis(drawCoords, options.axis),
      debugMode: options.debugMode,
    });
  }
  if (state.coloring) {
    colorSeriesGraph({
      graph: seriesGraph,
      emptySymbol: options.emptySymbol,
      coloring: state.coloring,
      fallbackColor: getSeriesColor(
        state.color,
        options.seriesSettings ? 0 : state.colorSeries,
        options.colorInput ?? options.input,
      ),
      series: state.originalSeries,
      mode: state.mode,
      plotWidth: options.plotWidth,
      plotHeight: options.plotHeight,
      xDomain: options.expansionX as [number, number],
      yDomain: seriesYRange as [number, number],
    });
  }
  compositeGraph(
    options.graph,
    seriesGraph,
    options.emptySymbol,
    options.cellPriorities,
    state.originalSeries,
  );
};

const renderSingleSeries = (
  options: RenderDataSeriesOptions,
  series: number,
  pointSymbol: string,
) => {
  const state = resolveSeriesState(options, series);
  const usesLayer = state.usesLayer || Boolean(options.cellPriorities);
  const seriesGraph = usesLayer
    ? drawGraph({
        plotWidth: options.plotWidth,
        plotHeight: options.plotHeight,
        emptySymbol: options.emptySymbol,
      })
    : options.graph;
  const chartSymbols = getChartSymbols(
    state.coloring ? undefined : state.color,
    options.seriesSettings ? 0 : state.colorSeries,
    options.symbols?.chart,
    options.colorInput ?? options.input,
    state.fillArea,
  );
  const sortedCoords = toSorted(options.input[series]);
  const seriesYRange = state.yRange ? [...state.yRange] : options.expansionY;
  const scaledInput = getPlotCoords(
    sortedCoords,
    options.plotWidth,
    options.plotHeight,
    options.expansionX,
    seriesYRange,
  );
  const drawCoords =
    state.mode === 'line' && state.interpolation === 'linear' && !state.lineFormatter
      ? interpolateLinearPoints(scaledInput)
      : scaledInput;
  const context: SeriesDrawingContext = {
    options,
    state,
    seriesGraph,
    sortedCoords,
    seriesYRange,
    chartSymbols,
    pointSymbol,
    toPlotCoordinates: toPlot(options.plotWidth, options.plotHeight),
  };
  const scaledCoords = drawCoords.map((coordinate, index, coordinates) =>
    drawSeriesPoint(coordinate, index, coordinates, context),
  );
  if (usesLayer) applySeriesLayer(context, drawCoords);
  return scaledCoords;
};

/**
 * Renders all non-advanced series and returns their scaled coordinates.
 * @param {object} options - Options for rendering regular chart series.
 * @param {MultiLine} options.input - Normalized chart series.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {string} options.emptySymbol - Symbol identifying unoccupied cells.
 * @param {number[]} options.expansionX - Expanded x-axis range.
 * @param {number[]} options.expansionY - Expanded y-axis range.
 * @param {number} options.minX - Minimum x-value in the chart range.
 * @param {number} options.minY - Minimum y-value in the chart range.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {object} options.fillAxisPosition - Renderer-aligned fill baseline.
 * @param {Settings['axisCenter']} options.axisCenter - Effective custom axis intersection.
 * @param {Settings['color']} options.color - Static series color configuration.
 * @param {Settings['coloring']} options.coloring - Dynamic series coloring configuration.
 * @param {GraphMode} options.mode - Default series rendering mode.
 * @param {Settings['interpolation']} options.interpolation - Default line interpolation mode.
 * @param {Settings['fillArea']} options.fillArea - Whether line areas are filled.
 * @param {Settings['lineFormatter']} options.lineFormatter - Custom symbol formatter.
 * @param {Settings['symbols']} options.symbols - Custom chart symbols.
 * @param {Settings['debugMode']} options.debugMode - Whether drawing diagnostics are enabled.
 * @param {readonly SeriesRenderSettings[]} [options.seriesSettings] - Per-series rendering overrides.
 * @param {readonly number[]} [options.seriesIndexes] - Original indexes for filtered series.
 * @param {MultiLine} [options.colorInput] - Input passed to callback-based color settings.
 * @param {number[][]} [options.cellPriorities] - Draw-order priority for each renderer subcell.
 * @returns {number[][]} - Scaled coordinates for all rendered series.
 */
export const renderDataSeries = (options: RenderDataSeriesOptions): number[][] => {
  let scaledCoords = [[0, 0]];
  const pointSymbol = options.symbols?.point ?? POINT;
  for (let series = 0; series < options.input.length; series++) {
    const currentScaledCoords = renderSingleSeries(options, series, pointSymbol);
    scaledCoords = options.seriesSettings
      ? [...scaledCoords, ...currentScaledCoords]
      : currentScaledCoords;
  }
  return scaledCoords;
};
