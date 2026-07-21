import { Coordinates, Graph, MultiLine } from '@types';
import { drawAnnotations } from '@services/chart/annotations/draw';
import { toTerminalCellCoordinate } from '@services/renderers/braille';

import { drawPreparedBars } from './bars/drawing';
import { drawBarValueLabels } from './bars/labels';
import { BarLabelAnchor, BarLabelCandidate } from './bars/types';
import { getInput } from './defaults';
import { drawAxis, drawAxisCenter } from './draw/axis';
import { drawChart, drawShift } from './draw/position';
import { drawSecondaryYAxis, measureSecondaryYAxisWidth } from './draw/secondary-y-axis';
import { drawTicks } from './draw/ticks';
import { resolvePlotLayout } from './layout/resolve';
import { createCellPriorities, createRenderSurface } from './layout/surface';
import { addBackgroundSymbol, removeEmptyLines } from './overrides/layout';
import { addPoints, addThresholds } from './overrides/overlays';
import { renderDataSeries } from './rendering/data-series';
import { addPlotDecorations } from './rendering/decorations';

import type { InternalPlotSettings, PlotState, SecondaryYAxisSettings } from './types';

const prepareRenderInput = (
  rawInput: Coordinates,
  {
    yRange,
    seriesSettings,
    xRange,
    barSegments,
  }: Pick<InternalPlotSettings, 'yRange' | 'seriesSettings' | 'xRange' | 'barSegments'>,
): MultiLine | undefined => {
  let input = getInput({ rawInput });
  if (yRange && !seriesSettings) {
    const [yMin, yMax] = yRange;
    input = input.map((line) => line.filter(([, y]) => y >= yMin && y <= yMax));
  }
  const isEmpty =
    (seriesSettings && !input.some((line) => line.length) && !(xRange && yRange)) ||
    (!seriesSettings && input.length === 0 && !barSegments?.length);
  return isEmpty ? undefined : input;
};

const measureSecondaryAxis = (
  secondaryYAxis: SecondaryYAxisSettings | undefined,
  xRange: readonly [number, number] | undefined,
): number =>
  secondaryYAxis && xRange
    ? measureSecondaryYAxisWidth({
        axis: secondaryYAxis.axis,
        xDomain: xRange,
        yDomain: secondaryYAxis.domain,
        ticks: secondaryYAxis.ticks,
      })
    : 0;

const resolvePlotState = (
  rawInput: Coordinates,
  settings: InternalPlotSettings,
): PlotState | undefined => {
  const input = prepareRenderInput(rawInput, settings);
  if (!input) return undefined;
  const {
    width,
    height,
    aspectRatio,
    dataInput,
    axisInput,
    xRange,
    yRange,
    axisCenter,
    formatter,
    symbols,
    showTickLabel,
    customXAxisTicks,
    customYAxisTicks,
    seriesSettings,
    title,
    xLabel,
    yLabel,
    legend,
    xAxis,
    xTickPath = 'settings.xAxis.ticks',
    secondaryYAxis,
  } = settings;
  const layout = resolvePlotLayout(input, {
    width,
    height,
    aspectRatio,
    dataInput,
    axisInput,
    xRange,
    yRange,
    axisCenter,
    formatter,
    symbols,
    showTickLabel,
    customXAxisTicks,
    customYAxisTicks,
    seriesSettings,
    title,
    xLabel,
    yLabel,
    legend,
    xAxis,
    xTickPath,
    rightOverhead: measureSecondaryAxis(secondaryYAxis, xRange),
  });
  return { input, settings, layout };
};

const resolveBarLabel = (
  {
    mode,
    layout,
    categoryPosition,
    startPosition,
    endPosition,
    direction,
    cells,
    groupBounds,
    preferredGroupSide,
  }: BarLabelAnchor,
  subcellWidth: number,
  subcellHeight: number,
): BarLabelCandidate => {
  const categoryScale = mode === 'bar' ? subcellWidth : subcellHeight;
  const valueScale = mode === 'bar' ? subcellHeight : subcellWidth;
  const category = toTerminalCellCoordinate(categoryPosition, categoryScale);
  const end = toTerminalCellCoordinate(endPosition, valueScale);
  if (mode === 'horizontalBar' && layout === 'stacked') {
    const start = toTerminalCellCoordinate(startPosition, valueScale);
    const center = Math.round((start + end) / 2);
    return { x: center - Math.floor(cells.length / 2), y: category - 1, cells };
  }
  if (mode === 'bar') {
    const candidate = { x: category - Math.floor(cells.length / 2), y: end + direction, cells };
    const [groupStart, groupEnd] = groupBounds
      ? groupBounds.map((coordinate) => toTerminalCellCoordinate(coordinate, categoryScale))
      : [category, category];
    const left = { x: groupStart - cells.length, y: end };
    const right = { x: groupEnd + 1, y: end };
    const innerLeft = { ...left, y: end - direction };
    const innerRight = { ...right, y: end - direction };
    const preferLeft = preferredGroupSide === 'left';
    return {
      ...candidate,
      alternatives: preferLeft
        ? [left, right, innerLeft, innerRight]
        : [right, left, innerRight, innerLeft],
    };
  }
  return {
    x: direction > 0 ? end + 1 : end - cells.length,
    y: category,
    cells,
  };
};

const shiftBarLabel = (label: BarLabelCandidate, xShift: number): BarLabelCandidate => ({
  ...label,
  x: label.x + xShift,
  alternatives: label.alternatives?.map(({ x, y }) => ({ x: x + xShift, y })),
});

const drawDataOverlays = (
  { settings, layout }: PlotState,
  {
    graph,
    axis,
    width,
    height,
    cellPriorities,
  }: {
    graph: Graph;
    axis: { x: number; y: number };
    width: number;
    height: number;
    cellPriorities?: number[][];
  },
): void => {
  const { thresholds, points, debugMode } = settings;
  const { thresholdSymbols, pointSymbol, expansionX, expansionY } = layout;
  if (thresholds) {
    addThresholds({
      thresholdSymbols,
      debugMode,
      graph,
      thresholds,
      axis,
      plotWidth: width,
      plotHeight: height,
      expansionX,
      expansionY,
      cellPriorities,
      priority: Number.MAX_SAFE_INTEGER,
    });
  }
  if (points) {
    addPoints({
      pointSymbol,
      debugMode,
      graph,
      points,
      plotWidth: width,
      plotHeight: height,
      expansionX,
      expansionY,
      cellPriorities,
      priority: Number.MAX_SAFE_INTEGER,
    });
  }
};

const renderDataLayers = ({ input, settings, layout }: PlotState) => {
  const {
    renderer = 'ascii',
    axisCenter,
    color,
    coloring,
    mode = 'line',
    interpolation,
    fillArea,
    lineFormatter,
    symbols,
    debugMode,
    seriesSettings,
    seriesIndexes,
    legendInput,
    dataInput,
    barSegments,
    valueLabels,
    barFormatterPath = 'settings.valueLabels.formatter.result',
    barLayoutPath = 'settings.barLayout',
  } = settings;
  const { plotWidth, plotHeight, emptySymbol, expansionX, expansionY, minX, minY } = layout;
  const { backend, renderWidth, renderHeight, renderGraph, axis, renderAxis, fillAxisPosition } =
    createRenderSurface({
      renderer,
      plotWidth,
      plotHeight,
      emptySymbol,
      axisCenter,
      expansionX,
      expansionY,
    });
  const cellPriorities = createCellPriorities(renderer, seriesSettings, barSegments, renderGraph);
  let scaledCoords = renderDataSeries({
    input,
    graph: renderGraph,
    plotWidth: renderWidth,
    plotHeight: renderHeight,
    emptySymbol,
    expansionX,
    expansionY,
    minX,
    minY,
    axis: renderAxis,
    fillAxisPosition,
    axisCenter,
    color,
    coloring,
    mode,
    interpolation,
    fillArea,
    lineFormatter,
    symbols,
    debugMode,
    seriesSettings,
    seriesIndexes,
    colorInput: legendInput,
    cellPriorities,
  });
  const preparedBars = barSegments?.length
    ? drawPreparedBars({
        graph: renderGraph,
        segments: barSegments,
        plotWidth: renderWidth,
        plotHeight: renderHeight,
        xRange: expansionX as [number, number],
        yRange: expansionY as [number, number],
        axis: renderAxis,
        axisCenter,
        symbols,
        color,
        colorInput: legendInput ?? dataInput ?? input,
        valueLabels,
        formatterPath: barFormatterPath,
        layoutPath: barLayoutPath,
        groupedSlotStride: { x: backend.subcellWidth, y: backend.subcellHeight },
        debugMode,
        cellPriorities,
      })
    : { scaledCoords: [], labels: [] };
  scaledCoords.push(...preparedBars.scaledCoords);
  drawDataOverlays(
    { input, settings, layout },
    {
      graph: renderGraph,
      axis: renderAxis,
      width: renderWidth,
      height: renderHeight,
      cellPriorities,
    },
  );

  const graph = backend.foldGraph(renderGraph, {
    plotWidth,
    plotHeight,
    emptySymbol,
    cellPriorities,
  });
  scaledCoords = scaledCoords.map(([x, y]) => [
    x / backend.subcellWidth,
    y / backend.subcellHeight,
  ]);
  const barLabels = preparedBars.labels.map((label) =>
    resolveBarLabel(label, backend.subcellWidth, backend.subcellHeight),
  );
  return { axis, barLabels, graph, scaledCoords };
};

const drawPlotAnnotations = ({ settings, layout }: PlotState, graph: Graph): void => {
  const { annotations, symbols } = settings;
  if (!annotations?.length) return;
  const { plotWidth, plotHeight, expansionX, expansionY, emptySymbol } = layout;
  const annotationOptions = {
    graph,
    annotations,
    plotWidth,
    plotHeight,
    xDomain: expansionX as [number, number],
    yDomain: expansionY as [number, number],
    emptySymbol,
    symbols: symbols?.annotations,
  };
  drawAnnotations({ ...annotationOptions, phase: 'background' });
  drawAnnotations({ ...annotationOptions, phase: 'foreground' });
};

const drawSecondaryAxis = (
  { settings, layout }: PlotState,
  graph: Graph,
  realXShift: number,
  axis: { y: number },
): void => {
  const { secondaryYAxis, axisCenter, hideXAxis, debugMode } = settings;
  if (!secondaryYAxis) return;
  const { plotWidth, plotHeight, backgroundSymbol, axisSymbols, expansionX } = layout;
  drawSecondaryYAxis({
    graph,
    plotWidth,
    plotHeight,
    realXShift,
    xAxisRow: axisCenter?.[1] !== undefined && !hideXAxis ? axis.y : undefined,
    backgroundSymbol,
    axisSymbols,
    axis: secondaryYAxis.axis,
    xDomain: expansionX as [number, number],
    yDomain: secondaryYAxis.domain,
    ticks: secondaryYAxis.ticks,
    debugMode,
  });
};

const drawAxesAndTicks = (state: PlotState, layers: ReturnType<typeof renderDataLayers>): void => {
  const { input, settings, layout } = state;
  const { graph, scaledCoords, barLabels, axis } = layers;
  const {
    hideXAxis,
    hideYAxis,
    axisCenter,
    xAxis,
    yAxis,
    debugMode,
    customYAxisTicks,
    hideYAxisTicks,
    hideXAxisTicks,
    showTickLabel,
  } = settings;
  const {
    plotWidth,
    plotHeight,
    emptySymbol,
    backgroundSymbol,
    axisSymbols,
    expansionX,
    expansionY,
    tickInput,
    yShift,
    xShift,
    resolvedXAxisTicks,
    transformLabel,
    xTickLabelLayout,
  } = layout;
  drawAxis({
    debugMode,
    graph,
    hideXAxis,
    hideYAxis,
    axisCenter,
    axisSymbols,
    axis,
    xColor: xAxis?.color,
    yColor: yAxis?.color,
  });
  const { realXShift } = drawShift({
    graph,
    plotWidth,
    emptySymbol,
    scaledCoords,
    xShift,
    yShift,
  });
  if (backgroundSymbol) {
    addBackgroundSymbol({ debugMode, graph, backgroundSymbol, emptySymbol });
  }
  drawAxisCenter({
    realXShift,
    debugMode,
    emptySymbol,
    backgroundSymbol,
    color: yAxis?.color ?? xAxis?.color,
    graph,
    axisSymbols,
    axis,
  });
  drawTicks({
    input: tickInput,
    graph,
    plotWidth,
    plotHeight,
    axis,
    axisCenter,
    yShift,
    emptySymbol,
    debugMode,
    hideXAxis,
    expansionX,
    expansionY,
    hideYAxis,
    customYAxisTicks,
    customXAxisTicks: resolvedXAxisTicks,
    hideYAxisTicks,
    hideXAxisTicks,
    showTickLabel,
    axisSymbols,
    transformLabel,
    xTickLabelLayout,
    labelBackgroundSymbol: backgroundSymbol,
    xColor: xAxis?.color,
    yColor: yAxis?.color,
  });
  drawSecondaryAxis(state, graph, realXShift, axis);
  drawBarValueLabels({
    graph,
    labels: barLabels.map((label) => shiftBarLabel(label, realXShift)),
    emptySymbol: backgroundSymbol,
  });
  removeEmptyLines({ graph, backgroundSymbol });
  addPlotDecorations({
    ...settings,
    graph,
    input,
    plotWidth,
    yShift,
    backgroundSymbol,
    pointSymbol: layout.pointSymbol,
    xLabelColor: xAxis?.color,
    yLabelColor: yAxis?.color,
    legend: layout.resolvedLegend,
    borderSymbol: layout.borderSymbol,
  });
};

/**
 * Renders plot.
 * @param {Coordinates} rawInput - The raw input.
 * @param {InternalSettings} settings - The settings.
 * @returns {string} - Computed result.
 */
export const renderPlot = (rawInput: Coordinates, settings: InternalPlotSettings = {}): string => {
  const state = resolvePlotState(rawInput, settings);
  if (!state) return '';
  const layers = renderDataLayers(state);
  drawPlotAnnotations(state, layers.graph);
  drawAxesAndTicks(state, layers);
  return drawChart({ graph: layers.graph });
};
