import {
  assertUniqueSnapshotPaths,
  examples,
  getSnapshotRelativePath,
  helperExamples,
  RENDERERS,
  snapshotExamples,
} from '@examples';
import {
  coveredCandlestickOptions,
  coveredChartSpecOptions,
  coveredHeatmapLevelOptions,
  coveredHeatmapOptions,
  coveredHeatmapThresholdOptions,
  coveredLegendOptions,
  coveredSeriesOptions,
  coveredSettingsOptions,
  coveredSymbolOptions,
  coveredXAxisOptions,
  coveredYAxisOptions,
  exampleCoverageBySurface,
  helperExampleCoverageBySurface,
} from '@examples/coverage';
import { PUBLIC_VARIANTS, variantExampleCoverage } from '@examples/variants';

describe('example coverage', () => {
  it('keeps every option surface explicitly represented', () => {
    const surfaces = [
      coveredSettingsOptions,
      coveredChartSpecOptions,
      coveredSeriesOptions,
      coveredXAxisOptions,
      coveredYAxisOptions,
      coveredLegendOptions,
      coveredSymbolOptions,
      coveredCandlestickOptions,
      coveredHeatmapOptions,
      coveredHeatmapLevelOptions,
      coveredHeatmapThresholdOptions,
    ];

    surfaces.forEach((surface) => expect(Object.values(surface).every(Boolean)).toBe(true));
  });

  it('covers every renderer for every legacy plot scenario', () => {
    const rendererCounts = Object.fromEntries(RENDERERS.map((renderer) => [renderer, 0]));
    examples.forEach(([, settings]) => rendererCounts[settings.renderer!]++);

    expect(rendererCounts.ascii).toBe(rendererCounts.braille);
    expect(rendererCounts.ascii).toBeGreaterThan(100);
  });

  it('covers every exported renderer that produces visual output', () => {
    expect(new Set(snapshotExamples.map(({ group }) => group))).toEqual(
      new Set(['candlestick', 'heatmap', 'plot', 'renderChart', 'sparkline']),
    );
  });

  it('generates one stable grouped path per uniquely titled example', () => {
    const paths = snapshotExamples.map(getSnapshotRelativePath);

    expect(() => assertUniqueSnapshotPaths(snapshotExamples)).not.toThrow();
    expect(new Set(snapshotExamples.map(({ title }) => title))).toHaveProperty(
      'size',
      snapshotExamples.length,
    );
    expect(new Set(paths)).toHaveProperty('size', paths.length);
    expect(paths).toEqual(
      expect.arrayContaining([
        'plot/ascii/single-point-with-inferred-domains.txt',
        'render-chart/braille/string-annotations-and-overlays.txt',
        'heatmap/deployment-readiness-heatmap.txt',
        'sparkline/alternating-extremes-sparkline.txt',
        'candlestick/single-unchanged-zero-span-candle.txt',
      ]),
    );
    paths.forEach((relativePath) => expect(relativePath).not.toMatch(/(^|\/)\d{3}[-_]/));
  });

  it('rejects snapshot titles that normalize to the same path', () => {
    expect(() =>
      assertUniqueSnapshotPaths([
        { group: 'plot', title: 'CPU load [ascii]', render: () => 'ascii' },
        { group: 'plot', title: 'CPU load [braille]', render: () => 'braille' },
      ]),
    ).toThrow(
      'Snapshot path collision: "CPU load [ascii]" and "CPU load [braille]" both map to "plot/cpu-load.txt"',
    );
  });

  it('covers extended edge-case and data-shape scenarios', () => {
    const titles = new Set(snapshotExamples.map(({ title }) => title));

    expect(snapshotExamples.length).toBeGreaterThanOrEqual(425);
    [
      'single point with inferred domains [ascii]',
      'single point with inferred domains [braille]',
      'sparse multi-series gaps [ascii]',
      'mixed line point and bar series [braille]',
      'irregular time intervals [ascii]',
      'single unchanged zero-span candle',
      'minimal unlabeled heatmap',
      'deployment readiness heatmap',
      'alternating extremes sparkline',
    ].forEach((title) => expect(titles).toContain(title));
  });

  it('maps every public option to an executable example', () => {
    const titles = snapshotExamples.map(({ title }) => title);
    const hasExample = (baseTitle: string) =>
      titles.some((title) => title === baseTitle || title.startsWith(`${baseTitle} [`));

    Object.values(exampleCoverageBySurface).forEach((surface) =>
      Object.values(surface).forEach((baseTitle) => expect(hasExample(baseTitle)).toBe(true)),
    );
  });

  it('maps every nonvisual helper option to an executable helper example', () => {
    const titles = new Set(helperExamples.map(({ title }) => title));

    Object.values(helperExampleCoverageBySurface).forEach((surface) =>
      Object.values(surface).forEach((title) => expect(titles).toContain(title)),
    );
  });

  it('maps every closed public variant to an executable example', () => {
    const titles = snapshotExamples.map(({ title }) => title);

    expect(Object.keys(variantExampleCoverage).sort()).toEqual(Object.keys(PUBLIC_VARIANTS).sort());
    Object.entries(PUBLIC_VARIANTS).forEach(([surface, variants]) => {
      const coverage = variantExampleCoverage[surface as keyof typeof variantExampleCoverage];
      expect(Object.keys(coverage).sort()).toEqual([...variants].sort());
      Object.values(coverage).forEach((baseTitle) =>
        expect(
          titles.some((title) => title === baseTitle || title.startsWith(`${baseTitle} [`)),
        ).toBe(true),
      );
    });
  });

  it('pairs every renderer-backed example across all renderer backends', () => {
    const rendererExamples = snapshotExamples.filter(({ renderer }) => renderer !== undefined);
    const byBaseTitle = new Map<string, Set<string>>();

    rendererExamples.forEach(({ renderer, title }) => {
      const baseTitle = title.replace(/ \[(ascii|braille)\]$/, '');
      const renderers = byBaseTitle.get(baseTitle) ?? new Set<string>();
      renderers.add(renderer!);
      byBaseTitle.set(baseTitle, renderers);
    });

    expect(byBaseTitle.size).toBeGreaterThan(150);
    byBaseTitle.forEach((renderers) =>
      expect([...renderers].sort()).toEqual([...RENDERERS].sort()),
    );
  });

  it('includes rich string, Date, and heatmap matrices', () => {
    const titles = new Set(snapshotExamples.map(({ title }) => title));
    [
      'string annotations and overlays [ascii]',
      'string annotations and overlays [braille]',
      'Date annotations and secondary axis [ascii]',
      'Date annotations and secondary axis [braille]',
      'ANSI color palette heatmap',
      'numeric decimal heatmap',
      'null checkerboard heatmap',
      'deployment readiness heatmap',
      'alternating extremes sparkline',
    ].forEach((title) => expect(titles).toContain(title));
  });

  it('shows filled areas on every side of the chart axes', () => {
    const titles = new Set(snapshotExamples.map(({ title }) => title));

    ['above x axis', 'below x axis', 'left of y axis', 'right of y axis'].forEach((position) =>
      RENDERERS.forEach((renderer) =>
        expect(titles).toContain(`fill area ${position} [${renderer}]`),
      ),
    );
  });

  it('includes ten line-chart threshold coloring scenarios for every renderer', () => {
    const titles = new Set(snapshotExamples.map(({ title }) => title));
    const scenarios = [
      'CPU warning threshold',
      'temperature heat threshold',
      'latency SLA threshold',
      'memory pressure threshold',
      'error rate threshold',
      'battery charge threshold',
      'queue depth threshold',
      'revenue target threshold',
      'heart rate threshold',
      'disk usage threshold',
    ];

    scenarios.forEach((scenario) =>
      RENDERERS.forEach((renderer) => expect(titles).toContain(`${scenario} [${renderer}]`)),
    );
  });

  it('includes twenty chart-element coloring scenarios for every renderer', () => {
    const scenarios = {
      plot: [
        'plot color: blue title',
        'plot color: red x axis',
        'plot color: green y axis',
        'plot color: paired axes',
        'plot color: cyan legend labels',
        'plot color: magenta border',
        'plot color: dim background',
        'plot color: yellow bar values',
        'plot color: cyan horizontal bar values',
        'plot color: complete chrome palette',
      ],
      renderChart: [
        'structured color: yellow title',
        'structured color: blue x axis',
        'structured color: green y axis',
        'structured color: magenta secondary axis',
        'structured color: white legend labels',
        'structured color: red border',
        'structured color: blue background',
        'structured color: cyan grouped bar values',
        'structured color: magenta normalized bar values',
        'structured color: complete dashboard palette',
      ],
    } as const;

    expect(Object.values(scenarios).flat()).toHaveLength(20);
    Object.entries(scenarios).forEach(([group, titles]) =>
      titles.forEach((title) =>
        RENDERERS.forEach((renderer) =>
          expect(snapshotExamples).toContainEqual(
            expect.objectContaining({ group, title: `${title} [${renderer}]`, renderer }),
          ),
        ),
      ),
    );
  });

  it('includes at least thirty candlestick examples across requested option families', () => {
    const candlesticks = snapshotExamples.filter(({ group }) => group === 'candlestick');
    const titles = candlesticks.map(({ title }) => title);

    expect(candlesticks.length).toBeGreaterThanOrEqual(30);
    expect(titles.filter((title) => title.startsWith('color palette:'))).toHaveLength(6);
    expect(titles.filter((title) => title.startsWith('threshold:'))).toHaveLength(6);
    expect(titles.filter((title) => title.startsWith('option:'))).toHaveLength(11);
  });
});
