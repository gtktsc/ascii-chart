import { MultiLine } from '@types';
import { drawPreparedBars } from '@services/plot/bars/drawing';
import { drawBarValueLabels } from '@services/plot/bars/labels';
import { prepareBarSegments } from '@services/plot/bars/preparation';
import { drawGraph } from '@services/plot/draw/position';

describe('bar layout planning', () => {
  it('reserves stable grouped slots in source series order', () => {
    const result = prepareBarSegments(
      [
        {
          seriesIndex: 0,
          data: [
            [0, 2],
            [1, 3],
          ],
          mode: 'bar',
        },
        { seriesIndex: 1, data: [[1, 4]], mode: 'bar' },
      ],
      'grouped',
      [undefined, 0],
    );

    expect(result.segments).toMatchObject([
      { seriesIndex: 0, datumIndex: 0, category: 0, start: 0, end: 2, slotIndex: 0, slotCount: 2 },
      { seriesIndex: 0, datumIndex: 1, category: 1, start: 0, end: 3, slotIndex: 0, slotCount: 2 },
      { seriesIndex: 1, datumIndex: 0, category: 1, start: 0, end: 4, slotIndex: 1, slotCount: 2 },
    ]);
    expect(result.xValues).toEqual([0, 1]);
    expect(result.yValues).toEqual([0, 2, 3, 4]);
  });

  it('reserves all three grouped slots when categories are sparse', () => {
    const result = prepareBarSegments(
      [
        {
          seriesIndex: 0,
          data: [
            [0, 2],
            [2, 4],
          ],
          mode: 'bar',
        },
        { seriesIndex: 1, data: [[1, 3]], mode: 'bar' },
        {
          seriesIndex: 2,
          data: [
            [0, 5],
            [1, 6],
          ],
          mode: 'bar',
        },
      ],
      'grouped',
      [undefined, 0],
    );

    expect(
      result.segments.map(({ category, seriesIndex, slotIndex, slotCount }) => ({
        category,
        seriesIndex,
        slotIndex,
        slotCount,
      })),
    ).toEqual([
      { category: 0, seriesIndex: 0, slotIndex: 0, slotCount: 3 },
      { category: 2, seriesIndex: 0, slotIndex: 0, slotCount: 3 },
      { category: 1, seriesIndex: 1, slotIndex: 1, slotCount: 3 },
      { category: 0, seriesIndex: 2, slotIndex: 2, slotCount: 3 },
      { category: 1, seriesIndex: 2, slotIndex: 2, slotCount: 3 },
    ]);
  });

  it('builds diverging stacks from a custom baseline', () => {
    const result = prepareBarSegments(
      [
        {
          seriesIndex: 0,
          data: [
            [0, 2],
            [1, -1],
          ],
          mode: 'bar',
        },
        {
          seriesIndex: 1,
          data: [
            [0, 3],
            [1, -4],
          ],
          mode: 'bar',
        },
      ],
      'stacked',
      [undefined, 10],
    );

    expect(result.segments).toMatchObject([
      { category: 0, start: 10, end: 12 },
      { category: 1, start: 10, end: 9 },
      { category: 0, start: 12, end: 15 },
      { category: 1, start: 9, end: 5 },
    ]);
    expect(result.yValues).toEqual([10, 12, 9, 15, 5]);
  });

  it('accumulates four fractional series independently by sign', () => {
    const result = prepareBarSegments(
      [
        { seriesIndex: 0, data: [[0, 0.5]], mode: 'bar' },
        { seriesIndex: 1, data: [[0, 1.25]], mode: 'bar' },
        { seriesIndex: 2, data: [[0, -0.75]], mode: 'bar' },
        { seriesIndex: 3, data: [[0, -1.5]], mode: 'bar' },
      ],
      'stacked',
      [undefined, 2],
    );

    expect(result.segments.map(({ start, end }) => ({ start, end }))).toEqual([
      { start: 2, end: 2.5 },
      { start: 2.5, end: 3.75 },
      { start: 2, end: 1.25 },
      { start: 1.25, end: -0.25 },
    ]);
  });

  it('normalizes each positive category to one hundred percent', () => {
    const result = prepareBarSegments(
      [
        {
          seriesIndex: 0,
          data: [
            [0, 1],
            [1, 0],
            [2, null],
          ],
          mode: 'bar',
        },
        {
          seriesIndex: 1,
          data: [
            [0, 3],
            [1, 0],
            [2, 4],
          ],
          mode: 'bar',
        },
      ],
      'normalized',
      [undefined, 0],
    );

    expect(
      result.segments.map(({ category, value, start, end }) => ({
        category,
        value,
        start,
        end,
      })),
    ).toEqual([
      { category: 0, value: 25, start: 0, end: 25 },
      { category: 1, value: 0, start: 0, end: 0 },
      { category: 0, value: 75, start: 25, end: 100 },
      { category: 1, value: 0, start: 0, end: 0 },
      { category: 2, value: 100, start: 0, end: 100 },
    ]);
    expect(result.xValues).toEqual([0, 1, 2]);
    expect(result.yValues).toEqual([0, 25, 100]);
  });

  it('normalizes diverging values independently around a custom baseline', () => {
    const result = prepareBarSegments(
      [
        {
          seriesIndex: 0,
          data: [
            [0, 1],
            [1, -1],
          ],
          mode: 'bar',
        },
        {
          seriesIndex: 1,
          data: [
            [0, 3],
            [1, -4],
          ],
          mode: 'bar',
        },
      ],
      'normalized',
      [undefined, 10],
    );

    expect(result.segments.map(({ value, start, end }) => ({ value, start, end }))).toEqual([
      { value: 25, start: 10, end: 35 },
      { value: -20, start: 10, end: -10 },
      { value: 75, start: 35, end: 110 },
      { value: -80, start: -10, end: -90 },
    ]);
    expect(result.yValues).toEqual([10, 35, -10, 110, -90]);
  });

  it('normalizes horizontal values by Y category', () => {
    const result = prepareBarSegments(
      [
        { seriesIndex: 0, data: [[2, 5]], mode: 'horizontalBar' },
        { seriesIndex: 1, data: [[6, 5]], mode: 'horizontalBar' },
      ],
      'normalized',
      [0, undefined],
    );

    expect(
      result.segments.map(({ value, category, start, end }) => ({
        value,
        category,
        start,
        end,
      })),
    ).toEqual([
      { value: 25, category: 5, start: 0, end: 25 },
      { value: 75, category: 5, start: 25, end: 100 },
    ]);
    expect(result.xValues).toEqual([0, 25, 100]);
    expect(result.yValues).toEqual([5]);
  });

  it('uses Y categories and X values for horizontal bars', () => {
    const result = prepareBarSegments(
      [
        {
          seriesIndex: 0,
          data: [
            [2, 5],
            [3, null],
          ],
          mode: 'horizontalBar',
        },
        { seriesIndex: 1, data: [[4, 5]], mode: 'horizontalBar' },
      ],
      'stacked',
      [1, undefined],
    );

    expect(result.segments).toMatchObject([
      { value: 2, category: 5, start: 1, end: 3 },
      { value: 4, category: 5, start: 3, end: 7 },
    ]);
    expect(result.xValues).toEqual([1, 3, 7]);
    expect(result.yValues).toEqual([5]);
  });

  it('uses fractional absolute endpoints for grouped horizontal bars', () => {
    const result = prepareBarSegments(
      [
        {
          seriesIndex: 0,
          data: [
            [1.5, 0],
            [2.25, 1],
          ],
          mode: 'horizontalBar',
        },
        {
          seriesIndex: 1,
          data: [
            [3.75, 0],
            [0.5, 1],
          ],
          mode: 'horizontalBar',
        },
      ],
      'grouped',
      [1, undefined],
    );

    expect(result.segments.map(({ value, start, end }) => ({ value, start, end }))).toEqual([
      { value: 1.5, start: 1, end: 1.5 },
      { value: 2.25, start: 1, end: 2.25 },
      { value: 3.75, start: 1, end: 3.75 },
      { value: 0.5, start: 1, end: 0.5 },
    ]);
  });

  it('adds zero baselines when grouped axes have no configured center', () => {
    const result = prepareBarSegments(
      [
        { seriesIndex: 0, data: [[1, 2]], mode: 'bar' },
        { seriesIndex: 1, data: [[2, 3]], mode: 'horizontalBar' },
      ],
      'grouped',
      undefined,
    );

    expect(result.xValues).toContain(0);
    expect(result.yValues).toContain(0);
  });

  it('includes the baseline for label-enabled overlap domain inference', () => {
    const result = prepareBarSegments(
      [{ seriesIndex: 0, data: [[1, 2]], mode: 'bar' }],
      'overlap',
      [undefined, 0],
    );

    expect(result.yValues).toEqual([0, 2]);
  });

  it('rejects duplicate categories within one series', () => {
    expect(() =>
      prepareBarSegments(
        [
          {
            seriesIndex: 0,
            data: [
              [1, 2],
              [1, 3],
            ],
            mode: 'bar',
          },
        ],
        'grouped',
        [undefined, 0],
      ),
    ).toThrow('series[0].data[1][0]');
  });

  it('rejects duplicate Y categories in horizontal series', () => {
    expect(() =>
      prepareBarSegments(
        [
          {
            seriesIndex: 0,
            data: [
              [2, 1],
              [3, 1],
            ],
            mode: 'horizontalBar',
          },
        ],
        'grouped',
        [0, undefined],
      ),
    ).toThrow('series[0].data[1][1]');
  });

  it('places larger Y categories above smaller grouped horizontal categories', () => {
    const input: MultiLine = [
      [
        [1, 0],
        [4, 1],
      ],
      [
        [1, 0],
        [4, 1],
      ],
    ];
    const prepared = prepareBarSegments(
      input.map((data, seriesIndex) => ({
        seriesIndex,
        data,
        mode: 'horizontalBar' as const,
      })),
      'grouped',
      [0, undefined],
    );
    const graph = drawGraph({ plotWidth: 5, plotHeight: 4, emptySymbol: ' ' });

    drawPreparedBars({
      graph,
      segments: prepared.segments,
      plotWidth: 5,
      plotHeight: 4,
      xRange: [0, 4],
      yRange: [0, 1],
      axis: { x: 0, y: 3 },
      axisCenter: [0, undefined],
      colorInput: input,
      formatterPath: 'valueLabels.formatter.result',
      layoutPath: 'barLayout',
    });

    expect(graph[1].filter((cell) => cell === '█')).toHaveLength(5);
    expect(graph[3].filter((cell) => cell === '█')).toHaveLength(2);
  });

  it('omits whole segments outside explicit domains', () => {
    const prepared = prepareBarSegments(
      [
        {
          seriesIndex: 0,
          data: [
            [0, 1],
            [1, 5],
          ],
          mode: 'bar',
        },
      ],
      'grouped',
      [undefined, 0],
    );
    const graph = drawGraph({ plotWidth: 5, plotHeight: 4, emptySymbol: ' ' });

    const result = drawPreparedBars({
      graph,
      segments: prepared.segments,
      plotWidth: 5,
      plotHeight: 4,
      xRange: [0, 1],
      yRange: [0, 2],
      axis: { x: 0, y: 3 },
      axisCenter: [undefined, 0],
      colorInput: [
        [
          [0, 1],
          [1, 5],
        ],
      ],
      formatterPath: 'valueLabels.formatter.result',
      layoutPath: 'barLayout',
    });

    expect(result.scaledCoords).toHaveLength(1);
  });

  it('places complete labels and skips every unsafe placement', () => {
    const graph = [
      ['.', '.', '.', '.', '.'],
      ['.', 'X', '.', '.', '.'],
    ];

    drawBarValueLabels({
      graph,
      emptySymbol: '.',
      labels: [
        { x: 2, y: 0, cells: ['界', ''] },
        { x: 2, y: 0, cells: ['B'] },
        { x: 1, y: 1, cells: ['A'] },
        { x: -1, y: 0, cells: ['B'] },
        { x: 5, y: 0, cells: ['C'] },
        { x: 0, y: -1, cells: ['D'] },
        { x: 0, y: 2, cells: ['E'] },
      ],
    });

    expect(graph).toEqual([
      ['.', '.', '界', '', '.'],
      ['.', 'X', '.', '.', '.'],
    ]);
  });
});
