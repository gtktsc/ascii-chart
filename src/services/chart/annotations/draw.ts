import { drawArrow } from './arrows';
import { drawErrorBar } from './error-bars';
import { drawSpan, drawText } from './regions';
import { resolveAnnotationSymbols } from './symbols';
import { DrawAnnotationOptions } from './types';

export type { NormalizedAnnotation } from './types';

/**
 * Draws annotations.
 * @param {DrawAnnotationOptions} options - The options.
 */
export const drawAnnotations = (options: DrawAnnotationOptions): void => {
  const { graph, annotations, phase, emptySymbol } = options;
  const symbols = resolveAnnotationSymbols(options.symbols);
  if (phase === 'background') {
    const occupied = new Set<string>();
    graph.forEach((row, y) =>
      row.forEach((symbol, x) => {
        if (symbol !== emptySymbol) occupied.add(`${x}:${y}`);
      }),
    );
    annotations.forEach((annotation) => {
      if (annotation.type === 'span') drawSpan(graph, annotation, options, occupied, symbols);
    });
    return;
  }

  annotations.forEach((annotation) => {
    if (annotation.type === 'text') drawText(graph, annotation, options);
    if (annotation.type === 'arrow') drawArrow(graph, annotation, options, symbols);
    if (annotation.type === 'errorBar') drawErrorBar(graph, annotation, options, symbols);
  });
};
