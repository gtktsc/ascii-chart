import { Formatter, GraphPoint, Threshold } from '@types';
import { defaultFormatter } from '@helpers/formatting';

/**
 * Clips plot overlays to the resolved axis domains.
 * @param {readonly PointType[] | undefined} points - Point overlays to clip.
 * @param {readonly ThresholdType[] | undefined} thresholds - Threshold overlays to clip.
 * @param {readonly [number, number]} xDomain - Inclusive x-axis domain.
 * @param {readonly [number, number]} yDomain - Inclusive y-axis domain.
 * @returns {object} - Overlay collections containing only in-domain entries.
 */
export const clipOverlaysToDomains = <
  PointType extends Pick<GraphPoint, 'x' | 'y'>,
  ThresholdType extends Pick<Threshold, 'x' | 'y'>,
>(
  points: readonly PointType[] | undefined,
  thresholds: readonly ThresholdType[] | undefined,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
): { points: PointType[] | undefined; thresholds: ThresholdType[] | undefined } => {
  const isInDomain = (value: number, domain: readonly [number, number]) =>
    value >= domain[0] && value <= domain[1];

  return {
    points: points?.filter(({ x, y }) => isInDomain(x, xDomain) && isInDomain(y, yDomain)),
    thresholds: thresholds?.filter(
      ({ x, y }) =>
        (x === undefined || isInDomain(x, xDomain)) && (y === undefined || isInDomain(y, yDomain)),
    ),
  };
};

/**
 * Resolves per-axis formatters before a shared fallback formatter.
 * @param {Formatter | undefined} xFormatter - Optional x-axis formatter.
 * @param {Formatter | undefined} yFormatter - Optional y-axis formatter.
 * @param {Formatter} [fallbackFormatter] - Formatter used when the selected axis has no override.
 * @returns {Formatter} - Formatter honoring axis-specific precedence.
 */
export const resolveAxisFormatter =
  (
    xFormatter: Formatter | undefined,
    yFormatter: Formatter | undefined,
    fallbackFormatter: Formatter = defaultFormatter,
  ): Formatter =>
  (value, helpers) => {
    const formatter = helpers.axis === 'x' ? xFormatter : yFormatter;
    return (formatter ?? fallbackFormatter)(value, helpers);
  };
