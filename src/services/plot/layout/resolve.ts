import { Formatter, MultiLine, Settings } from '@types';
import { toDisplayTokens } from '@helpers/terminal-text';
import { getChartSize, getLabelShift, getSymbols } from '@services/plot/defaults';
import { getTransformLabel } from '@services/plot/overrides/formatting';
import type { SeriesRenderSettings } from '@services/plot/rendering/types';

import {
  getTerminalColumns,
  measureLegendWidth,
  resolveAspectHeight,
  resolveAutoPlotWidth,
  resolveLegendPosition,
  resolveXAxisTickLayout,
} from './adaptive';

import type { PlotLayoutSettings } from './types';

const countLabels = (labels: string | string[] | undefined): number =>
  labels === undefined ? 0 : Array.isArray(labels) ? labels.length : 1;

const measureLegendHeight = (legend: Settings['legend']): number => {
  if (!legend || (legend.position !== 'top' && legend.position !== 'bottom')) return 0;
  const seriesCount = countLabels(legend.series);
  const thresholdCount = countLabels(legend.thresholds);
  const pointCount = countLabels(legend.points);
  return (
    seriesCount +
    (thresholdCount > 0 ? thresholdCount + 1 : 0) +
    (pointCount > 0 ? pointCount + 1 : 0)
  );
};

const resolveAdaptiveTicks = ({
  customXAxisTicks,
  collisionPolicy,
  tickInput,
  plotWidth,
  expansionX,
  expansionY,
  transformLabel,
  xTickPath,
  ellipsis,
}: {
  customXAxisTicks: Settings['customXAxisTicks'];
  collisionPolicy: NonNullable<Settings['xAxis']>['labelCollision'];
  tickInput: MultiLine;
  plotWidth: number;
  expansionX: number[];
  expansionY: number[];
  transformLabel: Formatter;
  xTickPath: string;
  ellipsis: string | undefined;
}) => {
  const tickCandidates =
    customXAxisTicks ??
    (collisionPolicy
      ? [...new Set(tickInput.flatMap((line) => line.map(([x]) => x)))].sort(
          (left, right) => left - right,
        )
      : undefined);
  if (!collisionPolicy || !tickCandidates?.length) return undefined;
  return resolveXAxisTickLayout({
    ticks: tickCandidates,
    width: plotWidth,
    xDomain: expansionX as [number, number],
    yDomain: expansionY as [number, number],
    formatter: transformLabel,
    policy: collisionPolicy,
    path: xTickPath,
    ellipsis,
  });
};

const getYLabelWidth = (yLabel: string | undefined): number =>
  yLabel ? Math.max(0, ...toDisplayTokens(yLabel).map(({ width: tokenWidth }) => tokenWidth)) : 0;

const getSeriesTicks = (
  seriesSettings: readonly SeriesRenderSettings[] | undefined,
  ticks: number[] | undefined,
): number[] | undefined => (seriesSettings ? ticks : undefined);

const resolveLegendLayout = ({
  legend,
  width,
  terminalColumns,
  baseOverhead,
  initialPlotWidth,
}: {
  legend: Settings['legend'];
  width: Settings['width'];
  terminalColumns: number;
  baseOverhead: number;
  initialPlotWidth: number;
}) => {
  const legendWidth = measureLegendWidth(legend);
  const fixedPlotWidth =
    width === 'auto' ? Math.min(60, Math.max(1, terminalColumns - baseOverhead)) : initialPlotWidth;
  const position = resolveLegendPosition({
    position: legend?.position ?? 'bottom',
    terminalColumns,
    fixedPlotWidth,
    baseOverhead,
    legendWidth,
  });
  return {
    legendWidth,
    position,
    resolvedLegend: legend ? { ...legend, position } : undefined,
  };
};

const resolvePlotHeight = ({
  height,
  width,
  aspectRatio,
  terminalColumns,
  plotWidth,
  initialPlotHeight,
  verticalOverhead,
}: {
  height: number | undefined;
  width: Settings['width'];
  aspectRatio: number | undefined;
  terminalColumns: number;
  plotWidth: number;
  initialPlotHeight: number;
  verticalOverhead: number;
}): number => {
  if (height !== undefined) return height;
  if (width === 'auto') {
    return resolveAspectHeight(terminalColumns, aspectRatio ?? 2, verticalOverhead);
  }
  if (aspectRatio !== undefined) return resolveAspectHeight(plotWidth, aspectRatio);
  return initialPlotHeight;
};

/**
 * Resolves plot layout.
 * @param {MultiLine} input - The input.
 * @param {object} options1 - Structured options1.
 * @returns {{ xShift: number; yShift: number; resolvedLegend: { position: "left" | "right" | "top" | "bottom"; series?: string | string[] | undefined; points?: string | string[] | undefined; thresholds?: string | string[] | undefined; color?: "ansiRed" | "ansiGreen" | "ansiBlack" | "ansiYellow" | "ansiBlue" | "ansiMagenta" | "ansiCyan" | "ansiWhite" | "ansiBrightBlack" | "ansiBrightRed" | "ansiBrightGreen" | "ansiBrightYellow" | "ansiBrightBlue" | "ansiBrightMagenta" | "ansiBrightCyan" | "ansiBrightWhite" | undefined; } | undefined; plotWidth: number; plotHeight: number; xTickLabelLayout: XTickLabelLayout[] | undefined; resolvedXAxisTicks: number[] | undefined; axisSymbols: { n: string; ns: string; y: string; nse: string; nsw: string; x: string; we: string; e: string; intersectionXY: string; intersectionX: string; intersectionY: string; y2: string; }; emptySymbol: string; backgroundSymbol: string; borderSymbol: string | undefined; thresholdSymbols: { x: string; y: string; }; pointSymbol: string; transformLabel: Formatter; tickInput: MultiLine; minX: number; minY: number; expansionX: number[]; expansionY: number[]; }} - Computed result.
 */
export const resolvePlotLayout = (
  input: MultiLine,
  {
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
    rightOverhead,
  }: PlotLayoutSettings,
) => {
  const transformLabel = getTransformLabel({ formatter });
  const tickInput = axisInput ?? dataInput ?? input;
  const terminalColumns = getTerminalColumns();
  const initialSize = getChartSize({
    width: width === 'auto' ? terminalColumns : width,
    height,
    input: tickInput,
    xRange,
    yRange,
    axisCenter,
  });
  const { minX, minY, expansionX, expansionY } = initialSize;
  const resolvedSymbols = getSymbols({ symbols });
  const { xShift, yShift } = getLabelShift({
    input: tickInput,
    transformLabel,
    showTickLabel,
    expansionX,
    expansionY,
    minX,
    xTickValues: getSeriesTicks(seriesSettings, customXAxisTicks),
    yTickValues: getSeriesTicks(seriesSettings, customYAxisTicks),
  });
  const yLabelWidth = getYLabelWidth(yLabel);
  const baseOverhead =
    yShift + 3 + yLabelWidth + rightOverhead + (resolvedSymbols.borderSymbol ? 2 : 0);
  const {
    legendWidth,
    position: legendPosition,
    resolvedLegend,
  } = resolveLegendLayout({
    legend,
    width,
    terminalColumns,
    baseOverhead,
    initialPlotWidth: initialSize.plotWidth,
  });
  const plotWidth =
    width === 'auto'
      ? resolveAutoPlotWidth({ terminalColumns, baseOverhead, legendPosition, legendWidth })
      : initialSize.plotWidth;
  const collisionPolicy = xAxis?.labelCollision ?? (width === 'auto' ? 'hide' : undefined);
  const xTickLabelLayout = resolveAdaptiveTicks({
    customXAxisTicks,
    collisionPolicy,
    tickInput,
    plotWidth,
    expansionX,
    expansionY,
    transformLabel,
    xTickPath,
    ellipsis: symbols?.ellipsis,
  });
  const adaptiveLabelOverhead = Math.max(
    0,
    ...(xTickLabelLayout ?? []).map(({ lines }) => lines.length - 1),
  );
  const autoVerticalOverhead =
    3 +
    (title ? 1 : 0) +
    (xLabel ? 1 : 0) +
    (resolvedSymbols.borderSymbol ? 2 : 0) +
    measureLegendHeight(resolvedLegend) +
    adaptiveLabelOverhead;
  const plotHeight = resolvePlotHeight({
    height,
    width,
    aspectRatio,
    terminalColumns,
    plotWidth,
    initialPlotHeight: initialSize.plotHeight,
    verticalOverhead: autoVerticalOverhead,
  });

  return {
    transformLabel,
    tickInput,
    minX,
    minY,
    expansionX,
    expansionY,
    ...resolvedSymbols,
    xShift,
    yShift,
    resolvedLegend,
    plotWidth,
    plotHeight,
    xTickLabelLayout,
    resolvedXAxisTicks: xTickLabelLayout
      ? xTickLabelLayout.map(({ value }) => value)
      : customXAxisTicks,
  };
};
