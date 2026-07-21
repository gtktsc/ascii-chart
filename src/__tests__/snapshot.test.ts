import fs from 'fs';
import path from 'path';

import { plot, renderChart } from '@ascii-chart';
import { examples, getSnapshotRelativePath, snapshotExamples } from '@examples';
import { SNAPSHOT_DIRECTORY_NAME } from '@constants/snapshots';
import { stripAnsi } from '@helpers/terminal-text';

const snapshotDirectory = path.resolve(__dirname, '../..', SNAPSHOT_DIRECTORY_NAME);

describe('example snapshots', () => {
  it('contains only examples that render visible output', () => {
    expect(
      snapshotExamples
        .filter((example) => example.render().trim() === '')
        .map(({ group, title }) => `${group}: ${title}`),
    ).toEqual([]);
  });

  it('keeps wrapped labels readable in the string annotations and overlays example', () => {
    const example = snapshotExamples.find(
      ({ title }) => title === 'string annotations and overlays [ascii]',
    );
    const output = stripAnsi(example!.render());

    expect(output).toMatch(/release\s+general/);
    expect(output).toMatch(/candidate\s+availability/);
  });

  snapshotExamples.forEach((example) => {
    const name = `${example.group}: ${example.title}`;
    const filePath = path.join(snapshotDirectory, getSnapshotRelativePath(example));

    it(`matches snapshot: ${name}`, () => {
      const actual = example.render();
      const expected = fs.readFileSync(filePath, 'utf8');

      expect(actual).toBe(expected);
    });
  });

  examples.forEach(([data, settings, spec]) => {
    it(`keeps plot and renderChart equivalent: ${settings.title}`, () => {
      const originalPlotData = JSON.stringify(data);
      const originalSpecData = spec.series.map((series) => series.data.map((datum) => [...datum]));
      const plotted = plot(data, settings);
      const structured = renderChart(spec);

      expect(structured).not.toBe('');
      expect(structured).toBe(plotted);
      expect(JSON.stringify(data)).toBe(originalPlotData);
      expect(spec.series.map((series) => series.data.map((datum) => [...datum]))).toEqual(
        originalSpecData,
      );
    });
  });
});
