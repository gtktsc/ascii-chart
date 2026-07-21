import { getSeriesColor } from '@helpers/colors';
import { addXLabel, addYLabel, setTitle } from '@services/plot/overrides/labels';
import { addBorder, colorBackground } from '@services/plot/overrides/layout';
import { addLegend } from '@services/plot/overrides/legend';

import { getColoringLegendColor, resolveColoring } from './coloring';

import type { DecorationOptions } from './types';

/**
 * Adds plot decorations.
 * @param {object} options - Structured options.
 */
export const addPlotDecorations = ({
  graph,
  input,
  plotWidth,
  yShift,
  backgroundSymbol,
  pointSymbol,
  color,
  coloring,
  symbols,
  fillArea,
  debugMode,
  xLabel,
  yLabel,
  title,
  xLabelColor,
  yLabelColor,
  titleColor,
  legend,
  borderSymbol,
  borderColor,
  backgroundColor,
  points,
  thresholds,
  legendInput,
  legendPoints,
  legendThresholds,
  legendColors,
  legendSeriesFillAreas,
}: DecorationOptions): void => {
  if (xLabel) {
    addXLabel({
      debugMode,
      xLabel,
      graph,
      backgroundSymbol,
      plotWidth,
      yShift,
      color: xLabelColor,
    });
  }
  if (yLabel) {
    addYLabel({ debugMode, yLabel, graph, backgroundSymbol, color: yLabelColor });
  }
  if (legend) {
    const legendData = legendInput ?? input;
    const dynamicColors = coloring
      ? legendData.map(
          (_, series) =>
            getSeriesColor(color, series, legendData) ??
            getColoringLegendColor(resolveColoring(coloring, series)?.value),
        )
      : undefined;
    addLegend({
      points: legendPoints ?? points,
      thresholds: legendThresholds ?? thresholds,
      pointSymbol,
      debugMode,
      input: legendData,
      graph,
      legend,
      backgroundSymbol,
      color: legendColors ?? dynamicColors ?? color,
      symbols,
      fillArea,
      seriesFillAreas: legendSeriesFillAreas,
      labelColor: legend.color,
    });
  }
  if (title) {
    setTitle({
      debugMode,
      title,
      graph,
      backgroundSymbol,
      plotWidth,
      yShift,
      color: titleColor,
    });
  }
  if (borderSymbol) addBorder({ graph, borderSymbol, backgroundSymbol, color: borderColor });
  colorBackground({ graph, backgroundSymbol, color: backgroundColor });
};
