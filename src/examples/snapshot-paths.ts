import { SNAPSHOT_GROUP_FOLDERS } from '@constants/snapshots';

import type { SnapshotExample } from './types';

const sanitizeSnapshotTitle = (title: string): string =>
  title
    .replace(/ \[(?:ascii|braille)\]$/, '')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

/**
 * Returns grouped relative path for one generated snapshot.
 * @param {SnapshotExample} example - Snapshot metadata and renderer selection.
 * @returns {string} - Collision-safe relative snapshot path.
 */
export const getSnapshotRelativePath = (example: SnapshotExample): string => {
  const folders: string[] = [SNAPSHOT_GROUP_FOLDERS[example.group]];
  if (example.renderer) folders.push(example.renderer);
  return [...folders, `${sanitizeSnapshotTitle(example.title)}.txt`].join('/');
};

/**
 * Rejects examples that resolve to the same generated snapshot path.
 * @param {readonly SnapshotExample[]} examples - Complete snapshot example catalog.
 */
export const assertUniqueSnapshotPaths = (examples: readonly SnapshotExample[]): void => {
  const paths = new Map<string, string>();
  examples.forEach((example) => {
    const relativePath = getSnapshotRelativePath(example);
    const previousTitle = paths.get(relativePath);
    if (previousTitle !== undefined) {
      throw new Error(
        `Snapshot path collision: "${previousTitle}" and "${example.title}" both map to "${relativePath}"`,
      );
    }
    paths.set(relativePath, example.title);
  });
};
