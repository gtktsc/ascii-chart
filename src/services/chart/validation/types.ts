import type { ChartSpec, ChartX, XScale } from '@types';

/** Mutable X-scale state shared while validating chart input. */
export type ChartValidationState = {
  xScale: XScale | undefined;
};

/** Mutable X-scale state shared while validating axis values. */
export type XScaleState = {
  value: XScale | undefined;
};

/** Runtime chart boundary validator with a TypeScript assertion signature. */
export type ValidateChartSpec = (value: unknown) => asserts value is ChartSpec<ChartX>;
