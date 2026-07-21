import { BarLayout, MaybePoint, MultiLine } from '@types';
import { rangeError } from '@services/errors';

import type { BarNormalizationTotals, BarSegment, BarSegmentState, BarSeriesInput } from './types';

const addUnique = (values: number[], value: number) => {
  if (!values.includes(value)) values.push(value);
};

const isStackedLayout = (layout: BarLayout) => layout === 'stacked' || layout === 'normalized';

const getBarValues = (entry: BarSeriesInput, x: number, y: number) => {
  const vertical = entry.mode === 'bar';
  return {
    category: vertical ? x : y,
    value: vertical ? y : x,
  };
};

const getNormalizationTotals = (series: readonly BarSeriesInput[]): BarNormalizationTotals => {
  const positive = new Map<string, number>();
  const negative = new Map<string, number>();
  series.forEach((entry) => {
    entry.data.forEach((datum) => {
      if (datum[1] === null) return;
      const { category, value } = getBarValues(entry, datum[0], datum[1]);
      const totals = value < 0 ? negative : positive;
      const key = `${entry.mode}:${category}`;
      totals.set(key, (totals.get(key) ?? 0) + Math.abs(value));
    });
  });
  return { positive, negative };
};

const resolveSegmentRange = (
  entry: BarSeriesInput,
  category: number,
  rawValue: number,
  baseline: number,
  state: BarSegmentState,
) => {
  let start = baseline;
  let end = rawValue;
  let value = rawValue;
  if (state.layout === 'stacked') {
    const accumulator = rawValue < 0 ? state.negative : state.positive;
    const key = `${entry.mode}:${category}`;
    start = accumulator.get(key) ?? baseline;
    end = start + rawValue;
    accumulator.set(key, end);
  }
  if (state.layout === 'normalized') {
    const accumulator = rawValue < 0 ? state.negative : state.positive;
    const total = (rawValue < 0 ? state.totals?.negative : state.totals?.positive)?.get(
      `${entry.mode}:${category}`,
    );
    const key = `${entry.mode}:${category}`;
    const rawStart = accumulator.get(key) ?? 0;
    const rawEnd = rawStart + rawValue;
    value = total ? (rawValue / total) * 100 : 0;
    start = total ? baseline + (rawStart / total) * 100 : baseline;
    end = total ? baseline + (rawEnd / total) * 100 : baseline;
    accumulator.set(key, rawEnd);
  }
  return { start, end, value };
};

const assertUniqueCategory = (
  entry: BarSeriesInput,
  datumIndex: number,
  category: number,
  isVertical: boolean,
  seenCategories: Set<number>,
  layout: BarLayout,
): void => {
  if (layout === 'overlap' || !seenCategories.has(category)) return;
  const coordinateIndex = isVertical ? 0 : 1;
  const root = entry.dataPath ?? `series[${entry.seriesIndex}].data`;
  rangeError(
    `${root}[${datumIndex}][${coordinateIndex}]`,
    'must be unique within a grouped, stacked, or normalized bar series',
  );
};

const addSegmentDomainValues = (
  state: BarSegmentState,
  isVertical: boolean,
  category: number,
  start: number,
  end: number,
): void => {
  const categories = isVertical ? state.xValues : state.yValues;
  const values = isVertical ? state.yValues : state.xValues;
  addUnique(categories, category);
  addUnique(values, end);
  if (isStackedLayout(state.layout)) addUnique(values, start);
};

const addSeriesSegments = (entry: BarSeriesInput, state: BarSegmentState): void => {
  const seenCategories = new Set<number>();
  const isVertical = entry.mode === 'bar';
  const baseline = isVertical ? (state.axisCenter?.[1] ?? 0) : (state.axisCenter?.[0] ?? 0);
  const slots = isVertical ? state.verticalSlots : state.horizontalSlots;
  const slotIndex = slots.get(entry.seriesIndex) as number;
  const slotCount = isVertical ? state.verticalCount : state.horizontalCount;
  entry.data.forEach(([x, nullableY], datumIndex) => {
    if (nullableY === null) return;
    const y = nullableY;
    const { category, value: rawValue } = getBarValues(entry, x, y);
    assertUniqueCategory(entry, datumIndex, category, isVertical, seenCategories, state.layout);
    seenCategories.add(category);
    const { start, end, value } = resolveSegmentRange(entry, category, rawValue, baseline, state);
    state.segments.push({
      seriesIndex: entry.seriesIndex,
      seriesId: entry.seriesId,
      seriesName: entry.seriesName,
      datumIndex,
      x,
      y,
      mode: entry.mode,
      layout: state.layout,
      value,
      category,
      start,
      end,
      slotIndex,
      slotCount,
      color: entry.color,
      coloring: entry.coloring,
    });
    addSegmentDomainValues(state, isVertical, category, start, end);
  });
};

/**
 * Converts public bar series into ordered grouped, stacked, or normalized segments and domains.
 * @param {readonly BarSeriesInput[]} series - Validated bar series to prepare.
 * @param {BarLayout} layout - Bar layout strategy.
 * @param {MaybePoint} axisCenter - Effective x and y baselines.
 * @returns {object} - Prepared segments and values required to resolve both domains.
 */
export const prepareBarSegments = (
  series: readonly BarSeriesInput[],
  layout: BarLayout,
  axisCenter: MaybePoint,
): { segments: BarSegment[]; xValues: number[]; yValues: number[] } => {
  const xValues: number[] = [];
  const yValues: number[] = [];
  const segments: BarSegment[] = [];
  const verticalSeries = series.filter(({ mode }) => mode === 'bar');
  const horizontalSeries = series.filter(({ mode }) => mode === 'horizontalBar');
  const verticalSlots = new Map(
    verticalSeries.map(({ seriesIndex }, index) => [seriesIndex, index]),
  );
  const horizontalSlots = new Map(
    horizontalSeries.map(({ seriesIndex }, index) => [seriesIndex, index]),
  );
  const positive = new Map<string, number>();
  const negative = new Map<string, number>();
  const totals = layout === 'normalized' ? getNormalizationTotals(series) : undefined;

  if (verticalSeries.length) addUnique(yValues, axisCenter?.[1] ?? 0);
  if (horizontalSeries.length) addUnique(xValues, axisCenter?.[0] ?? 0);

  const state: BarSegmentState = {
    layout,
    axisCenter,
    verticalCount: verticalSeries.length,
    horizontalCount: horizontalSeries.length,
    verticalSlots,
    horizontalSlots,
    positive,
    negative,
    totals,
    segments,
    xValues,
    yValues,
  };
  series.forEach((entry) => addSeriesSegments(entry, state));

  return { segments, xValues, yValues };
};

const isInside = (value: number, domain: readonly [number, number]) =>
  value >= domain[0] && value <= domain[1];

/**
 * Adds visible bar endpoints to sizing input without clipping segments.
 * @param {MultiLine} input - Existing sizing input.
 * @param {readonly BarSegment[]} segments - Prepared bar segments.
 * @param {readonly [number, number]} xDomain - Resolved x-axis domain.
 * @param {readonly [number, number]} yDomain - Resolved y-axis domain.
 * @returns {MultiLine} Sizing input extended with visible bar endpoints.
 */
export const getBarDataInput = (
  input: MultiLine,
  segments: readonly BarSegment[],
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
) => [
  ...input,
  ...segments.flatMap((segment) => {
    const point =
      segment.mode === 'bar'
        ? ([segment.category, segment.end] as [number, number])
        : ([segment.end, segment.category] as [number, number]);
    const startVisible =
      segment.mode === 'bar' ? isInside(segment.start, yDomain) : isInside(segment.start, xDomain);
    return isInside(point[0], xDomain) && isInside(point[1], yDomain) && startVisible
      ? [[point]]
      : [];
  }),
];
