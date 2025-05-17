import fs from 'fs';
import path from 'path';
import { plot } from '../index';
import { examples } from '../examples';

const SNAPSHOT_DIR = path.resolve(__dirname, '../../__snapshots__');

describe('graph snapshots', () => {
  examples.forEach(([data, settings], index) => {
    const name = settings.title || `example_${index}`;
    const fileName =
      `${index.toString().padStart(2, '0')}_${name}`.replace(/[^\w.-]+/g, '_') + '.txt';
    const filePath = path.join(SNAPSHOT_DIR, fileName);

    it(`matches snapshot: ${name}`, () => {
      const actual = plot(data, settings);
      const expected = fs.readFileSync(filePath, 'utf8');
      expect(actual).toBe(expected);
    });
  });
});
