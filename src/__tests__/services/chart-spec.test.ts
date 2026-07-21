import { segmentSeries } from '@services/chart/domain/clipping';
import { assertXAxisLabelsFit } from '@services/chart/domain/labels';
import { resolveDomain, resolveTicks } from '@services/chart/domain/ranges';
import { assertXAxis } from '@services/chart/validation/axes';
import { validateChartSpec } from '@services/chart/validation/input';
import { assertChartX, mergeXScale } from '@services/chart/validation/primitives';
import { validateCoordinates, validatePlotSettings } from '@services/plot/validation';

const series = [{ id: 'series', data: [[0, 0]] }];

describe('structured chart validation', () => {
  it('accepts every supported field shape', () => {
    expect(() =>
      validateChartSpec({
        series: [
          {
            id: 'series',
            name: 'Series',
            data: [
              [0, null],
              [1, 2],
            ],
            mode: 'bar',
            color: 'ansiCyan',
            fillArea: false,
            lineFormatter: () => ({ x: 0, y: 0, symbol: 'x' }),
          },
        ],
        width: 10,
        height: 5,
        renderer: 'braille',
        title: 'Title',
        overflow: 'clip',
        debugMode: false,
        barLayout: 'grouped',
        valueLabels: { formatter: (value: number) => value },
        xAxis: {
          domain: [0, 10],
          ticks: [0, 5, 10],
          label: 'X',
          hidden: false,
          hideTicks: false,
          showTickLabel: false,
          formatter: String,
        },
        yAxis: { domain: [0, 10], ticks: 2 },
        points: [{ id: 'point', name: 'Point', x: 1, y: 2, color: 'ansiBlue' }],
        thresholds: [{ id: 'threshold', name: 'Threshold', x: 1, y: 2, color: 'ansiRed' }],
        legend: {
          position: 'left',
          series: ['series'],
          points: true,
          thresholds: ['threshold'],
        },
        axisCenter: [undefined, 0],
        symbols: {},
      }),
    ).not.toThrow();
  });

  it.each(['overlap', 'grouped', 'stacked', 'normalized'] as const)(
    'accepts the %s bar layout through both public validators',
    (barLayout) => {
      expect(() => validateChartSpec({ series, barLayout })).not.toThrow();
      expect(() => validatePlotSettings({ barLayout })).not.toThrow();
    },
  );

  it('accepts adaptive dimensions, collisions, and legend placement', () => {
    expect(() =>
      validateChartSpec({
        series,
        width: 'auto',
        aspectRatio: 2,
        xAxis: { labelCollision: 'wrap' },
        legend: { position: 'auto' },
      }),
    ).not.toThrow();
    expect(() =>
      validatePlotSettings({
        width: 'auto',
        aspectRatio: 2,
        xAxis: { labelCollision: 'truncate' },
        legend: { position: 'auto' },
      }),
    ).not.toThrow();
  });

  it.each([
    [null, 'spec'],
    [[], 'spec'],
    ['chart', 'spec'],
    [{ series: 'bad' }, 'series'],
    [{ series: [null] }, 'series[0]'],
    [{ series: [{ id: 1, data: [] }] }, 'series[0].id'],
    [{ series: [{ id: ' ', data: [] }] }, 'series[0].id'],
    [{ series: [{ id: 's', name: 1, data: [] }] }, 'series[0].name'],
    [{ series: [{ id: 's', data: 'bad' }] }, 'series[0].data'],
    [{ series: [{ id: 's', data: [null] }] }, 'series[0].data[0]'],
    [{ series: [{ id: 's', data: [[0]] }] }, 'series[0].data[0]'],
    [{ series: [{ id: 's', data: [[{}, 1]] }] }, 'series[0].data[0][0]'],
    [{ series: [{ id: 's', data: [[0, '1']] }] }, 'series[0].data[0][1]'],
    [{ series: [{ id: 's', data: [], fillArea: 'yes' }] }, 'series[0].fillArea'],
    [{ series: [{ id: 's', data: [], lineFormatter: true }] }, 'series[0].lineFormatter'],
    [{ series, width: 'wide' }, 'width'],
    [{ series, aspectRatio: 0 }, 'aspectRatio'],
    [{ series, renderer: 'pixels' }, 'renderer'],
    [{ series, title: 1 }, 'title'],
    [{ series, overflow: 'extend' }, 'overflow'],
    [{ series, debugMode: 'yes' }, 'debugMode'],
    [{ series, barLayout: 'clustered' }, 'barLayout'],
    [{ series, valueLabels: [] }, 'valueLabels'],
    [{ series, valueLabels: { formatter: true } }, 'valueLabels.formatter'],
    [{ series, xAxis: null }, 'xAxis'],
    [{ series, xAxis: { domain: null } }, 'xAxis.domain'],
    [{ series, xAxis: { domain: [0] } }, 'xAxis.domain'],
    [{ series, xAxis: { domain: ['0', 1] } }, 'xAxis.domain[0]'],
    [{ series, xAxis: { domain: [0, Number.NaN] } }, 'xAxis.domain[1]'],
    [{ series, xAxis: { ticks: [] } }, 'xAxis.ticks'],
    [{ series, xAxis: { ticks: [0, '1'] } }, 'xAxis.ticks[1]'],
    [{ series, xAxis: { ticks: {} } }, 'xAxis.ticks'],
    [{ series, xAxis: { label: 1 } }, 'xAxis.label'],
    [{ series, xAxis: { hidden: 'yes' } }, 'xAxis.hidden'],
    [{ series, xAxis: { hideTicks: 'yes' } }, 'xAxis.hideTicks'],
    [{ series, xAxis: { showTickLabel: 'yes' } }, 'xAxis.showTickLabel'],
    [{ series, xAxis: { labelCollision: 'shift' } }, 'xAxis.labelCollision'],
    [{ series, xAxis: { formatter: 'bad' } }, 'xAxis.formatter'],
    [{ series, points: {} }, 'points'],
    [{ series, points: [null] }, 'points[0]'],
    [{ series, points: [{ id: 'p', x: '0', y: 1 }] }, 'points[0].x'],
    [{ series, points: [{ id: 'p', x: 0, y: '1' }] }, 'points[0].y'],
    [{ series, points: [{ id: 'p', x: 0, y: 1, color: 1 }] }, 'points[0].color'],
    [{ series, points: [{ id: 'p', name: 1, x: 0, y: 1 }] }, 'points[0].name'],
    [
      {
        series,
        points: [
          { id: 'p', x: 0, y: 1 },
          { id: 'p', x: 1, y: 2 },
        ],
      },
      'points[1].id',
    ],
    [{ series, thresholds: {} }, 'thresholds'],
    [{ series, thresholds: [{ id: 't', x: '0' }] }, 'thresholds[0].x'],
    [{ series, thresholds: [{ id: 't', y: '0' }] }, 'thresholds[0].y'],
    [{ series, thresholds: [{ id: 't', x: 0, color: 1 }] }, 'thresholds[0].color'],
    [{ series, legend: null }, 'legend'],
    [{ series, legend: { position: 'middle' } }, 'legend.position'],
    [{ series, legend: { position: 'right', series: 'series' } }, 'legend.series'],
    [{ series, legend: { position: 'right', series: [1] } }, 'legend.series[0]'],
    [{ series, legend: { position: 'right', points: ['missing'] } }, 'legend.points[0]'],
    [{ series, axisCenter: null }, 'axisCenter'],
    [{ series, axisCenter: [0] }, 'axisCenter'],
    [{ series, axisCenter: ['0', 1] }, 'axisCenter[0]'],
    [
      {
        series: [{ id: 'band-bars', mode: 'horizontalBar', data: [['one', 1]] }],
        xAxis: { scale: 'band' },
      },
      'series[0].mode',
    ],
    [{ series, symbols: [] }, 'symbols'],
  ])('rejects malformed runtime input at %s', (spec, path) => {
    expect(() => validateChartSpec(spec)).toThrow(path as string);
  });
});

describe('structured chart scale helpers', () => {
  it('resolves explicit, inferred, and unavailable domains', () => {
    expect(resolveDomain({ domain: [0, 10] }, [2, 3])).toEqual([0, 10]);
    expect(resolveDomain(undefined, [3, 1, 2])).toEqual([1, 3]);
    expect(resolveDomain(undefined, [])).toBeUndefined();
  });

  it('resolves numeric, explicit, and filtered default ticks', () => {
    expect(resolveTicks({ ticks: 3 }, [0, 10], [], 'xAxis')).toEqual([0, 5, 10]);
    expect(resolveTicks({ ticks: [0, 10] }, [0, 10], [], 'xAxis')).toEqual([0, 10]);
    expect(resolveTicks(undefined, [0, 10], [-1, 5, 0, 10, 5, 11], 'xAxis')).toEqual([0, 5, 10]);
  });

  it('rejects impossible or out-of-domain tick configurations', () => {
    expect(() => resolveTicks({ ticks: 2 }, [1, 1], [1], 'xAxis')).toThrow(/zero-span/);
    expect(() => resolveTicks({ ticks: [-1, 1] }, [0, 1], [], 'xAxis')).toThrow(/xAxis.ticks\[0\]/);
    expect(() => resolveTicks({ ticks: [0, 2] }, [0, 1], [], 'xAxis')).toThrow(/xAxis.ticks\[1\]/);
  });

  it('handles label-fit early returns, ANSI formatters, and zero spans', () => {
    expect(() =>
      assertXAxisLabelsFit({
        axis: undefined,
        ticks: [0, 1],
        xDomain: [0, 1],
        yDomain: [0, 1],
        width: 1,
      }),
    ).not.toThrow();
    expect(() =>
      assertXAxisLabelsFit({
        axis: { ticks: [0] },
        ticks: [0],
        xDomain: [0, 1],
        yDomain: [0, 1],
        width: 1,
      }),
    ).not.toThrow();
    expect(() =>
      assertXAxisLabelsFit({
        axis: { ticks: [0, 1], formatter: (value) => `\u001b[31m${value}\u001b[0m` },
        ticks: [0, 1],
        xDomain: [0, 1],
        yDomain: [0, 1],
        width: 4,
      }),
    ).not.toThrow();
    expect(() =>
      assertXAxisLabelsFit({
        axis: { ticks: [1, 1] },
        ticks: [1, 1],
        xDomain: [1, 1],
        yDomain: [0, 1],
        width: 4,
      }),
    ).toThrow(/xAxis.ticks/);
  });

  it('segments stably at every missing and clipped point', () => {
    expect(
      segmentSeries(
        [
          [2, 2],
          [0, null],
          [1, 1],
          [2, 3],
          [3, 9],
          [4, 4],
          [5, null],
        ],
        [1, 4],
        [1, 4],
      ),
    ).toEqual([
      [
        [1, 1],
        [2, 2],
        [2, 3],
      ],
      [[4, 4]],
    ]);
  });

  it('geometrically clips line segments to both domains', () => {
    expect(
      segmentSeries(
        [
          [-2, 2],
          [2, 6],
          [6, 2],
          [7, null],
          [8, -2],
          [12, 2],
          [16, 6],
        ],
        [0, 14],
        [0, 4],
        'clip',
      ),
    ).toEqual([
      [[0, 4]],
      [
        [4, 4],
        [6, 2],
      ],
      [
        [10, 0],
        [12, 2],
        [14, 4],
      ],
    ]);
  });

  it('preserves isolated in-domain points and discards isolated outside points while clipping', () => {
    expect(
      segmentSeries(
        [
          [-1, 1],
          [0, null],
          [1, 1],
          [2, null],
          [3, 1],
        ],
        [0, 2],
        [0, 2],
        'clip',
      ),
    ).toEqual([[[1, 1]]]);
  });
});

describe('native X-axis validation', () => {
  it('recognizes each native X kind and preserves an existing kind', () => {
    expect(assertChartX(1, 'x')).toBe('linear');
    expect(assertChartX('one', 'x')).toBe('band');
    expect(assertChartX(new Date('2026-01-01T00:00:00.000Z'), 'x')).toBe('time');
    expect(mergeXScale('band', 'band', 'x')).toBe('band');
    expect(assertXAxis(undefined, 'xAxis', 'time')).toBe('time');
    expect(assertXAxis({ scale: 'band' }, 'xAxis', undefined)).toBe('band');
  });

  it.each([
    [new Date('invalid'), 'x'],
    [{}, 'x'],
    [{ scale: 'log' }, 'xAxis.scale'],
    [{ domain: null }, 'xAxis.domain'],
    [{ domain: [] }, 'xAxis.domain'],
    [{ domain: [0, 1, 2] }, 'xAxis.domain'],
    [{ domain: [2, 1] }, 'xAxis.domain'],
    [{ domain: ['one', 'one'] }, 'xAxis.domain[1]'],
    [{ ticks: 1 }, 'xAxis.ticks'],
    [{ ticks: [] }, 'xAxis.ticks'],
    [{ ticks: {} }, 'xAxis.ticks'],
    [{ ticks: [2, 1] }, 'xAxis.ticks'],
    [{ domain: ['one', 'two'], ticks: ['missing'] }, 'xAxis.ticks[0]'],
    [{ domain: ['one', 'two'], ticks: ['two', 'one'] }, 'xAxis.ticks'],
    [{ formatter: true }, 'xAxis.formatter'],
    [{ showTickLabel: 'yes' }, 'xAxis.showTickLabel'],
  ])('rejects invalid X-axis input %s', (axisOrValue, path) => {
    const run =
      path === 'x'
        ? () => assertChartX(axisOrValue, path)
        : () => assertXAxis(axisOrValue, 'xAxis', undefined);
    expect(run).toThrow(path as string);
  });

  it('rejects an explicit scale that conflicts with native data', () => {
    expect(() => assertXAxis({ scale: 'time' }, 'xAxis', 'band')).toThrow('xAxis.scale');
    expect(() => mergeXScale('linear', 'band', 'series[0].data[1][0]')).toThrow(
      'series[0].data[1][0]',
    );
  });

  it('accepts ordered category and Date domains and ticks', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const end = new Date('2026-01-02T00:00:00.000Z');
    expect(
      assertXAxis(
        { domain: ['one', 'two'], ticks: ['one', 'two'], label: 'X', hidden: false },
        'xAxis',
        undefined,
      ),
    ).toBe('band');
    expect(assertXAxis({ ticks: ['one', 'two'] }, 'xAxis', 'band')).toBe('band');
    expect(assertXAxis({ domain: [start, end], ticks: [start, end] }, 'xAxis', undefined)).toBe(
      'time',
    );
  });
});

describe('plot boundary validation', () => {
  it.each([
    [null, 'coordinates'],
    [[0], 'coordinates[0]'],
    [[[[0, 1]], 2], 'coordinates[1]'],
    [[['x', 1]], 'coordinates[0][0]'],
    [[[0, undefined]], 'coordinates[0][1]'],
  ])('rejects malformed coordinates at %s', (coordinates, path) => {
    expect(() => validateCoordinates(coordinates)).toThrow(path as string);
  });

  it.each([
    [null, 'settings'],
    [{ height: Number.POSITIVE_INFINITY }, 'settings.height'],
    [{ height: 0 }, 'settings.height'],
    [{ aspectRatio: 0 }, 'settings.aspectRatio'],
    [{ yRange: [1, 0] }, 'settings.yAxis.domain'],
    [{ xAxis: { domain: null } }, 'settings.xAxis.domain'],
    [{ xAxis: { ticks: 1 } }, 'settings.xAxis.ticks'],
    [{ xAxis: { ticks: {} } }, 'settings.xAxis.ticks'],
    [{ xAxis: { formatter: true } }, 'settings.xAxis.formatter'],
    [{ customXAxisTicks: [] }, 'settings.xAxis.ticks'],
    [{ customYAxisTicks: [1, 0] }, 'settings.yAxis.ticks'],
    [{ xAxis: { labelCollision: 'shift' } }, 'settings.xAxis.labelCollision'],
    [{ formatter: true }, 'settings.formatter'],
    [{ renderer: 'pixels' }, 'settings.renderer'],
    [{ mode: 'spline' }, 'settings.mode'],
    [{ overflow: 'extend' }, 'settings.overflow'],
    [{ barLayout: 'clustered' }, 'settings.barLayout'],
    [{ valueLabels: [] }, 'settings.valueLabels'],
    [{ valueLabels: { formatter: true } }, 'settings.valueLabels.formatter'],
    [{ color: ['ansiRed', 'cyan'] }, 'settings.color[1]'],
    [{ points: {} }, 'settings.points'],
    [{ points: [null] }, 'settings.points[0]'],
    [{ points: [{ x: 0, y: Number.NaN }] }, 'settings.points[0].y'],
    [{ thresholds: {} }, 'settings.thresholds'],
    [{ thresholds: [{}] }, 'settings.thresholds[0]'],
    [{ thresholds: [{ x: 'x' }] }, 'settings.thresholds[0].x'],
    [{ legend: { position: 'middle' } }, 'settings.legend.position'],
    [{ legend: { series: 1 } }, 'settings.legend.series'],
    [{ legend: { points: [1] } }, 'settings.legend.points[0]'],
    [{ axisCenter: [0] }, 'settings.axisCenter'],
    [{ axisCenter: [Number.NaN, undefined] }, 'settings.axisCenter[0]'],
    [{ symbols: { axis: { we: '🙂' } } }, 'settings.symbols.axis.we'],
  ])('rejects malformed settings at %s', (settings, path) => {
    expect(() => validatePlotSettings(settings)).toThrow(path as string);
  });

  it('accepts forward-compatible unknown fields and every known plot group', () => {
    expect(() =>
      validatePlotSettings({
        future: true,
        renderer: 'braille',
        color: 'ansiBlue',
        points: [{ x: 0, y: 0, color: 'ansiRed' }],
        thresholds: [{ x: 0, y: 0, color: 'ansiGreen' }],
        legend: { position: 'top', series: 'Series', points: ['Point'], thresholds: 'Limit' },
        axisCenter: [undefined, 0],
      }),
    ).not.toThrow();
  });
});
