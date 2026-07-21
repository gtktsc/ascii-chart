import type { ChartX } from './axes';
import type { Color } from './colors';

/** Metadata shared by every structured-chart annotation. */
export type ChartAnnotationBase = Readonly<{
  /** Unique annotation identifier. */
  id: string;
  /** ANSI color applied to the complete annotation. */
  color?: Color;
}>;

/** Reference region spanning an inclusive X or Y interval. */
export type ChartSpanAnnotation<X extends ChartX = number> = ChartAnnotationBase &
  (
    | Readonly<{
        /** Span annotation discriminator. */
        type: 'span';
        /** Fills an X-axis interval across the complete plot height. */
        axis: 'x';
        /** Inclusive native interval start. */
        from: X;
        /** Inclusive native interval end. */
        to: X;
        /** One-column fill glyph. */
        symbol?: string;
      }>
    | Readonly<{
        /** Span annotation discriminator. */
        type: 'span';
        /** Fills a Y-axis interval across the complete plot width. */
        axis: 'y';
        /** Inclusive numeric interval start. */
        from: number;
        /** Inclusive numeric interval end. */
        to: number;
        /** One-column fill glyph. */
        symbol?: string;
      }>
  );

/** Text anchored at one data coordinate. */
export type ChartTextAnnotation<X extends ChartX = number> = ChartAnnotationBase &
  Readonly<{
    /** Text annotation discriminator. */
    type: 'text';
    /** Native X anchor. */
    x: X;
    /** Numeric Y anchor. */
    y: number;
    /** Display-safe terminal text. */
    text: string;
    /** Horizontal placement relative to the anchor. Defaults to `right`. */
    align?: 'left' | 'center' | 'right';
  }>;

/** Arrow connecting two data coordinates. */
export type ChartArrowAnnotation<X extends ChartX = number> = ChartAnnotationBase &
  Readonly<{
    /** Arrow annotation discriminator. */
    type: 'arrow';
    /** Native-X/numeric-Y path start. */
    from: readonly [x: X, y: number];
    /** Native-X/numeric-Y path end and arrowhead position. */
    to: readonly [x: X, y: number];
    /** One-column path glyph. */
    lineSymbol?: string;
  }>;

/** Symmetric error magnitude or `[minus, plus]` asymmetric magnitudes. */
export type ChartErrorMagnitude = number | readonly [minus: number, plus: number];

/** Error whiskers centered on one data coordinate. */
export type ChartErrorBarAnnotation<X extends ChartX = number> = ChartAnnotationBase &
  Readonly<{
    /** Error-bar annotation discriminator. */
    type: 'errorBar';
    /** Native X center. */
    x: X;
    /** Numeric Y center. */
    y: number;
    /** Symmetric or asymmetric Y-axis error magnitude. */
    yError?: ChartErrorMagnitude;
  }> &
  ([X] extends [string]
    ? Readonly<{ xError?: never }>
    : Readonly<{
        /** Symmetric or asymmetric X-axis error magnitude. */
        xError?: ChartErrorMagnitude;
      }>);

/** Any supported structured-chart annotation. */
export type ChartAnnotation<X extends ChartX = number> =
  | ChartSpanAnnotation<X>
  | ChartTextAnnotation<X>
  | ChartArrowAnnotation<X>
  | ChartErrorBarAnnotation<X>;
