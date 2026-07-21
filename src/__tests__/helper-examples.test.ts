import { helperExamples } from '@examples';
import { stripAnsi } from '@helpers/terminal-text';

describe('helper API examples', () => {
  it('provides uniquely named variants across all helpers', () => {
    expect(helperExamples).toHaveLength(56);
    expect(new Set(helperExamples.map(({ title }) => title))).toHaveProperty('size', 56);
    expect(helperExamples.filter(({ helper }) => helper === 'heatmap')).toHaveLength(30);
    expect(helperExamples.filter(({ helper }) => helper === 'histogram')).toHaveLength(2);
    expect(helperExamples.filter(({ helper }) => helper === 'sparkline')).toHaveLength(24);
  });

  it('keeps executable outputs beside each documented call', () => {
    expect(helperExamples.every(({ output }) => output.trim().length > 0)).toBe(true);
    expect(
      helperExamples
        .filter(({ helper }) => helper === 'histogram')
        .map(({ output }) => JSON.parse(output)),
    ).toEqual([
      expect.arrayContaining([expect.any(Array)]),
      expect.arrayContaining([expect.any(Array)]),
    ]);
    expect(
      helperExamples
        .filter(({ helper }) => helper === 'heatmap')
        .slice(0, 3)
        .map(({ output }) => stripAnsi(output as string)),
    ).toEqual([
      expect.stringContaining('Node 22'),
      expect.stringContaining('Week 2'),
      expect.stringContaining('Queue'),
    ]);
    expect(
      helperExamples
        .filter(({ helper }) => helper === 'sparkline')
        .slice(0, 6)
        .map(({ output }) => output),
    ).toEqual(['▁▂▃▄▅▆▇█', '█▇▆▅▄▃▂▁', '▁▃▅▇█', '▁ █ ▅', '▄▄▄', '▁█▁▇▂▅▃']);
  });

  it('uses distinct calls so variants show different values', () => {
    expect(new Set(helperExamples.map(({ code }) => code))).toHaveProperty('size', 56);
  });

  it('includes large operational examples for both helpers', () => {
    const examplesByTitle = new Map(helperExamples.map((example) => [example.title, example]));

    [
      'three-day request volume sparkline',
      'release telemetry with gaps sparkline',
      '24-hour service health heatmap',
      'global deployment wave heatmap',
    ].forEach((title) => expect(examplesByTitle.get(title)?.size).toBe('large'));

    expect(examplesByTitle.get('three-day request volume sparkline')!.output).toHaveLength(72);
    expect(examplesByTitle.get('release telemetry with gaps sparkline')!.output).toHaveLength(72);

    const serviceHealth = stripAnsi(
      examplesByTitle.get('24-hour service health heatmap')!.output,
    ).split('\n');
    const deploymentWave = stripAnsi(
      examplesByTitle.get('global deployment wave heatmap')!.output,
    ).split('\n');

    expect(serviceHealth.length).toBeGreaterThanOrEqual(13);
    expect(Math.max(...serviceHealth.map((line) => line.length))).toBeGreaterThan(100);
    expect(deploymentWave.length).toBeGreaterThanOrEqual(15);
    expect(Math.max(...deploymentWave.map((line) => line.length))).toBeGreaterThan(80);
  });

  it('adds ten distinct large sparkline scenarios', () => {
    const examplesByTitle = new Map(helperExamples.map((example) => [example.title, example]));
    const sparklineTitles = [
      '48-hour CPU load sparkline',
      'memory pressure and restart sparkline',
      'queue depth sawtooth sparkline',
      'dual-peak traffic sparkline',
      'incident error burst sparkline',
      'post-deploy latency sparkline',
      'weekly seasonality sparkline',
      'batch telemetry gaps sparkline',
      'cold-start fan-out sparkline',
      'signed cash-flow sparkline',
    ];
    const sparklines = sparklineTitles.map((title) => examplesByTitle.get(title)!);

    expect(sparklines.every(({ helper, size }) => helper === 'sparkline' && size === 'large')).toBe(
      true,
    );
    expect(sparklines.every(({ output }) => output.length >= 48)).toBe(true);
    expect(sparklines.every(({ output }) => output.includes('\u001b['))).toBe(true);
    expect(
      new Set(sparklines.map(({ output }) => output.match(/\u001b\[([0-9;]+)m/)?.[1])),
    ).toHaveProperty('size', 10);
    expect(new Set(sparklines.map(({ output }) => output))).toHaveProperty('size', 10);
  });

  it('adds ten distinctly styled large heatmap scenarios', () => {
    const examplesByTitle = new Map(helperExamples.map((example) => [example.title, example]));
    const heatmapTitles = [
      'Kubernetes capacity heatmap',
      'multi-platform CI heatmap',
      'weekly traffic density heatmap',
      'error budget burn heatmap',
      'replication lag heatmap',
      'feature cohort heatmap',
      'patch compliance heatmap',
      'model evaluation heatmap',
      'storage utilization heatmap',
      'on-call coverage heatmap',
    ];
    const heatmaps = heatmapTitles.map((title) => examplesByTitle.get(title)!);

    expect(heatmaps.every(({ helper, size }) => helper === 'heatmap' && size === 'large')).toBe(
      true,
    );
    expect(heatmaps.every(({ output }) => output.includes('\u001b['))).toBe(true);
    expect(new Set(heatmaps.map(({ output }) => output))).toHaveProperty('size', 10);
  });
});
