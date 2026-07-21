import type {
  BarLayout,
  GraphMode,
  Interpolation,
  LabelCollisionPolicy,
  Overflow,
  Renderer,
  XScale,
} from '@types';

/**
 * Supported graph rendering modes accepted by validation.
 */
export const GRAPH_MODES = new Set<GraphMode>(['line', 'point', 'bar', 'horizontalBar']);
/**
 * Supported line interpolation modes accepted by validation.
 */
export const INTERPOLATIONS = new Set<Interpolation>(['step', 'linear']);
/**
 * Supported domain overflow policies accepted by validation.
 */
export const OVERFLOW_POLICIES = new Set<Overflow>(['clip', 'discard']);
/**
 * Supported terminal renderer backends accepted by validation.
 */
export const RENDERERS = new Set<Renderer>(['ascii', 'braille']);
/**
 * Supported structured bar layouts accepted by validation.
 */
export const BAR_LAYOUTS = new Set<BarLayout>(['overlap', 'grouped', 'stacked', 'normalized']);
/**
 * Supported native X-axis scales accepted by validation.
 */
export const X_SCALES = new Set<XScale>(['linear', 'band', 'time']);
/**
 * Supported legend positions accepted by validation.
 */
export const LEGEND_POSITIONS = new Set(['left', 'right', 'top', 'bottom', 'auto']);
/**
 * Supported X-axis label collision policies accepted by validation.
 */
export const LABEL_COLLISION_POLICIES = new Set<LabelCollisionPolicy>([
  'hide',
  'truncate',
  'wrap',
  'error',
]);
