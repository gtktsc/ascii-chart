import { clipOverlaysToDomains, resolveAxisFormatter } from '@services/plot/rendering/policy';

const helpers = {
  axis: 'x' as const,
  xRange: [0, 2] as [number, number],
  yRange: [0, 2] as [number, number],
};

describe('shared rendering policy', () => {
  it('clips points and partial thresholds inclusively against both domains', () => {
    const points = [
      { id: 'minimum', x: 0, y: 0 },
      { id: 'maximum', x: 2, y: 2 },
      { id: 'outside-x', x: 3, y: 1 },
      { id: 'outside-y', x: 1, y: 3 },
    ];
    const thresholds = [
      { id: 'vertical', x: 1 },
      { id: 'horizontal', y: 1 },
      { id: 'point', x: 2, y: 2 },
      { id: 'outside-x', x: 3 },
      { id: 'outside-y', y: 3 },
    ];

    expect(clipOverlaysToDomains(points, thresholds, [0, 2], [0, 2])).toEqual({
      points: [points[0], points[1]],
      thresholds: [thresholds[0], thresholds[1], thresholds[2]],
    });
  });

  it('preserves absent overlay collections', () => {
    expect(clipOverlaysToDomains(undefined, undefined, [0, 2], [0, 2])).toEqual({
      points: undefined,
      thresholds: undefined,
    });
  });

  it('prefers axis formatters before the shared fallback', () => {
    const formatter = resolveAxisFormatter(
      (value) => `x:${value}`,
      (value) => `y:${value}`,
      (value, { axis }) => `fallback-${axis}:${value}`,
    );

    expect(formatter(1, helpers)).toBe('x:1');
    expect(formatter(1, { ...helpers, axis: 'y' })).toBe('y:1');
    expect(resolveAxisFormatter(undefined, undefined, formatter)(1, helpers)).toBe('x:1');
  });
});
