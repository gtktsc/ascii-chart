import { jest } from '@jest/globals';

const serviceTests = [
  './services/coords.test.ts',
  './services/defaults.test.ts',
  './services/draw.test.ts',
  './services/overrides.test.ts',
  './services/plot.test.ts',
  './services/settings.test.ts',
] as const;

const isSnapshotRun = process.argv.some((argument) => /snapshot/i.test(argument));
let loadedServiceTests = false;

if (isSnapshotRun) {
  serviceTests.forEach((path) => jest.requireActual(path));
  loadedServiceTests = true;
}

describe('snapshot service coverage bridge', () => {
  it('loads service tests exactly for snapshot-targeted runs', () => {
    expect(loadedServiceTests).toBe(isSnapshotRun);
  });
});
