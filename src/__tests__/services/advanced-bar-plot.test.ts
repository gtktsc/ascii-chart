import { prepareAdvancedBarPlot } from '@services/plot/routing/advanced-bars';

describe('advanced bar plot preparation', () => {
  it('filters points and partial thresholds against both resolved domains', () => {
    const prepared = prepareAdvancedBarPlot(
      [[[1, 1]]],
      {
        mode: 'bar',
        barLayout: 'grouped',
        xAxis: { domain: [0, 2] },
        yAxis: { domain: [0, 2] },
        points: [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 1, y: 3 },
        ],
        thresholds: [{ x: 1 }, { y: 1 }, { x: 1, y: 1 }, { x: 3 }, { y: 3 }],
      },
      undefined,
    );

    expect(prepared?.settings.points).toEqual([{ x: 1, y: 1 }]);
    expect(prepared?.settings.thresholds).toEqual([{ x: 1 }, { y: 1 }, { x: 1, y: 1 }]);
  });

  it('uses the flat formatter when axis formatters are absent', () => {
    const prepared = prepareAdvancedBarPlot(
      [[[1, 1]]],
      {
        mode: 'bar',
        valueLabels: true,
        formatter: (value, { axis }) => `${axis}:${value}`,
      },
      undefined,
    );

    expect(prepared?.settings.formatter?.(1, { axis: 'x', xRange: [0, 1], yRange: [0, 1] })).toBe(
      'x:1',
    );
  });

  it('prepares an empty explicit-domain frame with one sizing slot', () => {
    const prepared = prepareAdvancedBarPlot(
      [],
      {
        mode: 'bar',
        barLayout: 'grouped',
        xAxis: { domain: [0, 1] },
        yAxis: { domain: [0, 1] },
      },
      undefined,
    );

    expect(prepared?.settings.width).toBe(1);
    expect(prepared?.settings.barSegments).toEqual([]);
  });
});
