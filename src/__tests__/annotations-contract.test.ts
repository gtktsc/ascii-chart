import { renderChart } from '@ascii-chart';
import { ChartSpec } from '@types';
import { validateChartSpec } from '@services/chart/validation/input';

describe('annotation public contract', () => {
  it('accepts every numeric annotation variant', () => {
    expect(() =>
      validateChartSpec({
        series: [{ id: 'series', data: [[0, 0]] }],
        annotations: [
          { id: 'x-span', type: 'span', axis: 'x', from: 0, to: 1, symbol: 's' },
          { id: 'y-span', type: 'span', axis: 'y', from: 0, to: 1, color: 'ansiBlue' },
          { id: 'text', type: 'text', x: 0, y: 0, text: 'label', align: 'center' },
          { id: 'arrow', type: 'arrow', from: [0, 0], to: [1, 1], lineSymbol: '.' },
          { id: 'error', type: 'errorBar', x: 0, y: 0, xError: [1, 2], yError: 3 },
        ],
      }),
    ).not.toThrow();
  });

  it.each([
    [{ annotations: {} }, 'annotations'],
    [{ annotations: [null] }, 'annotations[0]'],
    [
      {
        annotations: [
          { id: 'same', type: 'text', x: 0, y: 0, text: 'one' },
          { id: 'same', type: 'text', x: 0, y: 0, text: 'two' },
        ],
      },
      'annotations[1].id',
    ],
    [{ annotations: [{ id: 'bad', type: 'shape' }] }, 'annotations[0].type'],
    [
      { annotations: [{ id: 'bad', type: 'span', axis: 'z', from: 0, to: 1 }] },
      'annotations[0].axis',
    ],
    [
      { annotations: [{ id: 'bad', type: 'span', axis: 'y', from: 2, to: 1 }] },
      'annotations[0].to',
    ],
    [
      { annotations: [{ id: 'bad', type: 'span', axis: 'x', from: 2, to: 1 }] },
      'annotations[0].to',
    ],
    [
      { annotations: [{ id: 'bad', type: 'text', x: 0, y: 0, text: 'line\nbreak' }] },
      'annotations[0].text',
    ],
    [{ annotations: [{ id: 'bad', type: 'text', x: 0, y: 0, text: '' }] }, 'annotations[0].text'],
    [
      { annotations: [{ id: 'bad', type: 'text', x: 0, y: 0, text: 'x', align: 'top' }] },
      'annotations[0].align',
    ],
    [{ annotations: [{ id: 'bad', type: 'arrow', from: [0], to: [1, 1] }] }, 'annotations[0].from'],
    [
      { annotations: [{ id: 'bad', type: 'arrow', from: [0, 0], to: [0, 0] }] },
      'annotations[0].to',
    ],
    [
      {
        annotations: [{ id: 'bad', type: 'arrow', from: [0, 0], to: [1, 1], lineSymbol: '🙂' }],
      },
      'annotations[0].lineSymbol',
    ],
    [{ annotations: [{ id: 'bad', type: 'errorBar', x: 0, y: 0 }] }, 'annotations[0]'],
    [
      { annotations: [{ id: 'bad', type: 'errorBar', x: 0, y: 0, xError: -1 }] },
      'annotations[0].xError',
    ],
    [
      { annotations: [{ id: 'bad', type: 'errorBar', x: 0, y: 0, yError: [1] }] },
      'annotations[0].yError',
    ],
    [
      { annotations: [{ id: 'bad', type: 'text', x: 0, y: 0, text: 'x', color: 'red' }] },
      'annotations[0].color',
    ],
  ])('rejects malformed annotations at $1', (partial, path) => {
    expect(() =>
      validateChartSpec({
        series: [{ id: 'series', data: [[0, 0]] }],
        ...(partial as object),
      }),
    ).toThrow(path as string);
  });

  it('renders numeric spans, text, arrows, and error bars together', () => {
    const chart = renderChart({
      width: 20,
      height: 8,
      series: [
        {
          id: 'series',
          data: [
            [0, 0],
            [10, 10],
          ],
        },
      ],
      xAxis: { domain: [0, 10], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 10], hidden: true, hideTicks: true },
      annotations: [
        { id: 'span', type: 'span', axis: 'y', from: 2, to: 3 },
        { id: 'text', type: 'text', x: 3, y: 8, text: 'peak' },
        { id: 'arrow', type: 'arrow', from: [6, 8], to: [8, 6] },
        { id: 'error', type: 'errorBar', x: 4, y: 5, xError: 1, yError: [1, 2] },
      ],
    });

    expect(chart).toContain('░');
    expect(chart).toContain('peak');
    expect(chart).toContain('↘');
    expect(chart).toContain('┼');
  });

  it('uses native category coordinates and rejects categorical X error magnitudes', () => {
    const spec: ChartSpec<string> = {
      width: 18,
      height: 6,
      series: [
        {
          id: 'series',
          data: [
            ['Mon', 1],
            ['Wed', 3],
          ],
        },
      ],
      xAxis: { domain: ['Mon', 'Tue', 'Wed'], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 5], hidden: true, hideTicks: true },
      annotations: [
        { id: 'span', type: 'span', axis: 'x', from: 'Mon', to: 'Tue' },
        { id: 'arrow', type: 'arrow', from: ['Mon', 4], to: ['Wed', 3] },
        { id: 'error', type: 'errorBar', x: 'Wed', y: 2, yError: 1 },
        { id: 'text', type: 'text', x: 'Tue', y: 4, text: 'event', align: 'center' },
      ],
    };

    const chart = renderChart(spec);
    expect(chart).toContain('░');
    expect(chart).toContain('event');
    expect(chart).toContain('┼');

    expect(() =>
      validateChartSpec({
        ...spec,
        annotations: [{ id: 'bad', type: 'errorBar', x: 'Mon', y: 1, xError: 1 }],
      }),
    ).toThrow('annotations[0].xError');
  });

  it('uses Date anchors and millisecond X error magnitudes', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const middle = new Date('2026-01-01T12:00:00.000Z');
    const end = new Date('2026-01-02T00:00:00.000Z');
    const chart = renderChart({
      width: 20,
      height: 6,
      series: [
        {
          id: 'series',
          data: [
            [start, 1],
            [end, 3],
          ],
        },
      ],
      xAxis: { domain: [start, end], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 5], hidden: true, hideTicks: true },
      annotations: [
        { id: 'span', type: 'span', axis: 'x', from: start, to: middle },
        { id: 'text', type: 'text', x: middle, y: 4, text: 'noon', align: 'center' },
        {
          id: 'error',
          type: 'errorBar',
          x: middle,
          y: 2,
          xError: 3_600_000,
          yError: 1,
        },
      ],
    });

    expect(chart).toContain('░');
    expect(chart).toContain('noon');
    expect(chart).toContain('┼');
  });

  it('renders annotations at terminal-cell resolution after Braille folding', () => {
    const chart = renderChart({
      renderer: 'braille',
      width: 12,
      height: 5,
      series: [
        {
          id: 'series',
          data: [
            [0, 0],
            [10, 10],
          ],
        },
      ],
      xAxis: { domain: [0, 10], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 10], hidden: true, hideTicks: true },
      annotations: [
        { id: 'text', type: 'text', x: 5, y: 8, text: 'note' },
        { id: 'error', type: 'errorBar', x: 5, y: 3, yError: 1 },
      ],
    });

    expect(chart).toContain('note');
    expect(chart).toContain('┼');
    expect(chart).toMatch(/[⠀-⣿]/u);
  });
});
