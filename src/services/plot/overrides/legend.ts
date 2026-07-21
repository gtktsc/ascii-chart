import { THRESHOLDS } from '@constants';
import { Legend } from '@types';
import { colorizeSymbol, getChartSymbols } from '@helpers/colors';
import { normalize, toArray, toEmpty } from '@helpers/coordinates';
import { resolveSymbols } from '@helpers/symbols';
import { drawPosition } from '@services/plot/draw/position';

import type { AddLegendOptions, LegendContext, LegendEntry } from './types';

const getLegendEntries = (legend: Legend): LegendEntry[] => {
  const series = legend.series ? normalize(legend.series) : [];
  const points = legend.points ? normalize(legend.points) : [];
  const thresholds = legend.thresholds ? normalize(legend.thresholds) : [];
  return [
    ...series.map((label, index) => ({ type: 'series' as const, label, index })),
    ...(thresholds.length > 0 ? [{ type: 'spacer' as const }] : []),
    ...thresholds.map((label, index) => ({ type: 'threshold' as const, label, index })),
    ...(points.length > 0 ? [{ type: 'spacer' as const }] : []),
    ...points.map((label, index) => ({ type: 'point' as const, label, index })),
  ];
};

const getLegendSymbol = (
  entry: Exclude<LegendEntry, { type: 'spacer' }>,
  context: LegendContext,
) => {
  if (entry.type === 'point') {
    return colorizeSymbol(context.pointSymbol, context.points?.[entry.index]?.color);
  }
  if (entry.type === 'threshold') {
    return colorizeSymbol(context.thresholdSymbol, context.thresholds?.[entry.index]?.color);
  }
  return getChartSymbols(
    context.color,
    entry.index,
    context.symbols?.chart,
    context.input,
    context.seriesFillAreas?.[entry.index] ?? context.fillArea,
  ).area;
};

const makeLabelRow = (entry: LegendEntry, context: LegendContext): string[] => {
  if (entry.type === 'spacer') return Array(context.width).fill(context.backgroundSymbol);
  const labelText = toArray(entry.label).map((cell) => colorizeSymbol(cell, context.labelColor));
  const padding = Array(context.width - labelText.length - 2).fill(context.backgroundSymbol);
  return [getLegendSymbol(entry, context), context.backgroundSymbol, ...labelText, ...padding];
};

const addSideLegend = (context: LegendContext, position: 'left' | 'right'): void => {
  const rows = context.entries.map((entry) => makeLabelRow(entry, context));
  if (position === 'right') {
    context.graph.forEach((row) => {
      for (let column = 0; column < context.width + 2; column++) {
        row.push(context.backgroundSymbol);
      }
    });
  }
  for (let rowIndex = 0; rowIndex < context.graph.length; rowIndex++) {
    const label = rows[rowIndex];
    if (position === 'left') {
      for (let column = context.width - 1; column >= 0; column--) {
        context.graph[rowIndex].unshift(label?.[column] ?? context.backgroundSymbol);
      }
    } else if (label) {
      for (let column = 0; column < context.width; column++) {
        context.graph[rowIndex][context.graph[rowIndex].length - context.width + column] =
          label[column];
      }
    }
  }
};

const drawLegendRow = (context: LegendContext, entry: LegendEntry, atTop: boolean): void => {
  const line = makeLabelRow(entry, context);
  const empty = toEmpty(Math.max(context.graph[0].length, context.width), context.backgroundSymbol);
  if (atTop) context.graph.unshift(empty);
  else context.graph.push(empty);
  const row = atTop ? 0 : context.graph.length - 1;
  for (let column = 0; column < line.length; column++) {
    drawPosition({
      debugMode: context.debugMode,
      graph: context.graph,
      scaledX: column,
      scaledY: row,
      symbol: line[column],
    });
  }
};

const addHorizontalLegend = (context: LegendContext, position: 'top' | 'bottom'): void => {
  const entries = position === 'top' ? context.entries.slice().reverse() : context.entries;
  entries.forEach((entry) => drawLegendRow(context, entry, position === 'top'));
};

/**
 * Adds legend.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {Legend} options.legend - The legend.
 * @param {string} options.backgroundSymbol - The background symbol.
 * @param {Colors | Array<Color | undefined>} options.color - The color.
 * @param {Symbols} options.symbols - The symbols.
 * @param {boolean} options.fillArea - The fill area.
 * @param {MultiLine} options.input - The input.
 * @param {string} options.pointSymbol - The point symbol.
 * @param {boolean} options.debugMode - The debug mode.
 * @param {GraphPoint[]} options.points - The points.
 * @param {Threshold[]} options.thresholds - The thresholds.
 * @param {boolean[]} options.seriesFillAreas - The series fill areas.
 * @param {Color} options.labelColor - The label color.
 */
export const addLegend = ({
  graph,
  legend,
  backgroundSymbol,
  color,
  symbols,
  fillArea,
  input,
  pointSymbol,
  debugMode,
  points,
  thresholds,
  seriesFillAreas,
  labelColor,
}: AddLegendOptions): void => {
  const entries = getLegendEntries(legend);
  const width =
    2 +
    Math.max(
      ...entries.map((entry) => (entry.type === 'spacer' ? 0 : toArray(entry.label).length)),
    );
  const context: LegendContext = {
    graph,
    legend,
    backgroundSymbol,
    color,
    symbols,
    fillArea,
    input,
    pointSymbol,
    debugMode,
    points,
    thresholds,
    seriesFillAreas,
    labelColor,
    entries,
    width,
    thresholdSymbol: resolveSymbols(THRESHOLDS, symbols?.thresholds).y,
  };
  if (legend.position === 'left' || legend.position === 'right') {
    addSideLegend(context, legend.position);
    return;
  }
  addHorizontalLegend(context, legend.position === 'top' ? 'top' : 'bottom');
};
