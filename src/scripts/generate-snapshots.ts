import fs from 'fs';
import path from 'path';
import { plot } from '../services/plot';
import { examples } from '../examples';

const SNAPSHOT_DIR = path.resolve(__dirname, '../__snapshots__');

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR);
}

examples.forEach(([data, settings], index) => {
  const output = plot(data, settings);
  const fileName =
    `${index.toString().padStart(2, '0')}_${settings.title || 'example'}`.replace(
      /[^\w.-]+/g,
      '_',
    ) + '.txt';

  const filePath = path.join(SNAPSHOT_DIR, fileName);
  fs.writeFileSync(filePath, output);
});
