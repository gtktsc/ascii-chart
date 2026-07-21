import type { CHART_ERROR_CODES } from '@constants/errors';

/** Stable machine-readable chart error-code value. */
export type ChartErrorCode = (typeof CHART_ERROR_CODES)[keyof typeof CHART_ERROR_CODES];
