import { snapshotExamples } from '@examples';
import { ANSI_COLORS } from '@constants/ansi';
import {
  thresholdSparklineExamples,
  thresholdSparklineScenarios,
} from '@examples/threshold-sparklines';
import { stripAnsi } from '@helpers/terminal-text';

describe('threshold sparkline snapshot examples', () => {
  it('includes six small and six wide scenarios with distinct thresholds and color pairs', () => {
    const small = thresholdSparklineScenarios.filter(({ size }) => size === 'small');
    const wide = thresholdSparklineScenarios.filter(({ size }) => size === 'wide');

    expect(thresholdSparklineScenarios).toHaveLength(12);
    expect(small).toHaveLength(6);
    expect(wide).toHaveLength(6);
    expect(small.every(({ values }) => values.length <= 8)).toBe(true);
    expect(wide.every(({ values }) => values.length >= 24)).toBe(true);
    expect(
      new Set(thresholdSparklineScenarios.map(({ values }) => JSON.stringify(values))),
    ).toHaveProperty('size', 12);
    expect(new Set(thresholdSparklineScenarios.map(({ threshold }) => threshold))).toHaveProperty(
      'size',
      12,
    );
    expect(
      new Set(
        thresholdSparklineScenarios.map(
          ({ belowColor, aboveColor }) => `${belowColor}:${aboveColor}`,
        ),
      ),
    ).toHaveProperty('size', 12);
  });

  it('registers every scenario as a visible two-color sparkline snapshot', () => {
    const registeredTitles = new Set(snapshotExamples.map(({ title }) => title));

    thresholdSparklineScenarios.forEach((scenario, index) => {
      const example = thresholdSparklineExamples[index];
      const output = example.render();

      expect(example.group).toBe('sparkline');
      expect(example.title).toBe(scenario.title);
      expect(registeredTitles).toContain(scenario.title);
      expect(stripAnsi(output)).toHaveLength(scenario.values.length);
      expect(output).toContain(ANSI_COLORS[scenario.belowColor]);
      expect(output).toContain(ANSI_COLORS[scenario.aboveColor]);
    });
  });
});
