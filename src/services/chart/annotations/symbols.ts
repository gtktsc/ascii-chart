import { AnnotationSymbols, ArrowHeadSymbols, ErrorBarSymbols } from '@types';
import { DEFAULT_ANNOTATION_SYMBOLS } from '@constants/symbols/annotations';
import { resolveSymbols } from '@helpers/symbols';

import { ResolvedAnnotationSymbols } from './types';

/**
 * Merges annotation symbol overrides with immutable annotation defaults.
 * @param {AnnotationSymbols} symbols - The symbols.
 * @returns {ResolvedAnnotationSymbols} - Computed result.
 */
export const resolveAnnotationSymbols = (
  symbols?: AnnotationSymbols,
): ResolvedAnnotationSymbols => ({
  ...resolveSymbols<ResolvedAnnotationSymbols>(
    DEFAULT_ANNOTATION_SYMBOLS,
    symbols as Partial<ResolvedAnnotationSymbols> | undefined,
  ),
  arrowHeads: resolveSymbols<Required<ArrowHeadSymbols>>(
    DEFAULT_ANNOTATION_SYMBOLS.arrowHeads,
    symbols?.arrowHeads,
  ),
  errorBar: resolveSymbols<Required<ErrorBarSymbols>>(
    DEFAULT_ANNOTATION_SYMBOLS.errorBar,
    symbols?.errorBar,
  ),
});
