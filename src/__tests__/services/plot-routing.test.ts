import { prepareSegmentedPlot } from '@services/plot/routing/series';

describe('segmented plot routing', () => {
  it('keeps clipped x coordinates but returns an empty frame without a y domain', () => {
    expect(prepareSegmentedPlot([[[3, null]]], { overflow: 'clip' }, 'ansiBlue')).toEqual({
      input: [[]],
      settings: { overflow: 'clip', color: 'ansiBlue' },
    });
  });

  it('uses discard overflow for non-line modes', () => {
    const prepared = prepareSegmentedPlot(
      [
        [
          [0, 1],
          [1, 2],
        ],
      ],
      { mode: 'bar', yRange: [0, 3] },
      undefined,
    );

    expect(prepared.input).toEqual([
      [
        [0, 1],
        [1, 2],
      ],
    ]);
    expect(prepared.settings.seriesIndexes).toEqual([0]);
  });
});
