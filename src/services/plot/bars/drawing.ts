import { BarLayout, Graph, ValueLabelFormatter } from '@types';
import { FIRST_PLOT_ROW } from '@constants/layout';
import { colorizeSymbol, getChartSymbols, getSeriesColor } from '@helpers/colors';
import { scaler } from '@helpers/coordinates';
import { defaultFormatter } from '@helpers/formatting';
import { assertDisplayValue, toDisplayCells } from '@helpers/terminal-text';
import { rangeError } from '@services/errors';
import { drawPosition } from '@services/plot/draw/position';
import { getColorContext, getDynamicColor } from '@services/plot/rendering/coloring';

import {
  BarDrawingContext,
  BarLabelAnchor,
  BarMode,
  BarSegment,
  DrawPreparedBarsOptions,
} from './types';

const isStackedLayout = (layout: BarLayout) => layout === 'stacked' || layout === 'normalized';
const isInside = (value: number, domain: readonly [number, number]) =>
  value >= domain[0] && value <= domain[1];

const categoryKey = (mode: BarMode, category: number) => `${mode}:${category}`;

const getGroupedStarts = (
  segments: readonly BarSegment[],
  mode: BarMode,
  size: number,
  scale: (value: number) => number,
  slotStride: number,
  errorPath: string,
) => {
  const byCategory = new Map<number, number>();
  segments
    .filter((segment) => segment.layout === 'grouped' && segment.mode === mode)
    .forEach(({ category, slotCount }) => byCategory.set(category, slotCount));
  const blocks = [...byCategory].map(([category, count]) => {
    const span = (count - 1) * slotStride + 1;
    if (span > size) {
      rangeError(
        errorPath,
        'grouped bars do not fit; increase chart dimensions',
        'ERR_CHART_LAYOUT',
      );
    }
    const center = Math.round(scale(category));
    const idealStart = Math.round(center - (span - 1) / 2);
    const start = Math.max(0, Math.min(size - span, idealStart));
    return { category, start, end: start + span - 1 };
  });
  const ordered = [...blocks].sort((left, right) => left.start - right.start);
  for (let index = 1; index < ordered.length; index++) {
    if (ordered[index].start <= ordered[index - 1].end) {
      rangeError(errorPath, 'grouped bars overlap; increase chart dimensions', 'ERR_CHART_LAYOUT');
    }
  }
  return new Map(blocks.map(({ category, start }) => [categoryKey(mode, category), start]));
};

const drawRange = ({
  graph,
  from,
  to,
  fixed,
  vertical,
  symbol,
  debugMode,
  cellPriorities,
  priority,
}: {
  graph: Graph;
  from: number;
  to: number;
  fixed: number;
  vertical: boolean;
  symbol: string | ((position: number) => string);
  debugMode?: boolean;
  cellPriorities?: number[][];
  priority?: number;
}) => {
  const first = Math.min(from, to);
  const last = Math.max(from, to);
  for (let position = first; position <= last; position++) {
    const x = vertical ? fixed : position;
    const y = vertical ? position : fixed;
    if (priority !== undefined && priority < (cellPriorities?.[y]?.[x] ?? -1)) continue;
    drawPosition({
      graph,
      scaledX: x,
      scaledY: y,
      symbol: typeof symbol === 'function' ? symbol(position) : symbol,
      debugMode,
    });
    if (priority !== undefined && cellPriorities?.[y]) cellPriorities[y][x] = priority;
  }
};

const isVisibleSegment = (
  segment: BarSegment,
  xRange: readonly [number, number],
  yRange: readonly [number, number],
): boolean => {
  const isVertical = segment.mode === 'bar';
  const categoryDomain = isVertical ? xRange : yRange;
  const valueDomain = isVertical ? yRange : xRange;
  return (
    isInside(segment.category, categoryDomain) &&
    isInside(segment.end, valueDomain) &&
    (segment.layout === 'overlap' || isInside(segment.start, valueDomain))
  );
};

const resolveSegmentPosition = (segment: BarSegment, context: BarDrawingContext) => {
  const isVertical = segment.mode === 'bar';
  const categoryPosition = isVertical
    ? context.toX(segment.category)
    : context.toY(segment.category);
  const starts = isVertical ? context.verticalStarts : context.horizontalStarts;
  const groupedStart = starts.get(categoryKey(segment.mode, segment.category));
  const stride = isVertical ? context.groupedSlotStride.x : context.groupedSlotStride.y;
  const groupedPosition =
    groupedStart === undefined ? categoryPosition : groupedStart + segment.slotIndex * stride;
  const endPosition = isVertical ? context.toY(segment.end) : context.toX(segment.end);
  let startPosition = isVertical ? context.axis.y : context.axis.x;
  if (isStackedLayout(segment.layout)) {
    startPosition = isVertical ? context.toY(segment.start) : context.toX(segment.start);
  }
  const xAxisOffset = context.axisCenter?.[0] === undefined ? 1 : 0;
  const graphCategory = isVertical ? groupedPosition + xAxisOffset : groupedPosition + 1;
  return { isVertical, groupedStart, groupedPosition, endPosition, startPosition, graphCategory };
};

const resolveBarSymbol = (
  segment: BarSegment,
  context: BarDrawingContext,
  groupedPosition: number,
  isVertical: boolean,
) => {
  const chartSymbols = getChartSymbols(
    segment.coloring ? undefined : (segment.color ?? context.color),
    segment.color === undefined ? segment.seriesIndex : 0,
    context.symbols?.chart,
    context.colorInput,
  );
  if (!segment.coloring) return chartSymbols.area;
  return (position: number) => {
    const colorContext = getColorContext({
      series: segment.seriesIndex,
      mode: segment.mode,
      plotX: isVertical ? groupedPosition : position,
      plotY: isVertical ? position : groupedPosition,
      plotWidth: context.plotWidth,
      plotHeight: context.plotHeight,
      xDomain: context.xRange,
      yDomain: context.yRange,
    });
    const dynamicColor = getDynamicColor(
      segment.coloring!,
      colorContext,
      context.xRange,
      context.yRange,
    );
    const fallbackColor =
      segment.color ?? getSeriesColor(context.color, segment.seriesIndex, context.colorInput);
    return colorizeSymbol(chartSymbols.area, dynamicColor ?? fallbackColor);
  };
};

const createBarLabel = (
  segment: BarSegment,
  context: BarDrawingContext,
  position: ReturnType<typeof resolveSegmentPosition>,
): BarLabelAnchor | undefined => {
  if (!context.valueLabels) return undefined;
  const formatted = assertDisplayValue(
    context.labelFormatter(segment.value, {
      seriesIndex: segment.seriesIndex,
      seriesId: segment.seriesId,
      seriesName: segment.seriesName,
      datumIndex: segment.datumIndex,
      x: segment.x,
      y: segment.y,
      mode: segment.mode,
      layout: segment.layout,
    }),
    context.formatterPath,
  );
  const labelColor =
    typeof context.valueLabels === 'object' ? context.valueLabels.color : undefined;
  const cells = toDisplayCells(formatted).map((cell) =>
    cell ? colorizeSymbol(cell, labelColor) : cell,
  );
  const positive = segment.end >= segment.start;
  const groupOffset = position.graphCategory - position.groupedPosition;
  const groupStride = position.isVertical
    ? context.groupedSlotStride.x
    : context.groupedSlotStride.y;
  const groupBounds =
    segment.layout === 'grouped' && position.groupedStart !== undefined
      ? ([
          position.groupedStart + groupOffset,
          position.groupedStart + groupOffset + (segment.slotCount - 1) * groupStride,
        ] as const)
      : undefined;
  return {
    mode: segment.mode,
    layout: segment.layout,
    categoryPosition: position.graphCategory,
    startPosition: position.startPosition,
    endPosition: position.endPosition,
    direction: position.isVertical === positive ? -1 : 1,
    cells,
    groupBounds,
    preferredGroupSide: groupBounds && segment.slotIndex < segment.slotCount / 2 ? 'left' : 'right',
  };
};

const drawPreparedSegment = (
  segment: BarSegment,
  context: BarDrawingContext,
  scaledCoords: number[][],
  labels: BarLabelAnchor[],
): void => {
  const position = resolveSegmentPosition(segment, context);
  drawRange({
    graph: context.graph,
    from: position.isVertical
      ? Math.max(FIRST_PLOT_ROW, position.endPosition)
      : position.endPosition,
    to: position.isVertical
      ? Math.max(FIRST_PLOT_ROW, position.startPosition)
      : position.startPosition,
    fixed: position.graphCategory,
    vertical: position.isVertical,
    symbol: resolveBarSymbol(segment, context, position.groupedPosition, position.isVertical),
    debugMode: context.debugMode,
    cellPriorities: context.cellPriorities,
    priority: segment.seriesIndex,
  });
  scaledCoords.push(
    position.isVertical
      ? [position.groupedPosition, position.endPosition]
      : [position.endPosition, position.groupedPosition],
  );
  const label = createBarLabel(segment, context, position);
  if (label) labels.push(label);
};

/**
 * Draws prepared bar segments and returns label candidates for collision-aware placement.
 * @param {object} options - Options for rendering prepared bars.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {readonly BarSegment[]} options.segments - Prepared bar segments to render.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {readonly [number, number]} options.xRange - Resolved x-axis domain.
 * @param {readonly [number, number]} options.yRange - Resolved y-axis domain.
 * @param {object} options.axis - Scaled axis position in the graph.
 * @param {number} options.axis.x - X-coordinate of the y-axis.
 * @param {number} options.axis.y - Y-coordinate of the x-axis.
 * @param {MaybePoint} options.axisCenter - Effective x and y baselines.
 * @param {Symbols} [options.symbols] - Custom chart and axis symbols.
 * @param {Colors} [options.color] - Static series color configuration.
 * @param {MultiLine} options.colorInput - Input passed to callback-based color settings.
 * @param {ChartValueLabels} [options.valueLabels] - Bar value-label configuration.
 * @param {string} options.formatterPath - Validation path for value-label formatter results.
 * @param {string} options.layoutPath - Validation path for layout errors.
 * @param {object} [options.groupedSlotStride] - Renderer subcell stride for grouped bars.
 * @param {number} options.groupedSlotStride.x - Horizontal stride between grouped bars.
 * @param {number} options.groupedSlotStride.y - Vertical stride between grouped bars.
 * @param {boolean} [options.debugMode] - Whether drawing bounds diagnostics are enabled.
 * @param {number[][]} [options.cellPriorities] - Draw-order priority for each renderer subcell.
 * @returns {object} - Scaled bar coordinates and label placement candidates.
 */
export const drawPreparedBars = ({
  graph,
  segments,
  plotWidth,
  plotHeight,
  xRange,
  yRange,
  axis,
  axisCenter,
  symbols,
  color,
  colorInput,
  valueLabels,
  formatterPath,
  layoutPath,
  groupedSlotStride = { x: 1, y: 1 },
  debugMode,
  cellPriorities,
}: DrawPreparedBarsOptions): { scaledCoords: number[][]; labels: BarLabelAnchor[] } => {
  const scaleX = scaler([...xRange], [0, plotWidth - 1]);
  const scaleY = scaler([...yRange], [0, plotHeight - 1]);
  const toX = (value: number) => Math.round(scaleX(value));
  const toY = (value: number) => plotHeight - 1 - Math.round(scaleY(value));
  const visibleSegments = segments.filter((segment) => isVisibleSegment(segment, xRange, yRange));
  const verticalStarts = getGroupedStarts(
    visibleSegments,
    'bar',
    plotWidth,
    scaleX,
    groupedSlotStride.x,
    layoutPath,
  );
  const horizontalStarts = getGroupedStarts(
    visibleSegments,
    'horizontalBar',
    plotHeight,
    toY,
    groupedSlotStride.y,
    layoutPath,
  );
  const labels: BarLabelAnchor[] = [];
  const scaledCoords: number[][] = [];
  const labelFormatter: ValueLabelFormatter<number> =
    typeof valueLabels === 'object' && valueLabels.formatter
      ? valueLabels.formatter
      : (value: number) => defaultFormatter(value, { axis: 'y', xRange: [], yRange: [] });

  const context: BarDrawingContext = {
    graph,
    plotWidth,
    plotHeight,
    xRange,
    yRange,
    axis,
    axisCenter,
    symbols,
    color,
    colorInput,
    valueLabels,
    formatterPath,
    layoutPath,
    groupedSlotStride,
    debugMode,
    cellPriorities,
    toX,
    toY,
    verticalStarts,
    horizontalStarts,
    labelFormatter,
  };
  visibleSegments.forEach((segment) => drawPreparedSegment(segment, context, scaledCoords, labels));

  return { scaledCoords, labels };
};
