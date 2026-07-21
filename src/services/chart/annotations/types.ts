import {
  AnnotationSymbols,
  ArrowHeadSymbols,
  ChartAnnotation,
  ErrorBarSymbols,
  Graph,
} from '@types';

/**
 * Represents normalized annotation.
 */
export type NormalizedAnnotation = ChartAnnotation<number>;
/**
 * Represents span annotation.
 */
export type SpanAnnotation = Extract<NormalizedAnnotation, { type: 'span' }>;
/**
 * Represents text annotation.
 */
export type TextAnnotation = Extract<NormalizedAnnotation, { type: 'text' }>;
/**
 * Represents arrow annotation.
 */
export type ArrowAnnotation = Extract<NormalizedAnnotation, { type: 'arrow' }>;
/**
 * Represents error bar annotation.
 */
export type ErrorBarAnnotation = Extract<NormalizedAnnotation, { type: 'errorBar' }>;
/**
 * Represents numeric point.
 */
export type NumericPoint = readonly [x: number, y: number];

/**
 * Represents draw annotation options.
 */
export type DrawAnnotationOptions = Readonly<{
  graph: Graph;
  annotations: readonly NormalizedAnnotation[];
  phase: 'background' | 'foreground';
  plotWidth: number;
  plotHeight: number;
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  emptySymbol: string;
  symbols?: AnnotationSymbols;
}>;

/**
 * Represents resolved annotation symbols.
 */
export type ResolvedAnnotationSymbols = Required<
  Omit<AnnotationSymbols, 'arrowHeads' | 'errorBar'>
> & {
  arrowHeads: Required<ArrowHeadSymbols>;
  errorBar: Required<ErrorBarSymbols>;
};

/** Annotation geometry fields shared by span and text drawing. */
export type AnnotationGeometryOptions = Pick<
  DrawAnnotationOptions,
  'plotWidth' | 'plotHeight' | 'xDomain' | 'yDomain'
>;

/** Symmetric magnitude or explicit negative/positive error-bar magnitudes. */
export type ErrorMagnitude = NonNullable<ErrorBarAnnotation['xError']>;

/** Callback used by annotation validation to collect and validate X values. */
export type AddAnnotationXValue = (value: unknown, path: string) => void;

/** Numeric annotation accepted by normalized annotation drawing. */
export type NumericAnnotation = DrawAnnotationOptions['annotations'][number];
