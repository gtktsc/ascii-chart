import type { Renderer } from '@types';
import { BRAILLE_CELL_HEIGHT, BRAILLE_CELL_WIDTH } from '@constants/braille';

import { foldBrailleGraph } from './braille';

import type { RendererBackend } from './types';

const asciiBackend: RendererBackend = {
  subcellWidth: 1,
  subcellHeight: 1,
  foldGraph: (source) => source,
};

const brailleBackend: RendererBackend = {
  subcellWidth: BRAILLE_CELL_WIDTH,
  subcellHeight: BRAILLE_CELL_HEIGHT,
  foldGraph: foldBrailleGraph,
};

/**
 * Resolves immutable raster behavior for one validated renderer.
 * @param {Renderer} renderer - Selected plot-cell backend.
 * @returns {RendererBackend} - Raster scale and folding operation.
 */
export const getRendererBackend = (renderer: Renderer): RendererBackend =>
  renderer === 'braille' ? brailleBackend : asciiBackend;
