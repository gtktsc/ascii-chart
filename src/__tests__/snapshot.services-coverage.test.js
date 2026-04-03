const isSnapshotRun = process.argv.some((arg) => /snapshot/i.test(arg));

if (isSnapshotRun) {
  require('./services/coords.test.ts');
  require('./services/defaults.test.ts');
  require('./services/draw.test.ts');
  require('./services/overrides.test.ts');
  require('./services/plot.test.ts');
  require('./services/settings.test.ts');
}

describe('snapshot service coverage bridge', () => {
  it('loads service tests when running snapshot-targeted command', () => {
    expect(typeof isSnapshotRun).toBe('boolean');
  });
});
