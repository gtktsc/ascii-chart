import { Graph } from '@types';
import { toDisplayCells } from '@helpers/terminal-text';

import { colorizeCell, isInside, toCell } from './geometry';
import {
  AnnotationGeometryOptions,
  ResolvedAnnotationSymbols,
  SpanAnnotation,
  TextAnnotation,
} from './types';

/**
 * Draws span.
 * @param {Graph} graph - The graph.
 * @param {SpanAnnotation} annotation - The annotation.
 * @param {GeometryOptions} options - The options.
 * @param {ReadonlySet<string>} occupied - The occupied.
 * @param {ResolvedAnnotationSymbols} symbols - The symbols.
 */
export const drawSpan = (
  graph: Graph,
  annotation: SpanAnnotation,
  options: AnnotationGeometryOptions,
  occupied: ReadonlySet<string>,
  symbols: ResolvedAnnotationSymbols,
): void => {
  const { plotWidth, plotHeight, xDomain, yDomain } = options;
  const domain = annotation.axis === 'x' ? xDomain : yDomain;
  const from = Math.max(annotation.from, domain[0]);
  const to = Math.min(annotation.to, domain[1]);
  if (from > to) return;

  const start = toCell(
    annotation.axis === 'x' ? [from, yDomain[0]] : [xDomain[0], from],
    plotWidth,
    plotHeight,
    xDomain,
    yDomain,
  );
  const end = toCell(
    annotation.axis === 'x' ? [to, yDomain[1]] : [xDomain[1], to],
    plotWidth,
    plotHeight,
    xDomain,
    yDomain,
  );
  const minX = annotation.axis === 'x' ? Math.min(start[0], end[0]) : 1;
  const maxX = annotation.axis === 'x' ? Math.max(start[0], end[0]) : plotWidth;
  const minY = annotation.axis === 'y' ? Math.min(start[1], end[1]) : 1;
  const maxY = annotation.axis === 'y' ? Math.max(start[1], end[1]) : plotHeight;
  const symbol = colorizeCell(annotation.symbol ?? symbols.span, annotation.color);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!occupied.has(`${x}:${y}`)) graph[y][x] = symbol;
    }
  }
};

/**
 * Draws text.
 * @param {Graph} graph - The graph.
 * @param {TextAnnotation} annotation - The annotation.
 * @param {GeometryOptions} options - The options.
 */
export const drawText = (
  graph: Graph,
  annotation: TextAnnotation,
  options: AnnotationGeometryOptions,
): void => {
  const { plotWidth, plotHeight, xDomain, yDomain } = options;
  if (!isInside(annotation.x, xDomain) || !isInside(annotation.y, yDomain)) return;
  const [anchorX, y] = toCell(
    [annotation.x, annotation.y],
    plotWidth,
    plotHeight,
    xDomain,
    yDomain,
  );
  const cells = toDisplayCells(annotation.text);
  const preferredStartX =
    annotation.align === 'left'
      ? anchorX - cells.length + 1
      : annotation.align === 'center'
        ? anchorX - Math.floor(cells.length / 2)
        : anchorX;
  const startX = Math.max(1, Math.min(preferredStartX, plotWidth - cells.length + 1));

  cells.forEach((cell, index) => {
    const x = startX + index;
    if (x >= 1 && x <= plotWidth) graph[y][x] = colorizeCell(cell, annotation.color);
  });
};
