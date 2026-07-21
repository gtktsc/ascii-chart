import fs from 'fs';
import path from 'path';

import { assertUniqueSnapshotPaths, getSnapshotRelativePath, snapshotExamples } from '@examples';
import { SNAPSHOT_DIRECTORY_NAME } from '@constants/snapshots';

const snapshotDirectory = path.resolve(__dirname, '..', SNAPSHOT_DIRECTORY_NAME);

assertUniqueSnapshotPaths(snapshotExamples);

const snapshots = snapshotExamples.map((example) => ({
  relativePath: getSnapshotRelativePath(example),
  output: example.render(),
}));

fs.rmSync(snapshotDirectory, { recursive: true, force: true });
fs.mkdirSync(snapshotDirectory, { recursive: true });

snapshots.forEach(({ relativePath, output }) => {
  const filePath = path.join(snapshotDirectory, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, output);
});
