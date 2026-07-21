import { Graph } from '@types';

import { colorizeCell, isInside, toCell } from './geometry';
import {
  DrawAnnotationOptions,
  ErrorBarAnnotation,
  ErrorMagnitude,
  ResolvedAnnotationSymbols,
} from './types';

const resolveMagnitude = (value: ErrorMagnitude): readonly [number, number] =>
  typeof value === 'number' ? [value, value] : value;

/**
 * Draws error bar.
 * @param {Graph} graph - The graph.
 * @param {ErrorBarAnnotation} annotation - The annotation.
 * @param {Pick<DrawAnnotationOptions, 'plotWidth' | 'plotHeight' | 'xDomain' | 'yDomain'>} options - The options.
 * @param {ResolvedAnnotationSymbols} symbols - The symbols.
 */
export const drawErrorBar = (
  graph: Graph,
  annotation: ErrorBarAnnotation,
  options: Pick<DrawAnnotationOptions, 'plotWidth' | 'plotHeight' | 'xDomain' | 'yDomain'>,
  symbols: ResolvedAnnotationSymbols,
): void => {
  const { plotWidth, plotHeight, xDomain, yDomain } = options;
  if (!isInside(annotation.x, xDomain) || !isInside(annotation.y, yDomain)) return;
  const center = toCell([annotation.x, annotation.y], plotWidth, plotHeight, xDomain, yDomain);
  const symbol = (value: string) => colorizeCell(value, annotation.color);
  const errorBar = symbols.errorBar;

  if (annotation.xError !== undefined) {
    const [minus, plus] = resolveMagnitude(annotation.xError);
    const left = toCell(
      [Math.max(xDomain[0], annotation.x - minus), annotation.y],
      plotWidth,
      plotHeight,
      xDomain,
      yDomain,
    );
    const right = toCell(
      [Math.min(xDomain[1], annotation.x + plus), annotation.y],
      plotWidth,
      plotHeight,
      xDomain,
      yDomain,
    );
    for (let x = left[0]; x <= right[0]; x++) {
      graph[center[1]][x] = symbol(errorBar.horizontal);
    }
    graph[center[1]][left[0]] = symbol(errorBar.leftCap);
    graph[center[1]][right[0]] = symbol(errorBar.rightCap);
  }

  if (annotation.yError !== undefined) {
    const [minus, plus] = resolveMagnitude(annotation.yError);
    const top = toCell(
      [annotation.x, Math.min(yDomain[1], annotation.y + plus)],
      plotWidth,
      plotHeight,
      xDomain,
      yDomain,
    );
    const bottom = toCell(
      [annotation.x, Math.max(yDomain[0], annotation.y - minus)],
      plotWidth,
      plotHeight,
      xDomain,
      yDomain,
    );
    for (let y = top[1]; y <= bottom[1]; y++) graph[y][center[0]] = symbol(errorBar.vertical);
    graph[top[1]][center[0]] = symbol(errorBar.topCap);
    graph[bottom[1]][center[0]] = symbol(errorBar.bottomCap);
  }

  graph[center[1]][center[0]] = symbol(errorBar.center);
};
