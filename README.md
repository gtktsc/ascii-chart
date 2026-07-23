# Simple ASCII Chart

[![npm version](https://img.shields.io/npm/v/simple-ascii-chart)](https://www.npmjs.com/package/simple-ascii-chart)
[![license](https://img.shields.io/npm/l/simple-ascii-chart)](./LICENSE)
[![bundle size](https://img.shields.io/bundlejs/size/simple-ascii-chart)](https://bundlejs.com/?q=simple-ascii-chart)
[![coverage](https://img.shields.io/codecov/c/github/gtktsc/simple-ascii-chart)](https://codecov.io/gh/gtktsc/simple-ascii-chart)

`simple-ascii-chart` is a dependency-free TypeScript library for terminal charts. It renders line, point, bar, candlestick, heatmap, and compact sparkline output for command-line tools, logs, tests, API responses, and text dashboards.

- [Documentation and playground](https://simple-ascii-chart.vercel.app/)
- [npm package](https://www.npmjs.com/package/simple-ascii-chart)
- [CLI package](https://www.npmjs.com/package/simple-ascii-chart-cli)

## Requirements

- Node.js 22 or later
- A terminal or other text output target
- ESM and CommonJS are supported

## Installation

```bash
npm install simple-ascii-chart
```

```bash
yarn add simple-ascii-chart
```

## Quick start

```typescript
import { plot } from 'simple-ascii-chart';

const output = plot(
  [
    [0, 2],
    [1, 5],
    [2, 3],
    [3, 8],
  ],
  {
    width: 30,
    height: 10,
    title: 'Requests',
    color: 'ansiCyan',
  },
);

console.log(output);
```

The default export is also `plot`:

```typescript
import plot from 'simple-ascii-chart';
```

CommonJS consumers can use the named or default export:

```javascript
const { plot } = require('simple-ascii-chart');
// or: const plot = require('simple-ascii-chart').default;
```

## Choose an API

| API                           | Use it for                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `plot(data, settings?)`       | Numeric line, point, vertical-bar, and horizontal-bar charts with a compact settings object.                                      |
| `renderChart(spec)`           | Structured multi-series charts with named series, categorical or date X values, annotations, mixed modes, and a secondary Y-axis. |
| `candlestick(spec)`           | Financial OHLC candlestick charts.                                                                                                |
| `heatmap(spec)`               | Categorical status matrices and threshold-colored numeric grids.                                                                  |
| `sparkline(values, options?)` | One-row trends with one glyph per value.                                                                                          |
| `histogram(values, options?)` | Histogram binning. This helper returns data for `plot`; it does not render text.                                                  |

This README includes the complete `6.0.0` option reference. The
[documentation site](https://simple-ascii-chart.vercel.app/documentation) adds versioned,
executable output examples and a playground.

## Reference index

- [`plot` settings](#plot-settings)
- [`renderChart` specification](#renderchart-specification)
- [Axes](#axis-options)
- [Legends, overlays, and annotations](#legends-overlays-and-annotations)
- [Colors and callbacks](#colors-and-callbacks)
- [Bar layouts and value labels](#bar-layouts-and-value-labels)
- [Symbols](#symbol-options)
- [`candlestick` options](#candlestick-options)
- [`heatmap` options](#heatmap-options)
- [`sparkline` options](#sparkline-options)
- [`histogram` options](#histogram-options)
- [Closed variants](#closed-variant-reference)
- [Public runtime constants](#public-runtime-constants)

## `plot`

Use `plot` for numeric X/Y data. A `null` Y value creates a gap.

```typescript
import { plot } from 'simple-ascii-chart';

console.log(
  plot(
    [
      [0, 10],
      [1, 18],
      [2, null],
      [3, 24],
    ],
    {
      width: 36,
      height: 10,
      xLabel: 'minute',
      yLabel: 'requests',
      interpolation: 'linear',
      overflow: 'clip',
    },
  ),
);
```

`plot` supports these graph modes:

- `line` (default)
- `point`
- `bar`
- `horizontalBar`

Multi-series bars support `overlap`, `grouped`, `stacked`, and `normalized` layouts.

## `renderChart`

Use `renderChart` when series metadata and chart structure belong in one specification. X values may be numbers, strings, or `Date` objects.

```typescript
import { renderChart } from 'simple-ascii-chart';

console.log(
  renderChart({
    width: 44,
    height: 12,
    title: 'Service health',
    series: [
      {
        id: 'latency',
        name: 'Latency',
        data: [
          ['Mon', 42],
          ['Tue', 68],
          ['Wed', 51],
        ],
        color: 'ansiCyan',
      },
      {
        id: 'errors',
        name: 'Errors',
        data: [
          ['Mon', 2],
          ['Tue', 7],
          ['Wed', 3],
        ],
        color: 'ansiRed',
        yAxis: 'secondary',
      },
    ],
    xAxis: { scale: 'band', label: 'day' },
    yAxis: { label: 'latency (ms)' },
    secondaryYAxis: { label: 'errors' },
    legend: { position: 'bottom', series: true },
  }),
);
```

Scale inference uses `linear` for numbers, `band` for strings, and `time` for `Date` values. Set `xAxis.scale` explicitly when runtime validation should enforce one scale.

## `candlestick`

Each candlestick tuple is `[x, open, high, low, close]`.

```typescript
import { candlestick } from 'simple-ascii-chart';

console.log(
  candlestick({
    title: 'ACME',
    width: 32,
    height: 12,
    data: [
      [0, 100, 112, 96, 108],
      [1, 108, 114, 102, 105],
      [2, 105, 116, 104, 113],
    ],
    style: {
      rising: { color: 'ansiGreen' },
      falling: { color: 'ansiRed' },
      unchanged: { color: 'ansiYellow' },
    },
    xAxis: { label: 'period' },
    yAxis: { label: 'price' },
  }),
);
```

OHLC values must be finite and satisfy `low <= open/close <= high`. X values must be unique.

## `heatmap`

Use exact levels for categorical matrices:

```typescript
import { heatmap } from 'simple-ascii-chart';

console.log(
  heatmap({
    title: 'CI matrix',
    columns: ['Linux', 'macOS', 'Windows'],
    rows: ['Node 22', 'Node 24'],
    data: [
      ['pass', 'pass', 'fail'],
      ['pass', 'pending', 'pass'],
    ],
    levels: [
      { value: 'pass', symbol: '●', color: 'ansiGreen', label: 'Passed' },
      { value: 'pending', symbol: '○', color: 'ansiYellow', label: 'Pending' },
      { value: 'fail', symbol: '×', color: 'ansiRed', label: 'Failed' },
    ],
    legend: true,
  }),
);
```

For numeric grids, provide `threshold` instead of `levels`. Values equal to the threshold use the `above` style. `null` reserves an empty cell.

## `sparkline`

```typescript
import { sparkline } from 'simple-ascii-chart';

sparkline([1, 3, null, 2]); // "▁█ ▅"

sparkline([1, 2, 3, 4], {
  threshold: {
    value: 3,
    belowColor: 'ansiBlue',
    aboveColor: 'ansiRed',
  },
});
```

Finite values scale across `▁▂▃▄▅▆▇█`. Constant series use `▄`. `null` preserves its position as a space. Global/per-value `color` and `threshold` coloring are mutually exclusive.

## `histogram`

`histogram` returns sorted `[x, count]` tuples suitable for `plot`.

```typescript
import { histogram, plot } from 'simple-ascii-chart';

const buckets = histogram([1, 1, 2, 2, 2, 4], { binCount: 3 });
console.log(plot(buckets, { mode: 'bar' }));
```

Without `binCount`, raw samples use Sturges' formula. Pre-counted tuples are also accepted; duplicate X values are merged.

## Complete option reference

All options are optional unless marked **required**. Examples are valid TypeScript values that
can be copied into the surrounding settings or specification object. Terminal dimensions refer to
display columns and rows, not JavaScript string length.

### `plot` settings

`plot(coordinates, settings?)` accepts one numeric series or an array of numeric series. Every
datum is `[x, y]`; use `null` for `y` to create a gap.

| Option             | Type                                                          | Default                | Description                                                                            | Example                                                           |
| ------------------ | ------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `color`            | `Color \| Color[] \| ColorGetter`                             | Terminal default       | One series color, colors indexed by series, or a series-color callback.                | `'ansiCyan'`                                                      |
| `width`            | `number \| 'auto'`                                            | Input-derived          | Positive integer plot width, or active terminal width with an 80-column fallback.      | `'auto'`                                                          |
| `height`           | `number`                                                      | Input-derived          | Positive integer plot height. When omitted with `aspectRatio`, height is derived.      | `12`                                                              |
| `aspectRatio`      | `number`                                                      | —                      | Positive physical width-to-height ratio used to derive height.                         | `3`                                                               |
| `yRange`           | `[number, number]`                                            | Data extent            | Explicit finite Y-axis domain with minimum less than maximum.                          | `[0, 100]`                                                        |
| `overflow`         | `'clip' \| 'discard'`                                         | `'discard'`            | Clips line geometry at explicit domains or discards out-of-domain geometry.            | `'clip'`                                                          |
| `renderer`         | `'ascii' \| 'braille'`                                        | `'ascii'`              | Selects the renderer backend for plot cells.                                           | `'braille'`                                                       |
| `showTickLabel`    | `boolean`                                                     | `false`                | Reserves enough width for complete Y-axis tick labels.                                 | `true`                                                            |
| `hideXAxis`        | `boolean`                                                     | `false`                | Hides the X-axis line, ticks, labels, and axis label.                                  | `true`                                                            |
| `hideXAxisTicks`   | `boolean`                                                     | `false`                | Hides X-axis ticks and labels while keeping the axis line.                             | `true`                                                            |
| `hideYAxis`        | `boolean`                                                     | `false`                | Hides the Y-axis line, ticks, labels, and axis label.                                  | `true`                                                            |
| `hideYAxisTicks`   | `boolean`                                                     | `false`                | Hides Y-axis ticks and labels while keeping the axis line.                             | `true`                                                            |
| `customXAxisTicks` | `number[]`                                                    | Generated ticks        | Explicit finite X-axis tick values.                                                    | `[0, 5, 10]`                                                      |
| `customYAxisTicks` | `number[]`                                                    | Generated ticks        | Explicit finite Y-axis tick values.                                                    | `[0, 50, 100]`                                                    |
| `title`            | `string`                                                      | —                      | Text rendered above the chart.                                                         | `'Requests'`                                                      |
| `titleColor`       | `Color`                                                       | Terminal default       | ANSI color for the title.                                                              | `'ansiBrightWhite'`                                               |
| `xLabel`           | `string`                                                      | —                      | X-axis label.                                                                          | `'minute'`                                                        |
| `yLabel`           | `string`                                                      | —                      | Y-axis label.                                                                          | `'requests'`                                                      |
| `thresholds`       | `Threshold[]`                                                 | `[]`                   | Horizontal and/or vertical reference lines.                                            | `[{ y: 80, color: 'ansiYellow' }]`                                |
| `points`           | `GraphPoint[]`                                                | `[]`                   | Point glyphs overlaid in numeric data coordinates.                                     | `[{ x: 2, y: 72, color: 'ansiRed' }]`                             |
| `fillArea`         | `boolean`                                                     | `false`                | Fills between line series and the X-axis baseline.                                     | `true`                                                            |
| `legend`           | `Legend`                                                      | —                      | Adds series, point, and threshold labels around the plot.                              | `{ position: 'bottom', series: ['API'] }`                         |
| `axisCenter`       | `[number?, number?]`                                          | Inferred               | Sets the X/Y-axis intersection; an omitted tuple entry keeps that coordinate inferred. | `[0, 0]`                                                          |
| `formatter`        | `Formatter`                                                   | Built-in formatter     | Formats numeric axis values. Structured axis formatters take precedence.               | `(value) => value.toFixed(1)`                                     |
| `lineFormatter`    | `(args: LineFormatterArgs) => CustomSymbol \| CustomSymbol[]` | Built-in glyphs        | Replaces occupied series cells with custom glyphs in plot coordinates.                 | `({ plotX, plotY }) => ({ x: plotX, y: plotY, symbol: '*' })`     |
| `symbols`          | `Symbols`                                                     | `DEFAULT_SYMBOLS.plot` | Merges per-call glyph overrides into package defaults.                                 | `{ point: '◆', ellipsis: '~' }`                                   |
| `borderColor`      | `Color`                                                       | Terminal default       | ANSI color for the configured border glyph.                                            | `'ansiBrightBlack'`                                               |
| `backgroundColor`  | `Color`                                                       | Terminal default       | ANSI color for background glyphs.                                                      | `'ansiBlack'`                                                     |
| `mode`             | `'line' \| 'point' \| 'bar' \| 'horizontalBar'`               | `'line'`               | Selects the graph primitive.                                                           | `'bar'`                                                           |
| `interpolation`    | `'step' \| 'linear'`                                          | `'step'`               | Selects line-segment interpolation.                                                    | `'linear'`                                                        |
| `coloring`         | `Coloring \| readonly (Coloring \| undefined)[]`              | —                      | Applies one dynamic coloring strategy or one strategy per series.                      | `{ type: 'gradient', by: 'y', colors: ['ansiGreen', 'ansiRed'] }` |
| `barLayout`        | `'overlap' \| 'grouped' \| 'stacked' \| 'normalized'`         | `'overlap'`            | Arranges multiple bar series.                                                          | `'stacked'`                                                       |
| `valueLabels`      | `ChartValueLabels`                                            | `false`                | Enables or configures labels at rendered bar endpoints.                                | `{ formatter: (value) => String(value), color: 'ansiWhite' }`     |
| `debugMode`        | `boolean`                                                     | `false`                | Logs out-of-bounds drawing attempts.                                                   | `true`                                                            |
| `xAxis`            | `XAxis<number>`                                               | —                      | Structured X-axis fields; supplied fields override matching flat options.              | `{ domain: [0, 10], ticks: 3 }`                                   |
| `yAxis`            | `YAxis`                                                       | —                      | Structured Y-axis fields; supplied fields override matching flat options.              | `{ domain: [0, 100], label: 'usage %' }`                          |

Complete `plot` configuration example:

```typescript
import { plot } from 'simple-ascii-chart';

console.log(
  plot(
    [
      [0, 20],
      [1, 45],
      [2, 70],
      [3, 55],
    ],
    {
      width: 38,
      height: 10,
      title: 'CPU',
      titleColor: 'ansiBrightWhite',
      xLabel: 'minute',
      yLabel: 'usage %',
      xAxis: { domain: [0, 3], ticks: [0, 1, 2, 3] },
      yAxis: { domain: [0, 100], ticks: 5, showTickLabel: true },
      interpolation: 'linear',
      overflow: 'clip',
      coloring: {
        type: 'conditional',
        getColor: ({ y }) => (y >= 70 ? 'ansiRed' : 'ansiGreen'),
      },
      thresholds: [{ y: 70, color: 'ansiYellow' }],
      points: [{ x: 2, y: 70, color: 'ansiBrightRed' }],
      legend: { position: 'bottom', series: 'CPU', thresholds: 'Warning' },
      symbols: { point: '◆', thresholds: { y: '!' } },
    },
  ),
);
```

### `renderChart` specification

`renderChart(spec)` uses native numeric, string, or `Date` X values. All entities that can appear
in a structured legend use stable IDs.

| Option            | Type                              | Default              | Description                                                                                                       | Example                                                         |
| ----------------- | --------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `series`          | `readonly ChartSeries<X>[]`       | **Required**         | Structured series collection. An empty array returns `''` unless both axis domains define an empty frame.         | `[{ id: 'cpu', data: [['Mon', 42]] }]`                          |
| `width`           | `number \| 'auto'`                | `60`                 | Positive integer plot width, or active terminal width with an 80-column fallback.                                 | `44`                                                            |
| `height`          | `number`                          | `15` for fixed width | Positive integer plot height. When omitted, `aspectRatio` derives it; `'auto'` width uses a default ratio of `2`. | `12`                                                            |
| `aspectRatio`     | `number`                          | —                    | Positive physical width-to-height ratio used to derive height.                                                    | `3`                                                             |
| `title`           | `string`                          | —                    | Text rendered above the chart.                                                                                    | `'Service health'`                                              |
| `titleColor`      | `Color`                           | Terminal default     | ANSI color for the title.                                                                                         | `'ansiBrightWhite'`                                             |
| `overflow`        | `'clip' \| 'discard'`             | `'discard'`          | Behavior for line geometry outside explicit domains.                                                              | `'clip'`                                                        |
| `renderer`        | `'ascii' \| 'braille'`            | `'ascii'`            | Selects the renderer backend for plot cells.                                                                      | `'braille'`                                                     |
| `xAxis`           | `XAxis<X>`                        | Inferred             | Configures native X scale, domain, ticks, labels, and color.                                                      | `{ scale: 'band', label: 'day' }`                               |
| `yAxis`           | `YAxis`                           | Inferred             | Configures the primary numeric Y-axis.                                                                            | `{ domain: [0, 100], ticks: 5 }`                                |
| `secondaryYAxis`  | `YAxis`                           | —                    | Adds an independently scaled right-side Y-axis.                                                                   | `{ domain: [0, 500], label: 'ms' }`                             |
| `legend`          | `ChartLegend`                     | —                    | Controls placement and ID-based entity selection.                                                                 | `{ position: 'bottom', series: true }`                          |
| `axisCenter`      | `[number?, number?]`              | Inferred             | Sets the axis intersection for linear X charts without a secondary Y-axis.                                        | `[0, 0]`                                                        |
| `points`          | `readonly ChartOverlayPoint<X>[]` | `[]`                 | Named point overlays on the primary Y-axis.                                                                       | `[{ id: 'peak', x: 'Tue', y: 90 }]`                             |
| `thresholds`      | `readonly ChartThreshold<X>[]`    | `[]`                 | Named horizontal and/or vertical reference lines.                                                                 | `[{ id: 'sla', y: 80, color: 'ansiRed' }]`                      |
| `annotations`     | `readonly ChartAnnotation<X>[]`   | `[]`                 | Spans, text, arrows, and error bars in data coordinates.                                                          | `[{ id: 'note', type: 'text', x: 'Tue', y: 90, text: 'Peak' }]` |
| `symbols`         | `Symbols`                         | Package defaults     | Merges per-call glyph overrides.                                                                                  | `{ point: '◆', border: '│' }`                                   |
| `borderColor`     | `Color`                           | Terminal default     | ANSI color for the configured border glyph.                                                                       | `'ansiBrightBlack'`                                             |
| `backgroundColor` | `Color`                           | Terminal default     | ANSI color for background glyphs.                                                                                 | `'ansiBlack'`                                                   |
| `debugMode`       | `boolean`                         | `false`              | Logs out-of-bounds drawing attempts.                                                                              | `true`                                                          |
| `barLayout`       | `BarLayout`                       | `'overlap'`          | Shared arrangement for multiple bar series.                                                                       | `'grouped'`                                                     |
| `valueLabels`     | `ChartValueLabels<X>`             | `false`              | Enables or configures labels at bar endpoints.                                                                    | `{ formatter: (value) => value.toFixed(0) }`                    |

#### `ChartSeries<X>`

| Option          | Type                                                          | Default          | Description                                                                        | Example                                                          |
| --------------- | ------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `id`            | `string`                                                      | **Required**     | Unique identifier used by legends and callback contexts.                           | `'latency'`                                                      |
| `name`          | `string`                                                      | `id`             | Human-readable series label.                                                       | `'Latency'`                                                      |
| `data`          | `readonly [X, number \| null][]`                              | **Required**     | Native-X/numeric-Y data; `null` creates a continuity gap.                          | `[['Mon', 42], ['Tue', null]]`                                   |
| `mode`          | `GraphMode`                                                   | `'line'`         | Series rendering primitive.                                                        | `'point'`                                                        |
| `interpolation` | `Interpolation`                                               | `'step'`         | Line-segment interpolation.                                                        | `'linear'`                                                       |
| `color`         | `Color`                                                       | Terminal default | Static ANSI series color.                                                          | `'ansiCyan'`                                                     |
| `coloring`      | `Coloring`                                                    | —                | Dynamic per-cell series-color strategy.                                            | `{ type: 'gradient', by: 'x', colors: ['ansiBlue', 'ansiRed'] }` |
| `fillArea`      | `boolean`                                                     | `false`          | Fills between a line and the X-axis baseline.                                      | `true`                                                           |
| `lineFormatter` | `(args: LineFormatterArgs) => CustomSymbol \| CustomSymbol[]` | Built-in glyphs  | Replaces occupied series cells with custom glyphs.                                 | `({ plotX, plotY }) => ({ x: plotX, y: plotY, symbol: '*' })`    |
| `yAxis`         | `'primary' \| 'secondary'`                                    | `'primary'`      | Assigns the series to a Y-axis. Secondary assignment is unsupported for bar modes. | `'secondary'`                                                    |

Structured chart example with mixed series and a secondary Y-axis:

```typescript
import { renderChart } from 'simple-ascii-chart';

console.log(
  renderChart({
    width: 44,
    height: 12,
    title: 'Operations',
    series: [
      {
        id: 'requests',
        name: 'Requests',
        data: [
          ['Mon', 20],
          ['Tue', 35],
          ['Wed', 60],
        ],
        mode: 'line',
        color: 'ansiGreen',
      },
      {
        id: 'latency',
        name: 'Latency',
        data: [
          ['Mon', 120],
          ['Tue', 180],
          ['Wed', 240],
        ],
        mode: 'point',
        color: 'ansiCyan',
        yAxis: 'secondary',
      },
    ],
    xAxis: { scale: 'band', label: 'day' },
    yAxis: { domain: [0, 100], label: 'requests' },
    secondaryYAxis: { domain: [0, 300], label: 'latency (ms)' },
    legend: { position: 'bottom', series: true },
  }),
);
```

`horizontalBar` requires a linear X scale. Bar series cannot use the secondary Y-axis.
`axisCenter` requires a linear X scale and cannot be combined with a secondary Y-axis.

### Axis options

`plot` accepts numeric axes. `renderChart` additionally accepts band and time X axes. For continuous
domains, the minimum must be less than the maximum. Numeric tick counts are integers of at least
two and include both endpoints; explicit tick arrays must be nonempty and ordered.

#### `XAxis<X>`

| Option           | Type                                                        | Default                            | Description                                                                             | Example                                             |
| ---------------- | ----------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `scale`          | `'linear' \| 'band' \| 'time'`                              | Inferred from X values             | Enforces the X-value kind and scale behavior.                                           | `'time'`                                            |
| `domain`         | `readonly X[] \| readonly [X, X]`                           | Data extent                        | Ordered unique categories for band scales, or a two-value extent for continuous scales. | `['Mon', 'Tue', 'Wed']`                             |
| `ticks`          | `number \| readonly X[]`                                    | Generated ticks                    | Exact tick count or exact native tick values.                                           | `5`                                                 |
| `label`          | `string`                                                    | —                                  | Axis label outside tick labels.                                                         | `'day'`                                             |
| `formatter`      | `(value: X, helpers: FormatterHelpers) => number \| string` | Built-in formatter                 | Formats each native X tick.                                                             | `(value: Date) => value.toISOString().slice(0, 10)` |
| `hidden`         | `boolean`                                                   | `false`                            | Hides the line, ticks, labels, and axis label.                                          | `true`                                              |
| `hideTicks`      | `boolean`                                                   | `false`                            | Hides ticks and tick labels while keeping the axis line.                                | `true`                                              |
| `labelCollision` | `'hide' \| 'truncate' \| 'wrap' \| 'error'`                 | Fit check; `'hide'` for auto width | Resolves labels that do not fit the available width.                                    | `'wrap'`                                            |
| `color`          | `Color`                                                     | Terminal default                   | ANSI color for the axis line, ticks, tick labels, and label.                            | `'ansiBrightBlue'`                                  |

#### `YAxis`

| Option          | Type                          | Default            | Description                                                  | Example                          |
| --------------- | ----------------------------- | ------------------ | ------------------------------------------------------------ | -------------------------------- |
| `domain`        | `readonly [number, number]`   | Data extent        | Explicit finite Y extent.                                    | `[0, 100]`                       |
| `ticks`         | `number \| readonly number[]` | Generated ticks    | Exact tick count or exact finite tick values.                | `[0, 25, 50, 75, 100]`           |
| `label`         | `string`                      | —                  | Axis label outside tick labels.                              | `'usage %'`                      |
| `formatter`     | `Formatter`                   | Built-in formatter | Formats each numeric Y tick.                                 | `(value) => String(value) + '%'` |
| `hidden`        | `boolean`                     | `false`            | Hides the line, ticks, labels, and axis label.               | `true`                           |
| `hideTicks`     | `boolean`                     | `false`            | Hides ticks and tick labels while keeping the axis line.     | `true`                           |
| `showTickLabel` | `boolean`                     | `false`            | Reserves width for complete tick labels.                     | `true`                           |
| `color`         | `Color`                       | Terminal default   | ANSI color for the axis line, ticks, tick labels, and label. | `'ansiBrightGreen'`              |

Flat `plot` axis options remain supported. When both forms are supplied, each field in `xAxis` or
`yAxis` overrides its matching flat alias:

```typescript
plot(data, {
  xLabel: 'legacy label',
  customXAxisTicks: [0, 10],
  xAxis: {
    label: 'structured label',
    ticks: [0, 5, 10],
    color: 'ansiCyan',
  },
});
```

### Legends, overlays, and annotations

#### `Legend` for `plot`

| Option       | Type                 | Default          | Description                                          | Example             |
| ------------ | -------------------- | ---------------- | ---------------------------------------------------- | ------------------- |
| `position`   | `LegendPosition`     | `'bottom'`       | Places the legend around the plot.                   | `'right'`           |
| `series`     | `string \| string[]` | —                | One series label or labels indexed by source series. | `['API', 'Worker']` |
| `points`     | `string \| string[]` | —                | One point label or labels indexed by overlay point.  | `'Peak'`            |
| `thresholds` | `string \| string[]` | —                | One threshold label or labels indexed by threshold.  | `'SLA'`             |
| `color`      | `Color`              | Terminal default | ANSI color for legend labels.                        | `'ansiWhite'`       |

#### `ChartLegend` for `renderChart`

| Option       | Type                           | Default              | Description                                                                           | Example                   |
| ------------ | ------------------------------ | -------------------- | ------------------------------------------------------------------------------------- | ------------------------- |
| `position`   | `LegendPosition`               | **Required**         | Places the legend around the plot.                                                    | `'bottom'`                |
| `series`     | `boolean \| readonly string[]` | `true` when omitted  | `true` shows all series; an ID array selects and orders them; `false` hides them.     | `['requests', 'latency']` |
| `points`     | `boolean \| readonly string[]` | `false` when omitted | `true` shows all points; an ID array selects and orders them; `false` hides them.     | `['incident']`            |
| `thresholds` | `boolean \| readonly string[]` | `false` when omitted | `true` shows all thresholds; an ID array selects and orders them; `false` hides them. | `['target']`              |
| `color`      | `Color`                        | Terminal default     | ANSI color for legend labels.                                                         | `'ansiWhite'`             |

#### Overlay points and thresholds

| Type and option           | Type     | Required | Description                                     | Example        |
| ------------------------- | -------- | -------- | ----------------------------------------------- | -------------- |
| `GraphPoint.x`            | `number` | Yes      | Numeric X coordinate.                           | `2`            |
| `GraphPoint.y`            | `number` | Yes      | Numeric Y coordinate.                           | `72`           |
| `GraphPoint.color`        | `Color`  | No       | ANSI point-glyph color.                         | `'ansiRed'`    |
| `Threshold.x`             | `number` | No       | Numeric X coordinate for a vertical line.       | `5`            |
| `Threshold.y`             | `number` | No       | Numeric Y coordinate for a horizontal line.     | `80`           |
| `Threshold.color`         | `Color`  | No       | ANSI reference-line color.                      | `'ansiYellow'` |
| `ChartOverlayPoint.id`    | `string` | Yes      | Unique point ID used by structured legends.     | `'incident'`   |
| `ChartOverlayPoint.name`  | `string` | No       | Human-readable label; defaults to `id`.         | `'Incident'`   |
| `ChartOverlayPoint.x`     | `X`      | Yes      | Native X coordinate.                            | `'Tue'`        |
| `ChartOverlayPoint.y`     | `number` | Yes      | Numeric Y coordinate on the primary Y-axis.     | `72`           |
| `ChartOverlayPoint.color` | `Color`  | No       | ANSI point-glyph color.                         | `'ansiRed'`    |
| `ChartThreshold.id`       | `string` | Yes      | Unique threshold ID used by structured legends. | `'sla'`        |
| `ChartThreshold.name`     | `string` | No       | Human-readable label; defaults to `id`.         | `'SLA'`        |
| `ChartThreshold.x`        | `X`      | No       | Native X coordinate for a vertical line.        | `'Tue'`        |
| `ChartThreshold.y`        | `number` | No       | Numeric Y coordinate for a horizontal line.     | `80`           |
| `ChartThreshold.color`    | `Color`  | No       | ANSI reference-line color.                      | `'ansiYellow'` |

A threshold must define `x`, `y`, or both. Structured IDs are unique within their entity type.

#### Structured annotations

Every annotation requires `id`; `color` optionally colors the complete annotation. Annotations do
not expand domains. They are clipped or omitted when coordinates fall outside explicit domains.

| Annotation | Required fields                                                 | Optional fields             | Description                                                                      | Example                                                                              |
| ---------- | --------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| X span     | `id`, `type: 'span'`, `axis: 'x'`, `from: X`, `to: X`           | `color`, `symbol`           | Fills an inclusive native-X interval across plot height.                         | `{ id: 'deploy', type: 'span', axis: 'x', from: 1, to: 2, symbol: '░' }`             |
| Y span     | `id`, `type: 'span'`, `axis: 'y'`, `from: number`, `to: number` | `color`, `symbol`           | Fills an inclusive numeric-Y interval across plot width.                         | `{ id: 'safe', type: 'span', axis: 'y', from: 0, to: 30 }`                           |
| Text       | `id`, `type: 'text'`, `x`, `y`, `text`                          | `color`, `align`            | Anchors display-safe text at one data coordinate. Alignment defaults to `right`. | `{ id: 'peak', type: 'text', x: 2, y: 90, text: 'Peak', align: 'center' }`           |
| Arrow      | `id`, `type: 'arrow'`, `from`, `to`                             | `color`, `lineSymbol`       | Connects two `[x, y]` coordinates; `to` contains the arrowhead.                  | `{ id: 'trend', type: 'arrow', from: [0, 20], to: [3, 60] }`                         |
| Error bar  | `id`, `type: 'errorBar'`, `x`, `y`                              | `color`, `xError`, `yError` | Draws symmetric or asymmetric error whiskers around one coordinate.              | `{ id: 'uncertainty', type: 'errorBar', x: 3, y: 60, xError: 0.2, yError: [5, 10] }` |

An error bar must define `xError`, `yError`, or both. Each accepts a nonnegative symmetric magnitude
or `[minus, plus]`. X error bars are not supported for string/band X scales.

```typescript
renderChart({
  series: [
    {
      id: 'trend',
      data: [
        [0, 20],
        [1, 35],
        [2, 60],
      ],
    },
  ],
  annotations: [
    { id: 'window', type: 'span', axis: 'x', from: 0.5, to: 1.5, color: 'ansiBlue' },
    { id: 'note', type: 'text', x: 1, y: 35, text: 'deploy', align: 'center' },
    { id: 'rise', type: 'arrow', from: [0, 20], to: [2, 60], lineSymbol: '·' },
    { id: 'range', type: 'errorBar', x: 2, y: 60, yError: [5, 10] },
  ],
});
```

### Colors and callbacks

#### Static colors

`Color` accepts all 16 standard ANSI foreground names:

| Standard      | Bright              |
| ------------- | ------------------- |
| `ansiBlack`   | `ansiBrightBlack`   |
| `ansiRed`     | `ansiBrightRed`     |
| `ansiGreen`   | `ansiBrightGreen`   |
| `ansiYellow`  | `ansiBrightYellow`  |
| `ansiBlue`    | `ansiBrightBlue`    |
| `ansiMagenta` | `ansiBrightMagenta` |
| `ansiCyan`    | `ansiBrightCyan`    |
| `ansiWhite`   | `ansiBrightWhite`   |

`plot.color` accepts a single `Color`, a color array indexed by series, or a callback:

```typescript
plot([first, second], {
  color: (seriesIndex, allSeries) =>
    seriesIndex === 0 && allSeries.length > 1 ? 'ansiCyan' : 'ansiMagenta',
});
```

#### Dynamic `Coloring`

| Branch and option      | Type                                            | Required              | Description                                                            | Example                                     |
| ---------------------- | ----------------------------------------------- | --------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `conditional.type`     | `'conditional'`                                 | Yes                   | Selects callback-based cell colors.                                    | `'conditional'`                             |
| `conditional.getColor` | `(context: ColorContext) => Color \| undefined` | Yes                   | Returns a cell color or `undefined` to use the static series fallback. | `({ y }) => y > 80 ? 'ansiRed' : undefined` |
| `gradient.type`        | `'gradient'`                                    | Yes                   | Selects equal-band palette coloring.                                   | `'gradient'`                                |
| `gradient.by`          | `'x' \| 'y'`                                    | Yes                   | Selects the data-space axis used for palette bands.                    | `'y'`                                       |
| `gradient.colors`      | `readonly Color[]`                              | Yes                   | Ordered palette containing at least two colors.                        | `['ansiGreen', 'ansiYellow', 'ansiRed']`    |
| `gradient.domain`      | `readonly [number, number]`                     | Resolved chart domain | Optional finite palette extent with minimum less than maximum.         | `[0, 100]`                                  |

```typescript
renderChart({
  series: [
    {
      id: 'temperature',
      data: [
        [0, 18],
        [1, 27],
        [2, 39],
      ],
      coloring: {
        type: 'gradient',
        by: 'y',
        colors: ['ansiBlue', 'ansiYellow', 'ansiRed'],
        domain: [0, 40],
      },
    },
  ],
});
```

#### Callback contexts

`Formatter` and `AxisFormatter` receive these helpers:

| `FormatterHelpers` field | Type         | Description                     | Example use            |
| ------------------------ | ------------ | ------------------------------- | ---------------------- |
| `axis`                   | `'x' \| 'y'` | Axis currently being formatted. | `helpers.axis === 'y'` |
| `xRange`                 | `number[]`   | Resolved numeric X extent.      | `helpers.xRange[0]`    |
| `yRange`                 | `number[]`   | Resolved numeric Y extent.      | `helpers.yRange[1]`    |

`Coloring` conditional callbacks receive:

| `ColorContext` field | Type        | Description                          | Example use               |
| -------------------- | ----------- | ------------------------------------ | ------------------------- |
| `series`             | `number`    | Zero-based source-series index.      | `context.series === 0`    |
| `mode`               | `GraphMode` | Primitive used by the occupied cell. | `context.mode === 'bar'`  |
| `x`                  | `number`    | Numeric data-space X coordinate.     | `context.x >= 10`         |
| `y`                  | `number`    | Numeric data-space Y coordinate.     | `context.y > 80`          |
| `plotX`              | `number`    | Zero-based plot-column coordinate.   | `context.plotX % 2 === 0` |
| `plotY`              | `number`    | Zero-based plot-row coordinate.      | `context.plotY === 0`     |

`lineFormatter` receives:

| `LineFormatterArgs` field | Type                         | Description                                      | Example use               |
| ------------------------- | ---------------------------- | ------------------------------------------------ | ------------------------- |
| `x`                       | `number`                     | Numeric data-space X coordinate.                 | `x > 5`                   |
| `y`                       | `number`                     | Numeric data-space Y coordinate.                 | `y === 0`                 |
| `plotX`                   | `number`                     | Zero-based plot-column coordinate.               | `{ x: plotX, ... }`       |
| `plotY`                   | `number`                     | Zero-based plot-row coordinate.                  | `{ y: plotY, ... }`       |
| `input`                   | `SingleLine`                 | Complete numeric source series.                  | `input.length`            |
| `index`                   | `number`                     | Zero-based datum index.                          | `index % 2`               |
| `minY`                    | `number`                     | Resolved minimum Y value.                        | `y === minY`              |
| `minX`                    | `number`                     | Resolved minimum X value.                        | `x === minX`              |
| `expansionX`              | `number[]`                   | Expanded X coordinates used by the renderer.     | `expansionX[index]`       |
| `expansionY`              | `number[]`                   | Expanded Y coordinates used by the renderer.     | `expansionY[index]`       |
| `toPlotCoordinates`       | `(x, y) => [number, number]` | Converts data coordinates into plot coordinates. | `toPlotCoordinates(x, y)` |

Each returned `CustomSymbol` has required numeric `x` and `y` plot coordinates plus a one-column
`symbol`:

```typescript
plot(data, {
  lineFormatter: ({ x, y, plotX, plotY, toPlotCoordinates }) => {
    const [baselineX, baselineY] = toPlotCoordinates(x, 50);
    return [
      { x: plotX, y: plotY, symbol: y >= 50 ? '◆' : '◇' },
      { x: baselineX, y: baselineY, symbol: '·' },
    ];
  },
});
```

### Bar layouts and value labels

| Layout         | Behavior                                                              |
| -------------- | --------------------------------------------------------------------- |
| `'overlap'`    | Draws each series at the same category position. This is the default. |
| `'grouped'`    | Places series side by side within each category.                      |
| `'stacked'`    | Adds series values into positive and negative stacks.                 |
| `'normalized'` | Converts each same-sign category total to percentages.                |

`valueLabels: true` uses the rendered value. The object form accepts every nested option:

| Option      | Type                                   | Default                    | Description                                                          | Example                             |
| ----------- | -------------------------------------- | -------------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| `formatter` | `(value, context) => number \| string` | Built-in number formatting | Formats the rendered value; normalized layouts receive a percentage. | `(value) => value.toFixed(0) + '%'` |
| `color`     | `Color`                                | Series color               | ANSI color applied to every value label.                             | `'ansiWhite'`                       |

The formatter context contains:

| `ValueLabelContext<X>` field | Type                       | Description                                      | Example use                       |
| ---------------------------- | -------------------------- | ------------------------------------------------ | --------------------------------- |
| `seriesIndex`                | `number`                   | Zero-based source-series index.                  | `context.seriesIndex`             |
| `seriesId`                   | `string \| undefined`      | Structured series ID when available.             | `context.seriesId ?? 'legacy'`    |
| `seriesName`                 | `string \| undefined`      | Structured series or legend name when available. | `context.seriesName`              |
| `datumIndex`                 | `number`                   | Zero-based index in the source series.           | `context.datumIndex`              |
| `x`                          | `X`                        | Native source X value.                           | `String(context.x)`               |
| `y`                          | `number`                   | Raw source Y value.                              | `context.y`                       |
| `mode`                       | `'bar' \| 'horizontalBar'` | Resolved bar orientation.                        | `context.mode`                    |
| `layout`                     | `BarLayout`                | Resolved multi-series layout.                    | `context.layout === 'normalized'` |

```typescript
renderChart({
  series: [
    {
      id: 'desktop',
      data: [
        ['Q1', 30],
        ['Q2', 45],
      ],
      mode: 'bar',
    },
    {
      id: 'mobile',
      data: [
        ['Q1', 70],
        ['Q2', 55],
      ],
      mode: 'bar',
    },
  ],
  xAxis: { scale: 'band' },
  barLayout: 'normalized',
  valueLabels: {
    formatter: (value, { seriesName, x }) => `${seriesName ?? 'series'} ${x}: ${value.toFixed(0)}%`,
    color: 'ansiBrightWhite',
  },
});
```

For `plot`, `fillArea` is unsupported with grouped, stacked, or normalized bars.
`lineFormatter` is unsupported with those layouts or with value labels.

### Symbol options

All chart-grid glyphs must occupy exactly one terminal display column. Per-call objects are merged
with `DEFAULT_SYMBOLS` and never mutate package defaults or caller input.

#### Shared `Symbols`

| Option        | Type                         | Description                                       | Example                         |
| ------------- | ---------------------------- | ------------------------------------------------- | ------------------------------- |
| `axis`        | `Partial<typeof AXIS>`       | Axis lines, ticks, boundaries, and intersections. | `{ we: '-', ns: '!' }`          |
| `chart`       | `Partial<typeof CHART>`      | Line and filled-area glyphs.                      | `{ we: '=', area: '#' }`        |
| `empty`       | `string`                     | Unoccupied plot cell.                             | `'.'`                           |
| `background`  | `string`                     | Glyph painted behind plot data.                   | `'·'`                           |
| `border`      | `string`                     | Plot-border glyph.                                | `'│'`                           |
| `thresholds`  | `Partial<typeof THRESHOLDS>` | Horizontal and vertical threshold glyphs.         | `{ x: '-', y: '!' }`            |
| `point`       | `string`                     | Point-overlay glyph.                              | `'◆'`                           |
| `candlestick` | `CandlestickSymbols`         | Shared candlestick glyphs.                        | `{ rising: '+', falling: 'x' }` |
| `annotations` | `AnnotationSymbols`          | Span, arrow, and error-bar glyphs.                | `{ span: ':', arrowLine: '~' }` |
| `ellipsis`    | `string`                     | Truncated-label marker.                           | `'~'`                           |

#### Axis, chart, and threshold glyphs

| Group        | Key              | Default | Use                                 |
| ------------ | ---------------- | ------- | ----------------------------------- |
| `axis`       | `n`              | `▲`     | Positive Y-axis arrowhead.          |
| `axis`       | `ns`             | `│`     | Vertical Y-axis line.               |
| `axis`       | `y`              | `┤`     | Y-axis tick.                        |
| `axis`       | `nse`            | `└`     | Bottom-left axis corner.            |
| `axis`       | `nsw`            | `┘`     | Bottom-right/secondary-axis corner. |
| `axis`       | `x`              | `┬`     | X-axis tick.                        |
| `axis`       | `we`             | `─`     | Horizontal X-axis line.             |
| `axis`       | `e`              | `▶`     | Positive X-axis arrowhead.          |
| `axis`       | `intersectionXY` | `┼`     | X/Y-axis intersection.              |
| `axis`       | `intersectionX`  | `┴`     | X-axis boundary intersection.       |
| `axis`       | `intersectionY`  | `├`     | Y-axis boundary intersection.       |
| `axis`       | `y2`             | `├`     | Secondary Y-axis tick.              |
| `chart`      | `we`             | `━`     | Horizontal line segment.            |
| `chart`      | `wns`            | `┓`     | Left/down line corner.              |
| `chart`      | `ns`             | `┃`     | Vertical line segment.              |
| `chart`      | `nse`            | `┗`     | Up/right line corner.               |
| `chart`      | `wsn`            | `┛`     | Left/up line corner.                |
| `chart`      | `sne`            | `┏`     | Down/right line corner.             |
| `chart`      | `area`           | `█`     | Filled area and bar body.           |
| `thresholds` | `x`              | `━`     | Horizontal reference line.          |
| `thresholds` | `y`              | `┃`     | Vertical reference line.            |

#### Candlestick and annotation glyphs

| Group         | Option       | Default | Description                   | Example |
| ------------- | ------------ | ------- | ----------------------------- | ------- |
| `candlestick` | `wick`       | `│`     | Wick glyph.                   | `'!'`   |
| `candlestick` | `rising`     | `░`     | Close-greater-than-open body. | `'+'`   |
| `candlestick` | `falling`    | `█`     | Close-less-than-open body.    | `'x'`   |
| `candlestick` | `unchanged`  | `─`     | Equal open/close body.        | `'='`   |
| `annotations` | `span`       | `░`     | Reference-span fill.          | `':'`   |
| `annotations` | `arrowLine`  | `·`     | Arrow path.                   | `'~'`   |
| `arrowHeads`  | `left`       | `←`     | Left-facing arrowhead.        | `'<'`   |
| `arrowHeads`  | `right`      | `→`     | Right-facing arrowhead.       | `'>'`   |
| `arrowHeads`  | `up`         | `↑`     | Up-facing arrowhead.          | `'^'`   |
| `arrowHeads`  | `down`       | `↓`     | Down-facing arrowhead.        | `'v'`   |
| `arrowHeads`  | `upLeft`     | `↖`     | Up-left arrowhead.            | `'7'`   |
| `arrowHeads`  | `upRight`    | `↗`     | Up-right arrowhead.           | `'9'`   |
| `arrowHeads`  | `downLeft`   | `↙`     | Down-left arrowhead.          | `'1'`   |
| `arrowHeads`  | `downRight`  | `↘`     | Down-right arrowhead.         | `'3'`   |
| `errorBar`    | `horizontal` | `─`     | Horizontal whisker.           | `'-'`   |
| `errorBar`    | `vertical`   | `│`     | Vertical whisker.             | `'!'`   |
| `errorBar`    | `leftCap`    | `├`     | Left cap.                     | `'['`   |
| `errorBar`    | `rightCap`   | `┤`     | Right cap.                    | `']'`   |
| `errorBar`    | `topCap`     | `┬`     | Top cap.                      | `'^'`   |
| `errorBar`    | `bottomCap`  | `┴`     | Bottom cap.                   | `'v'`   |
| `errorBar`    | `center`     | `┼`     | Center marker.                | `'+'`   |

```typescript
import { DEFAULT_SYMBOLS, renderChart } from 'simple-ascii-chart';

console.log(DEFAULT_SYMBOLS.annotations.arrowHeads);

renderChart({
  series: [
    {
      id: 'trend',
      data: [
        [0, 1],
        [1, 3],
      ],
    },
  ],
  symbols: {
    axis: { we: '-', ns: '|' },
    chart: { we: '=', ns: '!' },
    point: '*',
    annotations: {
      span: ':',
      arrowLine: '~',
      arrowHeads: { left: '<', right: '>', up: '^', down: 'v' },
      errorBar: { horizontal: '-', vertical: '!', center: '+' },
    },
  },
});
```

### `candlestick` options

`candlestick(spec)` accepts finite `[x, open, high, low, close]` tuples. X values must be unique,
and every tuple must satisfy `low <= open/close <= high`.

| Option       | Type                                | Default              | Description                                             | Example                                           |
| ------------ | ----------------------------------- | -------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| `data`       | `readonly CandlestickDatum[]`       | **Required**         | Unique-X OHLC tuples.                                   | `[[0, 100, 112, 96, 108]]`                        |
| `width`      | `number`                            | `60`                 | Positive integer plot width.                            | `32`                                              |
| `height`     | `number`                            | `15`                 | Positive integer plot height.                           | `12`                                              |
| `title`      | `string`                            | —                    | Text rendered above the chart.                          | `'ACME'`                                          |
| `xAxis`      | `XAxis<number>`                     | Data extent          | Numeric X-axis configuration.                           | `{ domain: [0, 10], label: 'period' }`            |
| `yAxis`      | `YAxis`                             | OHLC extent          | Numeric Y-axis configuration.                           | `{ domain: [90, 120], label: 'price' }`           |
| `style`      | `CandlestickStyle`                  | Candlestick defaults | Per-direction body colors and glyphs plus wick glyph.   | `{ rising: { color: 'ansiGreen' } }`              |
| `thresholds` | `readonly ChartThreshold<number>[]` | `[]`                 | Named horizontal and/or vertical reference lines.       | `[{ id: 'target', y: 115, color: 'ansiYellow' }]` |
| `symbols`    | `Symbols`                           | Package defaults     | Shared glyph overrides. `style` glyphs take precedence. | `{ candlestick: { wick: '!' } }`                  |
| `debugMode`  | `boolean`                           | `false`              | Logs out-of-bounds drawing attempts.                    | `true`                                            |

`CandlestickStyle` contains `wick` plus `rising`, `falling`, and `unchanged` mark styles. Each mark
style accepts every option below:

| Option                                                | Type                   | Default           | Description                                     | Example                                |
| ----------------------------------------------------- | ---------------------- | ----------------- | ----------------------------------------------- | -------------------------------------- |
| `wick`                                                | `string`               | `│`               | One-column wick glyph shared by all directions. | `'!'`                                  |
| `rising`                                              | `CandlestickMarkStyle` | `{ symbol: '░' }` | Style used when close is greater than open.     | `{ symbol: '+', color: 'ansiGreen' }`  |
| `falling`                                             | `CandlestickMarkStyle` | `{ symbol: '█' }` | Style used when close is less than open.        | `{ symbol: 'x', color: 'ansiRed' }`    |
| `unchanged`                                           | `CandlestickMarkStyle` | `{ symbol: '─' }` | Style used when close equals open.              | `{ symbol: '=', color: 'ansiYellow' }` |
| `rising.symbol`, `falling.symbol`, `unchanged.symbol` | `string`               | Direction default | One-column body glyph.                          | `'+'`                                  |
| `rising.color`, `falling.color`, `unchanged.color`    | `Color`                | Terminal default  | ANSI color applied to both body and wick.       | `'ansiGreen'`                          |

```typescript
candlestick({
  width: 32,
  height: 12,
  title: 'ACME',
  data: [
    [0, 100, 112, 96, 108],
    [1, 108, 114, 102, 105],
    [2, 105, 116, 104, 113],
  ],
  xAxis: { label: 'period' },
  yAxis: { label: 'price' },
  style: {
    wick: '|',
    rising: { symbol: '+', color: 'ansiGreen' },
    falling: { symbol: 'x', color: 'ansiRed' },
    unchanged: { symbol: '=', color: 'ansiYellow' },
  },
  thresholds: [{ id: 'target', name: 'Target', y: 115, color: 'ansiYellow' }],
});
```

### `heatmap` options

`heatmap(spec)` supports two mutually exclusive branches: exact `levels` for categorical or
already-binned values, and one numeric `threshold`. Rows must have equal lengths. `rows` must match
the row count, and `columns` must match the column count.

| Option      | Type                        | Default                       | Description                                                                               | Example                                                         |
| ----------- | --------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `data`      | `readonly HeatmapValue[][]` | **Required**                  | Rectangular matrix; `null` reserves an empty cell.                                        | `[['pass', 'fail'], ['pass', null]]`                            |
| `levels`    | `readonly HeatmapLevel[]`   | Required for level branch     | Unique exact mappings for every non-null data value. Mutually exclusive with `threshold`. | `[{ value: 'pass', color: 'ansiGreen' }]`                       |
| `threshold` | `HeatmapThreshold`          | Required for threshold branch | Binary mapping for finite numeric cells. Mutually exclusive with `levels`.                | `{ value: 80, belowColor: 'ansiGreen', aboveColor: 'ansiRed' }` |
| `rows`      | `readonly string[]`         | —                             | Row labels matching the data row count.                                                   | `['Node 22', 'Node 24']`                                        |
| `columns`   | `readonly string[]`         | —                             | Column labels matching the matrix width.                                                  | `['Linux', 'macOS']`                                            |
| `title`     | `string`                    | —                             | Text rendered above the matrix.                                                           | `'CI matrix'`                                                   |
| `legend`    | `boolean`                   | `false`                       | Renders level or threshold legend entries below the matrix.                               | `true`                                                          |
| `symbols`   | `HeatmapSymbols`            | `DEFAULT_SYMBOLS.heatmap`     | Per-call heatmap glyph and gap overrides.                                                 | `{ cell: '#', empty: '_', gap: ' / ' }`                         |

#### `HeatmapLevel`

| Option   | Type               | Default          | Description                                      | Example       |
| -------- | ------------------ | ---------------- | ------------------------------------------------ | ------------- |
| `value`  | `string \| number` | **Required**     | Unique exact non-null cell value.                | `'pass'`      |
| `symbol` | `string`           | `symbols.cell`   | One-column glyph for matching cells.             | `'●'`         |
| `color`  | `Color`            | Terminal default | ANSI color for matching cells and legend marker. | `'ansiGreen'` |
| `label`  | `string`           | `String(value)`  | Legend text.                                     | `'Passed'`    |

#### `HeatmapThreshold`

| Option        | Type     | Default                  | Description                                              | Example       |
| ------------- | -------- | ------------------------ | -------------------------------------------------------- | ------------- |
| `value`       | `number` | **Required**             | Finite comparison value. Equality uses the above branch. | `80`          |
| `belowColor`  | `Color`  | **Required**             | ANSI color for cells below the threshold.                | `'ansiGreen'` |
| `aboveColor`  | `Color`  | **Required**             | ANSI color for cells at or above the threshold.          | `'ansiRed'`   |
| `belowSymbol` | `string` | `symbols.belowThreshold` | One-column below-threshold glyph.                        | `'.'`         |
| `aboveSymbol` | `string` | `symbols.aboveThreshold` | One-column at-or-above glyph.                            | `'!'`         |
| `belowLabel`  | `string` | `< ${value}`             | Below-threshold legend text.                             | `'Healthy'`   |
| `aboveLabel`  | `string` | `≥ ${value}`             | At-or-above legend text.                                 | `'Saturated'` |

#### `HeatmapSymbols`

| Option           | Type     | Default    | Description                               | Example |
| ---------------- | -------- | ---------- | ----------------------------------------- | ------- |
| `cell`           | `string` | `█`        | One-column categorical cell glyph.        | `'#'`   |
| `belowThreshold` | `string` | `░`        | One-column default below-threshold glyph. | `'<'`   |
| `aboveThreshold` | `string` | `█`        | One-column default at-or-above glyph.     | `'>'`   |
| `empty`          | `string` | Space      | One-column glyph for `null`.              | `'_'`   |
| `gap`            | `string` | Two spaces | Display-safe text inserted between cells. | `' / '` |

```typescript
heatmap({
  title: 'CPU saturation',
  rows: ['api', 'worker'],
  columns: ['09:00', '10:00', '11:00'],
  data: [
    [62, 84, 91],
    [45, null, 78],
  ],
  threshold: {
    value: 80,
    belowColor: 'ansiGreen',
    aboveColor: 'ansiRed',
    belowSymbol: '.',
    aboveSymbol: '!',
    belowLabel: 'Healthy',
    aboveLabel: 'Saturated',
  },
  symbols: { empty: '_', gap: ' ' },
  legend: true,
});
```

### `sparkline` options

`sparkline(values, options?)` accepts finite numbers and `null` gaps. It emits exactly one display
cell per input value. Global/per-value `color` and `threshold` are mutually exclusive.

| Option      | Type                                       | Default                     | Description                                                               | Example                                                            |
| ----------- | ------------------------------------------ | --------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `color`     | `Color \| readonly (Color \| undefined)[]` | Terminal default            | One global ANSI color or an array whose length exactly matches the input. | `['ansiGreen', undefined, 'ansiRed']`                              |
| `threshold` | `SparklineThreshold`                       | —                           | Selects colors by comparing each finite value with one threshold.         | `{ value: 80, belowColor: 'ansiGreen', aboveColor: 'ansiRed' }`    |
| `symbols`   | `SparklineSymbols`                         | `DEFAULT_SYMBOLS.sparkline` | Per-call level and empty-cell glyphs.                                     | `{ levels: ['.', ':', '-', '=', '+', '*', '#', '@'], empty: '_' }` |

#### `SparklineThreshold`

| Option       | Type     | Required | Description                                          | Example       |
| ------------ | -------- | -------- | ---------------------------------------------------- | ------------- |
| `value`      | `number` | Yes      | Finite comparison value. Equality uses `aboveColor`. | `80`          |
| `belowColor` | `Color`  | Yes      | ANSI color below the threshold.                      | `'ansiGreen'` |
| `aboveColor` | `Color`  | Yes      | ANSI color at or above the threshold.                | `'ansiRed'`   |

#### `SparklineSymbols`

| Option   | Type                                                                        | Default    | Description                                                | Example                                    |
| -------- | --------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------- | ------------------------------------------ |
| `levels` | `readonly [string, string, string, string, string, string, string, string]` | `▁▂▃▄▅▆▇█` | Exactly eight one-column glyphs ordered lowest to highest. | `['.', ':', '-', '=', '+', '*', '#', '@']` |
| `empty`  | `string`                                                                    | Space      | One-column glyph used for `null`.                          | `'_'`                                      |

```typescript
sparkline([20, 45, null, 82, 95], {
  threshold: {
    value: 80,
    belowColor: 'ansiGreen',
    aboveColor: 'ansiRed',
  },
  symbols: {
    levels: ['.', ':', '-', '=', '+', '*', '#', '@'],
    empty: '_',
  },
});
```

### `histogram` options

`histogram` is a data helper, not a renderer. It accepts raw finite samples or pre-counted
`[x, count]` tuples and returns sorted `[x, count]` tuples.

| Option     | Type     | Default          | Description                                                      | Example |
| ---------- | -------- | ---------------- | ---------------------------------------------------------------- | ------- |
| `binCount` | `number` | Sturges' formula | Positive integer number of bins. Available only for raw samples. | `8`     |

```typescript
const fromSamples = histogram([1, 1, 2, 3, 5, 8], { binCount: 3 });
const fromCounts = histogram([
  [2, 3],
  [1, 4],
  [2, 2],
]); // [[1, 4], [2, 5]]

console.log(plot(fromSamples, { mode: 'bar' }));
```

### Closed variant reference

These are every accepted value for public closed unions:

| Family           | Values                                                |
| ---------------- | ----------------------------------------------------- |
| Renderer backend | `'ascii'`, `'braille'`                                |
| Graph mode       | `'line'`, `'point'`, `'bar'`, `'horizontalBar'`       |
| Interpolation    | `'step'`, `'linear'`                                  |
| Overflow         | `'clip'`, `'discard'`                                 |
| Bar layout       | `'overlap'`, `'grouped'`, `'stacked'`, `'normalized'` |
| X scale          | `'linear'`, `'band'`, `'time'`                        |
| Label collision  | `'hide'`, `'truncate'`, `'wrap'`, `'error'`           |
| Legend position  | `'left'`, `'right'`, `'top'`, `'bottom'`, `'auto'`    |
| Annotation type  | `'span'`, `'text'`, `'arrow'`, `'errorBar'`           |
| Coloring type    | `'conditional'`, `'gradient'`                         |
| Gradient axis    | `'x'`, `'y'`                                          |
| Series Y-axis    | `'primary'`, `'secondary'`                            |
| Text alignment   | `'left'`, `'center'`, `'right'`                       |

For `labelCollision: 'error'`, rendering fails with a chart layout error when labels cannot fit.
`legend.position: 'auto'` selects a position from available space.

## Public runtime constants

These named exports expose the default ANSI and glyph values used by the renderers:

| Export        | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `ANSI_COLORS` | Maps every supported `Color` name to its ANSI foreground sequence. |
| `ANSI_RESET`  | ANSI sequence that clears active terminal styling.                 |
| `AXIS`        | Default axis, tick, boundary, and intersection glyphs.             |
| `CHART`       | Default line, corner, and filled-area glyphs.                      |
| `EMPTY`       | Default glyph for an unoccupied plot cell.                         |
| `LAYOUT`      | Shared minimum-size, formatting, and padding constants.            |
| `POINT`       | Default point-overlay glyph.                                       |
| `THRESHOLDS`  | Default horizontal and vertical threshold glyphs.                  |

```typescript
import {
  ANSI_COLORS,
  ANSI_RESET,
  AXIS,
  CHART,
  EMPTY,
  LAYOUT,
  POINT,
  THRESHOLDS,
} from 'simple-ascii-chart';

console.log(ANSI_COLORS.ansiCyan, POINT, ANSI_RESET);
console.log(AXIS.we, CHART.area, EMPTY, THRESHOLDS.x, LAYOUT.MIN_PLOT_HEIGHT);
```

## ASCII and Braille backends

`plot` and `renderChart` accept `renderer: 'ascii' | 'braille'`.

```typescript
plot(data, { renderer: 'ascii', width: 30, height: 8 });
plot(data, { renderer: 'braille', width: 30, height: 8 });
```

ASCII is the default. Braille uses a 2-by-4 dot grid inside each terminal cell, increasing data resolution without increasing terminal dimensions. Axes, labels, titles, legends, and annotations remain ordinary terminal cells.

A terminal cell can carry only one ANSI style. When differently colored Braille dots share one cell, the last occupied subcell determines that cell's style.

## Shared chart features

### Adaptive width

Set `width: 'auto'` to use `process.stdout.columns`. The fallback is 80 columns. If `height` is omitted, the chart derives it from `aspectRatio` while compensating for terminal cell proportions. Auto width uses an aspect ratio of `2` when `aspectRatio` is omitted.

### Axes and overflow

- `overflow: 'discard'` omits out-of-domain values.
- `overflow: 'clip'` clips line geometry at explicit domain boundaries.
- X-axis label collisions support `hide`, `truncate`, `wrap`, and `error` policies.
- Numeric tick counts include both domain endpoints.

### Colors

All 16 standard ANSI foreground colors are available through the `Color` type. Dynamic coloring supports conditional callbacks and X/Y palette gradients.

### Symbols

Import `DEFAULT_SYMBOLS` to inspect renderer defaults. Per-call overrides merge without mutating package defaults or caller input.

```typescript
import { DEFAULT_SYMBOLS, plot } from 'simple-ascii-chart';

console.log(DEFAULT_SYMBOLS.sparkline.levels);
plot(data, {
  symbols: {
    point: '◆',
    thresholds: { y: '!' },
    ellipsis: '~',
  },
});
```

Grid symbols must occupy exactly one terminal display column. Titles, labels, ticks, and legends support ANSI text, combining characters, CJK/full-width characters, and emoji.

### Annotations

Structured charts support spans, text, arrows, and error bars. Annotations use data coordinates, never expand domains, and clip or disappear when their anchors fall outside explicit domains.

## Errors

Runtime validation throws `ChartTypeError` or `ChartRangeError`. Both expose stable `code` and `path` fields. Use those fields for program logic; treat message text as descriptive.

```typescript
import { ChartRangeError, renderChart } from 'simple-ascii-chart';

try {
  renderChart(spec);
} catch (error) {
  if (error instanceof ChartRangeError) {
    console.error(error.code, error.path);
  }
}
```

`ChartErrorCode` contains:

- `ERR_CHART_INVALID_TYPE`
- `ERR_CHART_INVALID_VALUE`
- `ERR_CHART_DUPLICATE_ID`
- `ERR_CHART_OUT_OF_DOMAIN`
- `ERR_CHART_LAYOUT`

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run check-exports
```

Executable examples and snapshots cover every public renderer backend, configurable option surface, and closed variant.

## Contributing

Contributions are welcome. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for setup and pull request guidance, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations.

## License

[MIT](./LICENSE)
