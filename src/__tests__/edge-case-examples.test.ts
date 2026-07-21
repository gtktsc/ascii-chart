import fs from 'fs';
import path from 'path';

import { getSnapshotRelativePath } from '@examples';
import { dateEdgeCaseExamples } from '@examples/date-edge-cases';
import { numericEdgeCaseExamples } from '@examples/edge-cases';

const rendererSuffix = / \[(ascii|braille)\]$/;
const snapshotDirectory = path.resolve(__dirname, '../../__snapshots__');
const edgeCaseExamples = [...numericEdgeCaseExamples, ...dateEdgeCaseExamples];

const scenarioTitles = [
  ...new Set(edgeCaseExamples.map(({ title }) => title.replace(rendererSuffix, ''))),
];

describe('edge-case snapshot examples', () => {
  it('covers at least 30 distinct weird dataset and date scenarios', () => {
    expect(scenarioTitles.length).toBeGreaterThanOrEqual(30);
  });

  it('covers every scenario with both renderers', () => {
    scenarioTitles.forEach((title) => {
      expect(
        edgeCaseExamples
          .filter((example) => example.title.replace(rendererSuffix, '') === title)
          .map(({ renderer }) => renderer),
      ).toEqual(['ascii', 'braille']);
    });
  });

  it('matches every committed edge-case snapshot', () => {
    edgeCaseExamples.forEach((example) => {
      expect(example.render()).toBe(
        fs.readFileSync(path.join(snapshotDirectory, getSnapshotRelativePath(example)), 'utf8'),
      );
    });
  });

  it('includes requested numeric and missing-value datasets', () => {
    expect(scenarioTitles).toEqual(
      expect.arrayContaining([
        'narrow width mixed signs',
        'wide width dense oscillation',
        'tiny and huge values together',
        'leading and trailing missing values',
        'alternating missing values across series',
      ]),
    );
  });

  it('includes requested unusual date ranges and gaps', () => {
    expect(scenarioTitles).toEqual(
      expect.arrayContaining([
        'date millisecond range',
        'date leap-day boundary',
        'date pre-epoch range',
        'date irregular intervals',
        'date missing values across series',
      ]),
    );
  });
});
