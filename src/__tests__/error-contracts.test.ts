import { renderChart } from '@services/chart/render';
import { plot } from '@services/plot/plot';
import { candlestick } from '@services/renderers/candlestick';
import { heatmap } from '@services/renderers/heatmap';
import { histogram } from '@services/renderers/histogram';
import { sparkline } from '@services/renderers/sparkline';

describe('public error contracts', () => {
  test.each([
    ['invalid numeric value', () => plot([[0, Number.NaN]])],
    [
      'duplicate structured series id',
      () =>
        renderChart({
          series: [
            { id: 'duplicate', data: [] },
            { id: 'duplicate', data: [] },
          ],
        }),
    ],
    [
      'bar baseline outside domain',
      () =>
        plot([[0, 2]], {
          mode: 'bar',
          barLayout: 'grouped',
          yAxis: { domain: [1, 3] },
        }),
    ],
    [
      'grouped bar layout too narrow',
      () =>
        plot([[[0, 1]], [[0, 2]], [[0, 3]]], {
          mode: 'bar',
          barLayout: 'grouped',
          width: 2,
          xAxis: { domain: [0, 1] },
          yAxis: { domain: [0, 3] },
        }),
    ],
    ['candlestick high below close', () => candlestick({ data: [[1, 10, 9, 8, 11]] })],
    ['unsupported renderer', () => plot([[0, 1]], { renderer: 'pixels' as never })],
    ['invalid histogram bin count', () => histogram([1, 2, 3], { binCount: 0 })],
    [
      'heatmap cell without level',
      () => heatmap({ data: [['unknown']], levels: [{ value: 'known' }] }),
    ],
    ['non-finite sparkline value', () => sparkline([1, Number.POSITIVE_INFINITY, 2])],
    [
      'duplicate candlestick x value',
      () =>
        candlestick({
          data: [
            [1, 10, 12, 8, 11],
            [1, 11, 13, 9, 12],
          ],
        }),
    ],
    [
      'label collision error',
      () =>
        plot(
          [
            [0, 0],
            [1, 1],
          ],
          {
            width: 2,
            xAxis: {
              ticks: [0, 1],
              formatter: () => 'long-label',
              labelCollision: 'error',
            },
          },
        ),
    ],
    [
      'duplicate heatmap level',
      () => heatmap({ data: [['same']], levels: [{ value: 'same' }, { value: 'same' }] }),
    ],
    [
      'ragged heatmap rows',
      () =>
        heatmap({
          data: [[1, 1], [1]],
          levels: [{ value: 1 }],
        }),
    ],
  ])('throws for %s', (_title, run) => {
    expect(run).toThrow();
  });
});
