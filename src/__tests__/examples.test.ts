import { plot, renderChart } from '@ascii-chart';
import { examples, RENDERERS, toChartSpec } from '@examples';
import { Color } from '@types';
import { ANSI_COLORS } from '@constants/ansi';

describe('color examples', () => {
  it('includes one graph for every supported ANSI color', () => {
    const colors = Object.keys(ANSI_COLORS) as Color[];
    const colorExamples = examples.filter(([, settings]) => settings.title.startsWith('color: '));

    expect(colorExamples.map(([, settings]) => settings.color)).toEqual(
      colors.flatMap((color) => RENDERERS.map(() => color)),
    );
    expect(colorExamples.map(([, settings]) => settings.title)).toEqual(
      colors.flatMap((color) => RENDERERS.map((renderer) => `color: ${color} [${renderer}]`)),
    );
  });

  it('converts flat plot settings into valid structured chart specs', () => {
    const singlePointSpec = toChartSpec([[1, 1]], { title: 'single point' });
    const richSpec = toChartSpec([[2, 2]], {
      title: 'rich fixture',
      width: 10,
      yRange: [0, 3],
      customXAxisTicks: [1, 2, 3],
      formatter: (value, { axis }) => `${axis}${value}`,
      color: () => 'ansiRed',
      interpolation: 'linear',
      coloring: {
        type: 'gradient',
        by: 'y',
        colors: ['ansiGreen', 'ansiYellow'],
      },
      points: [
        { x: 2, y: 1, color: 'ansiBlue' },
        { x: 2, y: 2 },
      ],
      thresholds: [{ y: 1 }, { y: 2 }],
      legend: {
        points: 'Point',
        thresholds: ['Threshold'],
      },
    });

    expect(singlePointSpec.xAxis?.domain).toEqual([1, 2]);
    expect(singlePointSpec.yAxis?.domain).toEqual([1, 2]);
    expect(richSpec.width).toBe(10);
    expect(richSpec.yAxis?.domain).toEqual([0, 3]);
    expect(richSpec.series[0].color).toBe('ansiRed');
    expect(richSpec.series[0].interpolation).toBe('linear');
    expect(richSpec.series[0].coloring).toEqual({
      type: 'gradient',
      by: 'y',
      colors: ['ansiGreen', 'ansiYellow'],
    });
    expect(richSpec.legend).toEqual({
      position: 'bottom',
      series: false,
      points: ['point-1'],
      thresholds: ['threshold-1'],
    });
    expect(richSpec.points?.map(({ name }) => name)).toEqual(['Point', 'point-2']);
    expect(richSpec.thresholds?.map(({ name }) => name)).toEqual(['Threshold', 'threshold-2']);
    expect(renderChart(richSpec)).not.toBe('');
  });

  it('preserves formatter layout when range filtering removes every point', () => {
    const data = [[1, 1]] as [number, number][];
    const settings = {
      title: 'empty formatted fixture',
      width: 10,
      height: 5,
      yRange: [2, 3] as [number, number],
      formatter: (value: number) => `value:${value}`,
    };

    expect(renderChart(toChartSpec(data, settings))).toBe(plot(data, settings));
  });

  it('maps indexed plot coloring to matching structured series', () => {
    const spec = toChartSpec([[[0, 0]], [[1, 1]]], {
      title: 'indexed coloring',
      coloring: [
        { type: 'gradient', by: 'x', colors: ['ansiRed', 'ansiBlue'] },
        { type: 'conditional', getColor: () => 'ansiGreen' },
      ],
    });

    expect(spec.series[0].coloring?.type).toBe('gradient');
    expect(spec.series[1].coloring?.type).toBe('conditional');
  });

  it('includes at least twenty-four advanced bar-option variants for both APIs', () => {
    const barExamples = examples.filter(([, settings]) =>
      settings.title.startsWith('bar options:'),
    );

    barExamples.forEach(([data, settings, spec]) => {
      expect(spec.barLayout).toBe(settings.barLayout);
      expect(spec.valueLabels).toBe(settings.valueLabels);
      expect(renderChart(spec)).toBe(plot(data, settings));
    });

    expect(barExamples.length).toBeGreaterThanOrEqual(24);
    expect(barExamples.map(([, settings]) => settings.barLayout)).toContain('grouped');
    expect(barExamples.map(([, settings]) => settings.barLayout)).toContain('stacked');
    expect(barExamples.map(([, settings]) => settings.mode)).toContain('bar');
    expect(barExamples.map(([, settings]) => settings.mode)).toContain('horizontalBar');
    expect(
      barExamples.filter(([, settings]) => Boolean(settings.valueLabels)).length,
    ).toBeGreaterThanOrEqual(8);
    expect(
      barExamples.map(([, settings]) => settings.title.replace(/ \[(ascii|braille)\]$/, '')),
    ).toEqual(
      expect.arrayContaining([
        'bar options: grouped sparse categories',
        'bar options: grouped fractional values',
        'bar options: stacked four series',
        'bar options: stacked fractional values',
        'bar options: overlapping multi-series bars',
      ]),
    );
  });

  it('shows every compact default bar value label in both renderers', () => {
    const compactExamples = examples.filter(([, settings]) =>
      settings.title.startsWith('bar options: compact default value labels'),
    );

    expect(compactExamples).toHaveLength(2);
    compactExamples.forEach(([data, settings]) => {
      const chart = plot(data, settings);

      expect(chart).toContain('1.500k');
      expect(chart).toContain('2.250k');
      expect(chart).toContain('750');
    });
  });
});
