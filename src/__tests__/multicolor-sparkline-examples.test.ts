import { snapshotExamples } from '@examples';

describe('multicolor sparkline snapshot examples', () => {
  it('includes ten snapshots with distinct colors', () => {
    const titles = [
      'multicolor service health',
      'multicolor latency SLA',
      'multicolor profit and loss',
      'multicolor temperature zones',
      'multicolor battery charge',
      'multicolor anomaly detection',
      'multicolor deployment stages',
      'multicolor queue pressure',
      'multicolor market momentum',
      'multicolor rainbow palette',
    ];
    const examplesByTitle = new Map(snapshotExamples.map((example) => [example.title, example]));

    titles.forEach((title) => {
      const example = examplesByTitle.get(title);
      const output = example?.render() ?? '';
      const colors = new Set(
        [...output.matchAll(/\u001b\[(3[0-7]|9[0-7])m/g)].map(([, color]) => color),
      );

      expect(example?.group).toBe('sparkline');
      expect(colors.size).toBeGreaterThanOrEqual(2);
    });
  });
});
