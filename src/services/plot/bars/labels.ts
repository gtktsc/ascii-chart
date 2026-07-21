import { Graph } from '@types';

import { BarLabelCandidate } from './types';

/**
 * Places complete labels at the first empty in-bounds candidate.
 * @param {object} options - Label placement options.
 * @param {Graph} options.graph - Graph matrix to modify.
 * @param {readonly BarLabelCandidate[]} options.labels - Ordered label candidates.
 * @param {string} options.emptySymbol - Symbol marking an available cell.
 */
export const drawBarValueLabels = ({
  graph,
  labels,
  emptySymbol,
}: {
  graph: Graph;
  labels: readonly BarLabelCandidate[];
  emptySymbol: string;
}) => {
  labels.forEach(({ x, y, cells, alternatives = [] }) => {
    const placement = [{ x, y }, ...alternatives].find(
      ({ x: candidateX, y: candidateY }) =>
        candidateY >= 0 &&
        candidateY < graph.length &&
        candidateX >= 0 &&
        candidateX + cells.length <= graph[candidateY].length &&
        cells.every((_, index) => graph[candidateY][candidateX + index] === emptySymbol),
    );
    if (!placement) return;
    cells.forEach((cell, index) => {
      graph[placement.y][placement.x + index] = cell;
    });
  });
};
