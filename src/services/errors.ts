import type { ChartErrorCode as ChartErrorCodeValue } from '@types';
import { CHART_ERROR_CODES } from '@constants/errors';

/** Stable machine-readable chart error codes for JavaScript and TypeScript consumers. */
export { CHART_ERROR_CODES as ChartErrorCode };

/** Type/shape error with stable chart metadata. */
export class ChartTypeError extends TypeError {
  /** Stable machine-readable category for the validation failure. */
  readonly code: ChartErrorCodeValue;
  /** Public input path that failed validation. */
  readonly path: string;

  /**
   * Creates a type or shape error with stable chart metadata.
   * @param {ChartErrorCode} code - Machine-readable chart error code.
   * @param {string} path - Public input path that failed validation.
   * @param {string} message - Human-readable validation failure.
   */
  constructor(code: ChartErrorCodeValue, path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'ChartTypeError';
    this.code = code;
    this.path = path;
  }
}

/** Range/value error with stable chart metadata. */
export class ChartRangeError extends RangeError {
  /** Stable machine-readable category for the validation failure. */
  readonly code: ChartErrorCodeValue;
  /** Public input path that failed validation. */
  readonly path: string;

  /**
   * Creates a range or value error with stable chart metadata.
   * @param {ChartErrorCode} code - Machine-readable chart error code.
   * @param {string} path - Public input path that failed validation.
   * @param {string} message - Human-readable validation failure.
   */
  constructor(code: ChartErrorCodeValue, path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'ChartRangeError';
    this.code = code;
    this.path = path;
  }
}

/**
 * Throws a stable chart type error.
 * @param {string} path - Public input path that failed validation.
 * @param {string} message - Human-readable validation failure.
 * @param {ChartErrorCode} [code] - Machine-readable chart error code.
 */
export const typeError = (
  path: string,
  message: string,
  code: ChartErrorCodeValue = 'ERR_CHART_INVALID_TYPE',
): never => {
  throw new ChartTypeError(code, path, message);
};

/**
 * Throws a stable chart range error.
 * @param {string} path - Public input path that failed validation.
 * @param {string} message - Human-readable validation failure.
 * @param {ChartErrorCode} [code] - Machine-readable chart error code.
 */
export const rangeError = (
  path: string,
  message: string,
  code: ChartErrorCodeValue = 'ERR_CHART_INVALID_VALUE',
): never => {
  throw new ChartRangeError(code, path, message);
};
