import { Graph } from '@types';
import { toEmpty } from '@helpers/coordinates';

/**
 * Places a symbol at a graph position.
 * @param {object} options - Options for placing the symbol.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {number} options.scaledX - Target graph column.
 * @param {number} options.scaledY - Target graph row.
 * @param {string} options.symbol - Symbol to place in the graph.
 * @param {boolean} [options.debugMode] - Whether out-of-bounds writes are logged.
 */
export const drawPosition = ({
  graph,
  scaledX,
  scaledY,
  symbol,
  debugMode = false,
}: {
  graph: Graph;
  scaledX: number;
  scaledY: number;
  symbol: string;
  debugMode?: boolean;
}) => {
  if (debugMode) {
    if (scaledY >= graph.length || scaledY < 0) {
      console.log(`Drawing at [${scaledX}, ${scaledY}]`, 'Error: out of bounds Y', {
        graph,
        scaledX,
        scaledY,
      });
      return;
    }

    if (scaledX >= graph[scaledY].length || scaledX < 0) {
      console.log(`Drawing at [${scaledX}, ${scaledY}]`, 'Error: out of bounds X', {
        graph,
        scaledX,
        scaledY,
      });
      return;
    }
  }

  try {
    graph[scaledY][scaledX] = symbol;
  } catch (error) {
    // Preserve non-debug drawing semantics: ignore out-of-bounds writes.
  }
};

/**
 * Initializes an empty graph for given plot dimensions.
 * @param {object} options - Options for initializing the graph.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {number} options.plotHeight - Height of the plot area.
 * @param {string} options.emptySymbol - Symbol used to fill each graph cell.
 * @returns {Graph} - Empty graph matrix with border rows and columns.
 */
export const drawGraph = ({
  plotWidth,
  plotHeight,
  emptySymbol,
}: {
  plotWidth: number;
  plotHeight: number;
  emptySymbol: string;
}) => {
  const createRow = () => toEmpty(plotWidth + 2, emptySymbol);
  return Array.from({ length: plotHeight + 2 }, createRow);
};

/**
 * Renders graph matrix as chart output.
 * @param {object} options - Object containing the graph to render.
 * @param {Graph} options.graph - Graph matrix to render.
 * @returns {string} - Rendered chart surrounded by newlines.
 */
export const drawChart = ({ graph }: { graph: Graph }) =>
  `\n${graph.map((line) => line.join('')).join('\n')}\n`;

/**
 * Adds graph padding required by axis labels.
 * @param {object} options - Options for applying graph padding.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {number} options.plotWidth - Width of the plot area.
 * @param {string} options.emptySymbol - Symbol used to fill padding cells.
 * @param {number[][]} options.scaledCoords - Scaled coordinates used to detect label spacing.
 * @param {number} options.xShift - Width of the longest formatted x-axis label.
 * @param {number} options.yShift - Width of the longest formatted y-axis label.
 * @returns {object} - Applied graph shifts and whether an extra row was required.
 */
export const drawShift = ({
  graph,
  plotWidth,
  emptySymbol,
  scaledCoords,
  xShift,
  yShift,
}: {
  graph: Graph;
  plotWidth: number;
  emptySymbol: string;
  scaledCoords: number[][];
  xShift: number;
  yShift: number;
}) => {
  let realYShift = 1;
  graph.push(toEmpty(plotWidth + 2, emptySymbol));

  let step = plotWidth;
  scaledCoords.forEach(([x], index) => {
    if (scaledCoords[index - 1]) {
      const current = x - scaledCoords[index - 1][0];
      step = current <= step ? current : step;
    }
  });

  const hasToBeMoved = step < xShift;
  if (hasToBeMoved) {
    realYShift += 1;
    graph.push(toEmpty(plotWidth + 1, emptySymbol));
  }

  const realXShift = yShift + 1;

  graph.forEach((line) => {
    for (let i = 0; i <= yShift; i++) {
      line.unshift(emptySymbol);
    }
  });

  return { hasToBeMoved, realYShift, realXShift };
};
