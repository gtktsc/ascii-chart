/** Rendering primitive used for a series. */
export type GraphMode = 'line' | 'point' | 'bar' | 'horizontalBar';
/** Line-segment interpolation policy. */
export type Interpolation = 'step' | 'linear';
/** Behavior for line geometry outside an explicit domain. */
export type Overflow = 'clip' | 'discard';
/** Plot-cell renderer backend. */
export type Renderer = 'ascii' | 'braille';
/** Fixed plot width or the active terminal width. */
export type ChartWidth = number | 'auto';
/** Resolution policy for X-axis labels that do not fit. */
export type LabelCollisionPolicy = 'hide' | 'truncate' | 'wrap' | 'error';
/** Legend placement. `auto` chooses right or bottom from available width. */
export type LegendPosition = 'left' | 'right' | 'top' | 'bottom' | 'auto';
