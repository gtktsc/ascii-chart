import { mixedChartDefinitions, mixedChartExamples } from '@examples/mixed';
import { RENDERERS } from '@examples/renderers';
import { renderChart } from '@services/chart/render';

describe('mixed line and bar examples', () => {
  it('provides exactly twenty distinct mixed chart definitions', () => {
    expect(mixedChartDefinitions).toHaveLength(20);
    expect(new Set(mixedChartDefinitions.map(({ title }) => title))).toHaveProperty('size', 20);

    mixedChartDefinitions.forEach(({ spec }) => {
      const modes = new Set(spec.series.map(({ mode }) => mode ?? 'line'));

      expect(modes.has('bar')).toBe(true);
      expect(modes.has('line')).toBe(true);
    });
  });

  it('renders every definition with every backend', () => {
    expect(mixedChartExamples).toHaveLength(20 * RENDERERS.length);

    const rendererCounts = Object.fromEntries(RENDERERS.map((renderer) => [renderer, 0]));
    mixedChartExamples.forEach(({ renderer, render }) => {
      rendererCounts[renderer!]++;
      expect(render().trim()).not.toBe('');
    });

    RENDERERS.forEach((renderer) => expect(rendererCounts[renderer]).toBe(20));
  });

  it('moves colliding monthly revenue labels instead of hiding them', () => {
    const definition = mixedChartDefinitions.find(
      ({ title }) => title === 'mixed monthly revenue and target',
    )!;

    RENDERERS.forEach((renderer) => {
      const chart = renderChart({
        ...definition.spec,
        renderer,
        valueLabels: { formatter: (value) => `v${value}` },
      });

      ['v42', 'v55', 'v49', 'v68'].forEach((label) => {
        expect(chart).toContain(label);
      });
    });
  });
});
