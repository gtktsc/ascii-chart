/**
 * Normalizes a finite value within a non-constant finite range without overflow.
 * @param {number} value - Value inside the range.
 * @param {number} min - Range minimum.
 * @param {number} max - Range maximum.
 * @returns {number} - Value scaled from zero through one.
 */
export const normalizeInRange = (value: number, min: number, max: number): number => {
  const range = max - min;
  if (Number.isFinite(range)) return (value - min) / range;

  const scaledMin = min / 2;
  const scaledMax = max / 2;
  return (value / 2 - scaledMin) / (scaledMax - scaledMin);
};

/**
 * Interpolates within a finite range without subtracting its endpoints.
 * @param {number} min - Range minimum.
 * @param {number} max - Range maximum.
 * @param {number} position - Position from zero through one.
 * @returns {number} - Interpolated finite value.
 */
export const interpolateRange = (min: number, max: number, position: number): number =>
  min * (1 - position) + max * position;
