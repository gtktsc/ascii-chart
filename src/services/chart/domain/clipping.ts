import { Overflow, Point } from '@types';
import { interpolateRange, normalizeInRange } from '@helpers/numeric-range';

const isInsideDomains = (
  [x, y]: Point,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
) => x >= xDomain[0] && x <= xDomain[1] && y >= yDomain[0] && y <= yDomain[1];

const clipLineSegment = (
  start: Point,
  end: Point,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
): [Point, Point] | undefined => {
  let entry = 0;
  let exit = 1;
  let entryBoundary: readonly [axis: 0 | 1, value: number] | undefined;
  let exitBoundary: readonly [axis: 0 | 1, value: number] | undefined;

  for (const [axis, domain] of [
    [0, xDomain],
    [1, yDomain],
  ] as const) {
    if (start[axis] === end[axis]) {
      if (start[axis] < domain[0] || start[axis] > domain[1]) return undefined;
      continue;
    }
    const minimumRatio = normalizeInRange(domain[0], start[axis], end[axis]);
    const maximumRatio = normalizeInRange(domain[1], start[axis], end[axis]);
    const axisEntry = Math.min(minimumRatio, maximumRatio);
    const axisExit = Math.max(minimumRatio, maximumRatio);
    const ascending = start[axis] < end[axis];
    if (axisEntry > entry) {
      entry = axisEntry;
      entryBoundary = [axis, ascending ? domain[0] : domain[1]];
    }
    if (axisExit < exit) {
      exit = axisExit;
      exitBoundary = [axis, ascending ? domain[1] : domain[0]];
    }
    if (entry > exit) return undefined;
  }

  const pointAt = (
    ratio: number,
    boundary: readonly [axis: 0 | 1, value: number] | undefined,
  ): Point => {
    const point: Point = [
      interpolateRange(start[0], end[0], ratio),
      interpolateRange(start[1], end[1], ratio),
    ];
    if (boundary) point[boundary[0]] = boundary[1];
    return [
      Math.min(xDomain[1], Math.max(xDomain[0], point[0])),
      Math.min(yDomain[1], Math.max(yDomain[0], point[1])),
    ];
  };
  return [pointAt(entry, entryBoundary), pointAt(exit, exitBoundary)];
};

const samePoint = (left: Point, right: Point) => left[0] === right[0] && left[1] === right[1];

const clipSeries = (
  data: readonly (readonly [number, number | null])[],
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
): Point[][] => {
  const segments: Point[][] = [];
  let segment: Point[] = [];
  let previous: Point | undefined;
  const flush = () => {
    if (segment.length) segments.push(segment);
    segment = [];
  };
  const flushRun = () => {
    if (previous && !segment.length && isInsideDomains(previous, xDomain, yDomain)) {
      segment.push(previous);
    }
    flush();
  };
  const append = (point: Point) => {
    if (!segment.length || !samePoint(segment[segment.length - 1], point)) segment.push(point);
  };

  data.forEach(([x, y]) => {
    if (y === null) {
      flushRun();
      previous = undefined;
      return;
    }
    const current: Point = [x, y];
    if (!previous) {
      previous = current;
      return;
    }
    const clipped = clipLineSegment(previous, current, xDomain, yDomain);
    if (!clipped) {
      flush();
    } else {
      const [start, end] = clipped;
      const joinsPrevious =
        isInsideDomains(previous, xDomain, yDomain) &&
        segment.length > 0 &&
        samePoint(segment[segment.length - 1], start);
      if (!joinsPrevious) flush();
      append(start);
      append(end);
    }
    previous = current;
  });
  flushRun();
  return segments;
};

/**
 * Sorts a series, splits missing or discarded runs, and clips boundary crossings when requested.
 * @param {readonly (readonly [number, number | null])[]} data - The data.
 * @param {readonly [number, number]} xDomain - The x domain.
 * @param {readonly [number, number]} yDomain - The y domain.
 * @param {Overflow} overflow - The overflow.
 * @returns {[number, number][][]} - Computed result.
 */
export const segmentSeries = (
  data: readonly (readonly [number, number | null])[],
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
  overflow: Overflow = 'discard',
): [number, number][][] => {
  const sortedData = data
    .map((datum, index) => ({ datum, index }))
    .sort((left, right) => left.datum[0] - right.datum[0] || left.index - right.index)
    .map(({ datum }) => datum);
  if (overflow === 'clip') return clipSeries(sortedData, xDomain, yDomain);
  const segments: [number, number][][] = [];
  let segment: [number, number][] = [];
  const flush = () => {
    if (segment.length) segments.push(segment);
    segment = [];
  };

  sortedData.forEach(([x, y]) => {
    const outsideX = x < xDomain[0] || x > xDomain[1];
    const outsideY = y !== null && (y < yDomain[0] || y > yDomain[1]);
    if (y === null || outsideX || outsideY) flush();
    else segment.push([x, y]);
  });
  flush();
  return segments;
};
