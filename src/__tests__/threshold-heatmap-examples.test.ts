import { snapshotExamples } from '@examples';
import { ANSI_COLORS } from '@constants/ansi';
import { thresholdHeatmapExamples, thresholdHeatmapScenarios } from '@examples/threshold-heatmaps';
import { stripAnsi } from '@helpers/terminal-text';

describe('threshold heatmap snapshot examples', () => {
  it('includes ten distinct numeric threshold scenarios', () => {
    expect(thresholdHeatmapScenarios).toHaveLength(10);
    expect(new Set(thresholdHeatmapScenarios.map(({ title }) => title))).toHaveProperty('size', 10);
    expect(
      new Set(thresholdHeatmapScenarios.map(({ threshold }) => threshold.value)),
    ).toHaveProperty('size', 10);
  });

  it('registers every scenario as a visible two-color heatmap snapshot', () => {
    const registeredTitles = new Set(snapshotExamples.map(({ title }) => title));

    thresholdHeatmapScenarios.forEach((scenario, index) => {
      const example = thresholdHeatmapExamples[index];
      const output = example.render();

      expect(example.group).toBe('heatmap');
      expect(example.title).toBe(scenario.title);
      expect(registeredTitles).toContain(scenario.title);
      expect(stripAnsi(output)).toContain(scenario.title);
      expect(output).toContain(ANSI_COLORS[scenario.threshold.belowColor]);
      expect(output).toContain(ANSI_COLORS[scenario.threshold.aboveColor]);
    });
  });
});
