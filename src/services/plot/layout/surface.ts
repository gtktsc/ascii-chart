import { Graph, Settings } from '@types';
import { getAxisCenter } from '@helpers/coordinates';
import { BarSegment } from '@services/plot/bars/types';
import { drawGraph } from '@services/plot/draw/position';
import type { SeriesRenderSettings } from '@services/plot/rendering/types';
import { getRendererBackend } from '@services/renderers/backends';

/**
 * Creates render surface.
 * @param {object} options - Structured options.
 * @param {NonNullable<Settings['renderer']>} options.renderer - The renderer.
 * @param {number} options.plotWidth - The plot width.
 * @param {number} options.plotHeight - The plot height.
 * @param {string} options.emptySymbol - The empty symbol.
 * @param {Settings['axisCenter']} options.axisCenter - The axis center.
 * @param {number[]} options.expansionX - The expansion x.
 * @param {number[]} options.expansionY - The expansion y.
 * @returns {{ backend: RendererBackend; renderWidth: number; renderHeight: number; renderGraph: string[][]; axis: { x: number; y: number; }; renderAxis: { x: number; y: number; }; fillAxisPosition: { x: number; y: number; }; }} - Computed result.
 */
export const createRenderSurface = ({
  renderer,
  plotWidth,
  plotHeight,
  emptySymbol,
  axisCenter,
  expansionX,
  expansionY,
}: {
  renderer: NonNullable<Settings['renderer']>;
  plotWidth: number;
  plotHeight: number;
  emptySymbol: string;
  axisCenter: Settings['axisCenter'];
  expansionX: number[];
  expansionY: number[];
}) => {
  const backend = getRendererBackend(renderer);
  const renderWidth = plotWidth * backend.subcellWidth;
  const renderHeight = plotHeight * backend.subcellHeight;
  const renderGraph = drawGraph({ plotWidth: renderWidth, plotHeight: renderHeight, emptySymbol });
  const axis = getAxisCenter(axisCenter, plotWidth, plotHeight, expansionX, expansionY, [
    0,
    plotHeight + 1,
  ]);
  const renderAxis = getAxisCenter(axisCenter, renderWidth, renderHeight, expansionX, expansionY, [
    0,
    renderGraph.length - 1,
  ]);

  return {
    backend,
    renderWidth,
    renderHeight,
    renderGraph,
    axis,
    renderAxis,
    fillAxisPosition: {
      x: axis.x * backend.subcellWidth,
      y: axis.y * backend.subcellHeight,
    },
  };
};

/**
 * Creates cell priorities.
 * @param {NonNullable<Settings['renderer']>} renderer - The renderer.
 * @param {readonly SeriesRenderSettings[] | undefined} seriesSettings - The series settings.
 * @param {readonly BarSegment[] | undefined} barSegments - The bar segments.
 * @param {Graph} graph - The graph.
 * @returns {number[][] | undefined} - Computed result.
 */
export const createCellPriorities = (
  renderer: NonNullable<Settings['renderer']>,
  seriesSettings: readonly SeriesRenderSettings[] | undefined,
  barSegments: readonly BarSegment[] | undefined,
  graph: Graph,
): number[][] | undefined => {
  if (renderer !== 'braille' || !seriesSettings?.length) return undefined;
  const hasRegularBar = seriesSettings.some(
    ({ mode }) => mode === 'bar' || mode === 'horizontalBar',
  );
  const hasRegularNonBar = seriesSettings.some(
    ({ mode }) => mode !== 'bar' && mode !== 'horizontalBar',
  );
  const hasPreparedBar = Boolean(barSegments?.length);
  return (hasRegularBar && hasRegularNonBar) || hasPreparedBar
    ? graph.map((row) => row.map(() => -1))
    : undefined;
};
