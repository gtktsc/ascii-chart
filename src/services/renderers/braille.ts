import { Graph } from '@types';
import {
  BRAILLE_BASE,
  BRAILLE_CELL_HEIGHT,
  BRAILLE_CELL_WIDTH,
  BRAILLE_DOT_MASKS,
  LEADING_ANSI_PATTERN,
  TRAILING_ANSI_PATTERN,
} from '@constants/braille';
import { stripAnsi } from '@helpers/terminal-text';
import { drawGraph } from '@services/plot/draw/position';

export { BRAILLE_CELL_HEIGHT, BRAILLE_CELL_WIDTH } from '@constants/braille';

const applyStyle = (source: string, symbol: string): string => {
  if (stripAnsi(source) === source) return symbol;
  const prefix = LEADING_ANSI_PATTERN.exec(source)![0];
  const suffix = TRAILING_ANSI_PATTERN.exec(source)![0];
  return `${prefix}${symbol}${suffix}`;
};

/**
 * Folds a 2-by-4 subcell graph into Unicode Braille terminal cells.
 * @param {Graph} source - High-resolution graph containing occupied subcells.
 * @param {object} options - Target plot dimensions and empty-cell symbol.
 * @param {number} options.plotWidth - Target width in terminal cells.
 * @param {number} options.plotHeight - Target height in terminal cells.
 * @param {string} options.emptySymbol - Symbol used for unoccupied cells.
 * @param {number[][]} [options.cellPriorities] - Visibility and draw-order priority for each source subcell.
 * @returns {Graph} - Terminal-cell graph with ordinary padding rows and columns.
 */
export const foldBrailleGraph = (
  source: Graph,
  options: {
    plotWidth: number;
    plotHeight: number;
    emptySymbol: string;
    cellPriorities?: number[][];
  },
): Graph => {
  const { plotWidth, plotHeight, emptySymbol, cellPriorities } = options;
  const graph = drawGraph({ plotWidth, plotHeight, emptySymbol });
  const plainEmpty = stripAnsi(emptySymbol);

  for (let cellY = 0; cellY < plotHeight; cellY++) {
    for (let cellX = 0; cellX < plotWidth; cellX++) {
      const subcells: { mask: number; priority: number; symbol: string }[] = [];
      let highestPriority = Number.NEGATIVE_INFINITY;

      for (let dotY = 0; dotY < BRAILLE_CELL_HEIGHT; dotY++) {
        for (let dotX = 0; dotX < BRAILLE_CELL_WIDTH; dotX++) {
          const sourceY = cellY * BRAILLE_CELL_HEIGHT + dotY + 1;
          const sourceX = cellX * BRAILLE_CELL_WIDTH + dotX + 1;
          const symbol = source[sourceY]?.[sourceX];
          if (symbol === undefined || stripAnsi(symbol) === plainEmpty) continue;
          const priority = cellPriorities?.[sourceY]?.[sourceX] ?? 0;
          subcells.push({
            mask: BRAILLE_DOT_MASKS[dotY][dotX],
            priority,
            symbol,
          });
          highestPriority = Math.max(highestPriority, priority);
        }
      }

      if (subcells.length === 0) continue;
      let dots = 0;
      let styleSource: string | undefined;
      for (const subcell of subcells) {
        if (cellPriorities && subcell.priority !== highestPriority) continue;
        dots |= subcell.mask;
        styleSource = subcell.symbol;
      }
      const symbol = String.fromCodePoint(BRAILLE_BASE + dots);
      graph[cellY + 1][cellX + 1] = applyStyle(styleSource!, symbol);
    }
  }

  return graph;
};

/**
 * Converts a padded subcell coordinate back to its terminal-cell coordinate.
 * @param {number} coordinate - Coordinate in the renderer's padded graph.
 * @param {number} scale - Subcells represented by one terminal cell on this axis.
 * @returns {number} - Coordinate in the terminal-cell graph.
 */
export const toTerminalCellCoordinate = (coordinate: number, scale: number): number =>
  coordinate <= 0 ? coordinate : Math.floor((coordinate - 1) / scale) + 1;
