import { segmentSeries } from '@services/chart/domain/clipping';
import type { ClippingCase } from '@services/chart/domain/types';

const clippingCases: readonly ClippingCase[] = [
  [
    'vertical segment outside X',
    [
      [-1, -1],
      [-1, 3],
    ],
    [],
  ],
  [
    'horizontal segment outside Y',
    [
      [-1, 3],
      [3, 3],
    ],
    [],
  ],
  [
    'segment missing the lower-left corner',
    [
      [-1, 0],
      [0, -1],
    ],
    [],
  ],
  [
    'vertical crossing',
    [
      [1, -1],
      [1, 3],
    ],
    [
      [
        [1, 0],
        [1, 2],
      ],
    ],
  ],
  [
    'horizontal crossing',
    [
      [-1, 1],
      [3, 1],
    ],
    [
      [
        [0, 1],
        [2, 1],
      ],
    ],
  ],
];

describe('geometric clipping', () => {
  it('keeps discard as the default overflow policy', () => {
    const data = [
      [0, 0],
      [1, 9],
      [2, 1],
    ] as const;
    const expected = [[[0, 0]], [[2, 1]]];

    expect(segmentSeries(data, [0, 2], [0, 2])).toEqual(expected);
    expect(segmentSeries(data, [0, 2], [0, 2], 'discard')).toEqual(expected);
  });

  it.each(clippingCases)('%s', (_name, data, expected) => {
    expect(segmentSeries(data, [0, 2], [0, 2], 'clip')).toEqual(expected);
  });

  it('clips finite values whose direct numeric span overflows', () => {
    const maximum = Number.MAX_VALUE;

    expect(
      segmentSeries(
        [
          [-maximum, 0],
          [maximum, 1],
        ],
        [-1, 1],
        [0, 1],
        'clip',
      ),
    ).toEqual([
      [
        [-1, 0.5],
        [1, 0.5],
      ],
    ]);
  });

  it('keeps repeated in-domain coordinates as one visible point', () => {
    expect(
      segmentSeries(
        [
          [1, 1],
          [1, 1],
        ],
        [0, 2],
        [0, 2],
        'clip',
      ),
    ).toEqual([[[1, 1]]]);
  });
});
