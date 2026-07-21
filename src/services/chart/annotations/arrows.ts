import { Graph } from '@types';

import { clipLineSegment, colorizeCell, getLineCells, isInside, toCell } from './geometry';
import {
  ArrowAnnotation,
  DrawAnnotationOptions,
  NumericPoint,
  ResolvedAnnotationSymbols,
} from './types';

const getArrowHead = (
  from: NumericPoint,
  to: NumericPoint,
  heads: ResolvedAnnotationSymbols['arrowHeads'],
): string => {
  const deltaX = to[0] - from[0];
  const deltaY = to[1] - from[1];
  const horizontal = Math.abs(deltaX) > Math.abs(deltaY) * 2;
  const vertical = Math.abs(deltaY) > Math.abs(deltaX) * 2;
  if (horizontal) return deltaX > 0 ? heads.right : heads.left;
  if (vertical) return deltaY > 0 ? heads.up : heads.down;
  if (deltaX > 0) return deltaY > 0 ? heads.upRight : heads.downRight;
  return deltaY > 0 ? heads.upLeft : heads.downLeft;
};

/**
 * Draws arrow.
 * @param {Graph} graph - The graph.
 * @param {ArrowAnnotation} annotation - The annotation.
 * @param {Pick<DrawAnnotationOptions, 'plotWidth' | 'plotHeight' | 'xDomain' | 'yDomain'>} options - The options.
 * @param {ResolvedAnnotationSymbols} symbols - The symbols.
 */
export const drawArrow = (
  graph: Graph,
  annotation: ArrowAnnotation,
  options: Pick<DrawAnnotationOptions, 'plotWidth' | 'plotHeight' | 'xDomain' | 'yDomain'>,
  symbols: ResolvedAnnotationSymbols,
): void => {
  const { plotWidth, plotHeight, xDomain, yDomain } = options;
  const clipped = clipLineSegment(annotation.from, annotation.to, xDomain, yDomain);
  if (!clipped) return;
  const start = toCell(clipped[0], plotWidth, plotHeight, xDomain, yDomain);
  const end = toCell(clipped[1], plotWidth, plotHeight, xDomain, yDomain);
  const line = colorizeCell(annotation.lineSymbol ?? symbols.arrowLine, annotation.color);
  getLineCells(start, end).forEach(([x, y]) => {
    graph[y][x] = line;
  });
  if (isInside(annotation.to[0], xDomain) && isInside(annotation.to[1], yDomain)) {
    graph[end[1]][end[0]] = colorizeCell(
      getArrowHead(annotation.from, annotation.to, symbols.arrowHeads),
      annotation.color,
    );
  }
};
