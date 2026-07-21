import { candlestick, heatmap, renderChart, sparkline } from '@ascii-chart';
import { Renderer } from '@types';

import { forEachRenderer } from './renderers';
import { withExampleTerminal } from './terminal';
import { SnapshotExample } from './types';

const rendererExamples = (
  title: string,
  render: (renderer: Renderer) => string,
): SnapshotExample[] =>
  forEachRenderer((renderer) => ({
    group: 'renderChart',
    title: `${title} [${renderer}]`,
    renderer,
    render: () => withExampleTerminal(() => render(renderer)),
  }));

/**
 * Examples covering custom symbol behavior.
 */
export const customSymbolExamples: readonly SnapshotExample[] = [
  {
    group: 'sparkline',
    title: 'custom sparkline glyph catalog',
    render: () =>
      sparkline([0, 1, 2, 3, 4, 5, 6, 7, null], {
        symbols: { levels: ['.', ':', '-', '=', '+', '*', '#', '@'], empty: '_' },
      }),
  },
  {
    group: 'heatmap',
    title: 'custom heatmap glyph catalog',
    render: () =>
      heatmap({
        data: [[-1, 1, null]],
        columns: ['low', 'high', 'none'],
        threshold: { value: 0, belowColor: 'ansiBlue', aboveColor: 'ansiRed' },
        symbols: { cell: '#', belowThreshold: '<', aboveThreshold: '>', empty: '_', gap: ' | ' },
      }),
  },
  {
    group: 'candlestick',
    title: 'custom candlestick glyph catalog',
    render: () =>
      withExampleTerminal(() =>
        candlestick({
          width: 22,
          height: 8,
          data: [
            [1, 4, 7, 2, 6],
            [2, 6, 8, 3, 4],
            [3, 5, 6, 5, 5],
          ],
          symbols: {
            candlestick: { wick: '!', rising: '+', falling: 'x', unchanged: '=' },
          },
        }),
      ),
  },
  ...rendererExamples('custom annotation glyph catalog', (renderer) =>
    renderChart({
      renderer,
      width: 30,
      height: 10,
      series: [
        {
          id: 'trend',
          data: [
            [0, 1],
            [5, 5],
            [10, 3],
          ],
        },
      ],
      xAxis: { domain: [0, 10] },
      yAxis: { domain: [0, 6] },
      annotations: [
        { id: 'span', type: 'span', axis: 'x', from: 2, to: 3 },
        { id: 'arrow', type: 'arrow', from: [1, 1], to: [8, 5] },
        { id: 'error', type: 'errorBar', x: 5, y: 3, xError: 1, yError: 1 },
      ],
      symbols: {
        annotations: {
          span: ':',
          arrowLine: '~',
          arrowHeads: { up: '^', down: 'v', left: '<', right: '>' },
          errorBar: {
            horizontal: '-',
            vertical: '!',
            leftCap: '[',
            rightCap: ']',
            topCap: '^',
            bottomCap: 'v',
            center: '+',
          },
        },
      },
    }),
  ),
  ...rendererExamples('custom ellipsis glyph', (renderer) =>
    renderChart({
      renderer,
      width: 18,
      height: 7,
      series: [
        {
          id: 'values',
          data: [
            [0, 1],
            [1, 3],
            [2, 2],
          ],
        },
      ],
      xAxis: {
        ticks: [0, 1, 2],
        labelCollision: 'truncate',
        formatter: (value) => `category-${value}-long`,
      },
      symbols: { ellipsis: '~' },
    }),
  ),
];
