import { HeatmapSpec } from '@types';
import { stripAnsi } from '@helpers/terminal-text';
import { ChartRangeError, ChartTypeError } from '@services/errors';
import { heatmap } from '@services/renderers/heatmap';

const ciMatrix: HeatmapSpec = {
  title: 'CI matrix',
  columns: ['Linux', 'macOS', 'Windows'],
  rows: ['Node 22', 'Node 24'],
  data: [
    ['pass', 'pass', 'fail'],
    ['pass', 'pending', 'pass'],
  ],
  levels: [
    { value: 'pass', symbol: '●', color: 'ansiGreen', label: 'Passed' },
    { value: 'pending', symbol: '○', color: 'ansiYellow', label: 'Pending' },
    { value: 'fail', symbol: '×', color: 'ansiRed', label: 'Failed' },
  ],
  legend: true,
};

describe('heatmap', () => {
  it('renders an aligned colored CI status matrix with title and legend', () => {
    const output = heatmap(ciMatrix);

    expect(stripAnsi(output)).toBe(
      [
        'CI matrix',
        '         Linux  macOS  Windows',
        'Node 22    ●      ●       ×',
        'Node 24    ●      ○       ●',
        '',
        '● Passed  ○ Pending  × Failed',
      ].join('\n'),
    );
    expect(output).toContain('\u001b[32m●\u001b[0m');
    expect(output).toContain('\u001b[31m×\u001b[0m');
  });

  it('uses terminal display width for CJK, emoji, and ANSI-styled labels', () => {
    const output = heatmap({
      columns: ['Mon', '📅'],
      rows: ['API', '\u001b[36m数据库\u001b[0m'],
      data: [
        [1, 0],
        [0, 1],
      ],
      levels: [
        { value: 0, symbol: '○' },
        { value: 1, symbol: '●' },
      ],
    });

    expect(stripAnsi(output)).toBe(
      ['        Mon  📅', 'API      ●   ○', '数据库   ○   ●'].join('\n'),
    );
  });

  it('renders compact unlabeled cells, null gaps, and default level symbols', () => {
    expect(
      heatmap({
        data: [
          ['hot', null, 'cold'],
          [null, 'hot', null],
        ],
        levels: [{ value: 'cold', symbol: '░' }, { value: 'hot' }],
      }),
    ).toBe('█     ░\n   █');
  });

  it('colors numeric cells below and at or above one threshold', () => {
    const output = heatmap({
      data: [
        [49, 50, null],
        [75, 100, 25],
      ],
      threshold: {
        value: 50,
        belowColor: 'ansiGreen',
        aboveColor: 'ansiRed',
      },
      legend: true,
    });

    expect(stripAnsi(output)).toBe('░  █\n█  █  ░\n\n░ < 50  █ ≥ 50');
    expect(output).toContain('\u001b[32m░\u001b[0m');
    expect(output).toContain('\u001b[31m█\u001b[0m');
  });

  it('supports custom threshold symbols and legend labels', () => {
    const output = heatmap({
      data: [[0.19, 0.2]],
      threshold: {
        value: 0.2,
        belowColor: 'ansiGreen',
        aboveColor: 'ansiBrightRed',
        belowSymbol: '·',
        aboveSymbol: '!',
        belowLabel: 'Within budget',
        aboveLabel: 'Budget exhausted',
      },
      legend: true,
    });

    expect(stripAnsi(output)).toBe('·  !\n\n· Within budget  ! Budget exhausted');
  });

  it('supports empty data and a standalone ordered legend', () => {
    expect(
      heatmap({
        data: [],
        levels: [
          { value: 2, symbol: '█', label: 'High' },
          { value: 1, symbol: '▒' },
        ],
        legend: true,
      }),
    ).toBe('█ High  ▒ 1');
  });

  it('omits empty header and legend sections', () => {
    expect(
      heatmap({
        title: 'Empty matrix',
        columns: [],
        rows: [],
        data: [],
        levels: [],
        legend: true,
      }),
    ).toBe('Empty matrix');
    expect(heatmap({ columns: ['A'], rows: [], data: [], levels: [] })).toBe('A');
  });

  it('does not leave trailing whitespace for an empty legend label', () => {
    expect(
      heatmap({
        data: [],
        levels: [{ value: 'ok', symbol: '●', label: '' }],
        legend: true,
      }),
    ).toBe('●');
  });

  it('does not mutate level or threshold specifications', () => {
    const spec = {
      columns: ['A'],
      rows: ['row'],
      data: [['ok']],
      levels: [{ value: 'ok', symbol: '●' }],
    } as const;
    const before = JSON.stringify(spec);

    heatmap(spec);

    expect(JSON.stringify(spec)).toBe(before);

    const thresholdSpec = {
      data: [[49, 50]],
      threshold: {
        value: 50,
        belowColor: 'ansiGreen',
        aboveColor: 'ansiRed',
      },
    } as const;
    const thresholdBefore = JSON.stringify(thresholdSpec);

    heatmap(thresholdSpec);

    expect(JSON.stringify(thresholdSpec)).toBe(thresholdBefore);
  });

  it.each([
    [null, 'spec', ChartTypeError],
    [{ levels: [] }, 'data', ChartTypeError],
    [{ data: 'bad', levels: [] }, 'data', ChartTypeError],
    [{ data: [[]], levels: 'bad' }, 'levels', ChartTypeError],
    [{ data: [null], levels: [] }, 'data[0]', ChartTypeError],
    [{ data: [[1], [1, 2]], levels: [{ value: 1 }, { value: 2 }] }, 'data[1]', ChartRangeError],
    [{ data: [[1]], rows: [], levels: [{ value: 1 }] }, 'rows', ChartRangeError],
    [{ data: [[1]], columns: [], levels: [{ value: 1 }] }, 'columns', ChartRangeError],
    [{ data: [[1]], rows: 'bad', levels: [{ value: 1 }] }, 'rows', ChartTypeError],
    [{ data: [[1]], columns: [1], levels: [{ value: 1 }] }, 'columns[0]', ChartTypeError],
    [{ data: [[1]], levels: [null] }, 'levels[0]', ChartTypeError],
    [{ data: [[1]], levels: [{ value: null }] }, 'levels[0].value', ChartTypeError],
    [{ data: [[1]], levels: [{ value: true }] }, 'levels[0].value', ChartTypeError],
    [{ data: [[1]], levels: [{ value: Number.NaN }] }, 'levels[0].value', ChartRangeError],
    [{ data: [[1]], levels: [{ value: 1 }, { value: 1 }] }, 'levels[1].value', ChartRangeError],
    [{ data: [[1]], levels: [{ value: 1, symbol: '🟢' }] }, 'levels[0].symbol', ChartRangeError],
    [{ data: [[1]], levels: [{ value: 1, color: 'green' }] }, 'levels[0].color', ChartRangeError],
    [{ data: [[1]], levels: [{ value: 1, label: 1 }] }, 'levels[0].label', ChartTypeError],
    [{ data: [[1]], levels: [{ value: 2 }] }, 'data[0][0]', ChartRangeError],
    [{ data: [[{}]], levels: [] }, 'data[0][0]', ChartTypeError],
    [{ data: [[Number.POSITIVE_INFINITY]], levels: [] }, 'data[0][0]', ChartRangeError],
    [
      {
        data: [[1]],
        levels: [{ value: 1 }],
        threshold: { value: 1, belowColor: 'ansiGreen', aboveColor: 'ansiRed' },
      },
      'spec',
      ChartTypeError,
    ],
    [{ data: [[1]], threshold: null }, 'threshold', ChartTypeError],
    [
      { data: [[1]], threshold: { value: '1', belowColor: 'ansiGreen', aboveColor: 'ansiRed' } },
      'threshold.value',
      ChartTypeError,
    ],
    [
      {
        data: [[1]],
        threshold: { value: Number.NaN, belowColor: 'ansiGreen', aboveColor: 'ansiRed' },
      },
      'threshold.value',
      ChartRangeError,
    ],
    [
      { data: [[1]], threshold: { value: 1, aboveColor: 'ansiRed' } },
      'threshold.belowColor',
      ChartTypeError,
    ],
    [
      { data: [[1]], threshold: { value: 1, belowColor: 'green', aboveColor: 'ansiRed' } },
      'threshold.belowColor',
      ChartRangeError,
    ],
    [
      { data: [[1]], threshold: { value: 1, belowColor: 'ansiGreen' } },
      'threshold.aboveColor',
      ChartTypeError,
    ],
    [
      {
        data: [[1]],
        threshold: {
          value: 1,
          belowColor: 'ansiGreen',
          aboveColor: 'ansiRed',
          belowSymbol: '🟢',
        },
      },
      'threshold.belowSymbol',
      ChartRangeError,
    ],
    [
      {
        data: [[1]],
        threshold: {
          value: 1,
          belowColor: 'ansiGreen',
          aboveColor: 'ansiRed',
          aboveLabel: 'bad\nlabel',
        },
      },
      'threshold.aboveLabel',
      ChartRangeError,
    ],
    [
      {
        data: [['high']],
        threshold: { value: 1, belowColor: 'ansiGreen', aboveColor: 'ansiRed' },
      },
      'data[0][0]',
      ChartTypeError,
    ],
    [{ data: [[]], levels: [], legend: 'yes' }, 'legend', ChartTypeError],
    [{ data: [[]], levels: [], title: 'bad\ntext' }, 'title', ChartRangeError],
  ] as const)('rejects invalid specifications %#', (spec, path, ErrorClass) => {
    expect(() => heatmap(spec as never)).toThrow(ErrorClass);
    expect(() => heatmap(spec as never)).toThrow(path);
  });
});
