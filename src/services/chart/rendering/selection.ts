import { ChartSpec } from '@types';
import { getColoringLegendColor } from '@services/plot/rendering/coloring';

const selectById = <T extends { id: string }>(
  items: readonly T[],
  selection: boolean | readonly string[] | undefined,
  defaultAll: boolean,
): T[] => {
  if (selection === false || (selection === undefined && !defaultAll)) return [];
  if (Array.isArray(selection)) {
    const byId = new Map(items.map((item) => [item.id, item]));
    return selection.map((id) => byId.get(id)!);
  }
  return [...items];
};

/**
 * Resolves legend settings.
 * @param {ChartSpec} spec - The spec.
 * @returns {{ legend: { position: LegendPosition; series: string[]; points: string[]; thresholds: string[]; color: "ansiRed" | "ansiGreen" | "ansiBlack" | "ansiYellow" | "ansiBlue" | "ansiMagenta" | "ansiCyan" | "ansiWhite" | "ansiBrightBlack" | "ansiBrightRed" | "ansiBrightGreen" | "ansiBrightYellow" | "ansiBrightBlue" | "ansiBrightMagenta" | "ansiBrightCyan" | "ansiBrightWhite" | undefined; } | undefined; legendInput: [number, number][][]; legendPoints: { x: number; y: number; color: "ansiRed" | "ansiGreen" | "ansiBlack" | "ansiYellow" | "ansiBlue" | "ansiMagenta" | "ansiCyan" | "ansiWhite" | "ansiBrightBlack" | "ansiBrightRed" | "ansiBrightGreen" | "ansiBrightYellow" | "ansiBrightBlue" | "ansiBrightMagenta" | "ansiBrightCyan" | "ansiBrightWhite" | undefined; }[]; legendThresholds: { x: number | undefined; y: number | undefined; color: "ansiRed" | "ansiGreen" | "ansiBlack" | "ansiYellow" | "ansiBlue" | "ansiMagenta" | "ansiCyan" | "ansiWhite" | "ansiBrightBlack" | "ansiBrightRed" | "ansiBrightGreen" | "ansiBrightYellow" | "ansiBrightBlue" | "ansiBrightMagenta" | "ansiBrightCyan" | "ansiBrightWhite" | undefined; }[]; legendSeriesFillAreas: boolean[]; legendColors: ("ansiRed" | "ansiGreen" | "ansiBlack" | "ansiYellow" | "ansiBlue" | "ansiMagenta" | "ansiCyan" | "ansiWhite" | "ansiBrightBlack" | "ansiBrightRed" | "ansiBrightGreen" | "ansiBrightYellow" | "ansiBrightBlue" | "ansiBrightMagenta" | "ansiBrightCyan" | "ansiBrightWhite" | undefined)[]; }} - Computed result.
 */
export const resolveLegendSettings = (spec: ChartSpec) => {
  const selectedSeries = spec.legend ? selectById(spec.series, spec.legend.series, true) : [];
  const selectedPoints = spec.legend
    ? selectById(spec.points ?? [], spec.legend.points, false)
    : [];
  const selectedThresholds = spec.legend
    ? selectById(spec.thresholds ?? [], spec.legend.thresholds, false)
    : [];
  const hasItems =
    selectedSeries.length > 0 || selectedPoints.length > 0 || selectedThresholds.length > 0;

  return {
    legend:
      spec.legend && hasItems
        ? {
            position: spec.legend.position,
            series: selectedSeries.map((series) => series.name ?? series.id),
            points: selectedPoints.map((point) => point.name ?? point.id),
            thresholds: selectedThresholds.map((threshold) => threshold.name ?? threshold.id),
            color: spec.legend.color,
          }
        : undefined,
    legendInput: selectedSeries.map((series) =>
      series.data.flatMap(([x, y]) => (y === null ? [] : [[x, y] as [number, number]])),
    ),
    legendPoints: selectedPoints.map(({ x, y, color }) => ({ x, y, color })),
    legendThresholds: selectedThresholds.map(({ x, y, color }) => ({ x, y, color })),
    legendSeriesFillAreas: selectedSeries.map((series) => series.fillArea ?? false),
    legendColors: selectedSeries.map(
      (series) => series.color ?? getColoringLegendColor(series.coloring),
    ),
  };
};
