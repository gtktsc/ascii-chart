# Simple ASCII Chart

![NPM License](https://img.shields.io/npm/l/simple-ascii-chart)
![NPM Version](https://img.shields.io/npm/v/simple-ascii-chart)
![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/simple-ascii-chart)
![Codecov](https://img.shields.io/codecov/c/github/gtktsc/ascii-chart)

**Simple ASCII Chart** is a TypeScript package for creating customizable ASCII charts in the terminal. It supports two-dimensional data, multiple series, custom colors, and formatters.

- [Playground and documentation](https://simple-ascii-chart.vercel.app/)
- [NPM package](https://www.npmjs.com/package/simple-ascii-chart)

## Installation

Install the package using `yarn` (or `npm`):

```bash
yarn add simple-ascii-chart
# or
npm install simple-ascii-chart
```

## Usage

In ESM (for example, TypeScript or modern Node.js):

```javascript
import plot from 'simple-ascii-chart';
// or, if you prefer named imports:
import { plot } from 'simple-ascii-chart';

const graph = plot(input, settings);
console.log(graph);
```

In CommonJS:

```javascript
// Option 1: access default export
const plot = require('simple-ascii-chart').default;

// Option 2: use named export
const { plot } = require('simple-ascii-chart');

const graph = plot(input, settings);
console.log(graph);
```

## CLI

A CLI tool is also available:

- [GitHub repository](https://github.com/gtktsc/simple-ascii-chart-cli)
- [NPM package](https://www.npmjs.com/package/simple-ascii-chart-cli)

## Playground

Create charts interactively in the [playground](https://simple-ascii-chart.vercel.app/playground).

## API Endpoint

Generate charts via the API by sending a POST request with your input data:

```bash
curl -d input='[[1,2],[2,3],[3,4]]' -G https://simple-ascii-chart.vercel.app/api
```

Or pass it as a URL parameter:

```bash
https://simple-ascii-chart.vercel.app/api?input=[[1,2],[2,3],[3,4]]&settings={%22width%22:50}
```

## Input Format

Input data should be a list of points (single series) or a list of point-lists (multiple series):

```typescript
type Point = [x: number, y: number];
type Coordinates = Point[] | Point[][];
```

Single series:

```typescript
const input = [
  [1, 1],
  [2, 4],
  [3, 40],
];
```

Multiple series:

```typescript
const input = [
  [
    [0, 18],
    [1, 1],
    [2, 3],
  ],
  [
    [4, 1],
    [5, 0],
    [6, 1],
  ],
];
```

### Input Types

- **`Point`**: A single point with x and y coordinates, represented as `[x, y]`.
- **`MaybePoint`**: Allows partial or undefined values within a point, accommodating incomplete data.
- **`SingleLine`**: A series of connected points representing a single line.
- **`MultiLine`**: A collection of `SingleLine` arrays for multiple data series.

## Configuration (Settings)

Customize `plot` with the following settings:

### Settings Reference

| Option | Description |
|--------|-------------|
| `color` | `Color`, `Color[]`, or `ColorGetter` for series coloring. |
| `width` | Plot width. |
| `height` | Plot height. |
| `yRange` | Y-axis range as `[min, max]`. Values outside this range are filtered before rendering. |
| `showTickLabel` | Show full tick labels on the Y-axis. |
| `hideXAxis` | Hide the X-axis line. |
| `hideXAxisTicks` | Hide X-axis tick markers and labels. |
| `hideYAxis` | Hide the Y-axis line. |
| `hideYAxisTicks` | Hide Y-axis tick markers and labels. |
| `customXAxisTicks` | Explicit X tick values. |
| `customYAxisTicks` | Explicit Y tick values. |
| `axisCenter` | Axis center as `[x, y]`. Default axis origin is bottom-left. |
| `formatter` | Axis label formatter: `(value, helpers) => string \| number`. |
| `lineFormatter` | Custom point renderer: `(args: LineFormatterArgs) => CustomSymbol \| CustomSymbol[]`. |
| `title` | Chart title shown above the plot. |
| `xLabel` | X-axis label. |
| `yLabel` | Y-axis label. |
| `thresholds` | Threshold lines (`x` and/or `y`) with optional color. |
| `points` | Overlay points with optional color. |
| `fillArea` | Fill area under lines using the `area` chart symbol. |
| `legend` | Legend config (`position`, `series`, `points`, `thresholds`). |
| `symbols` | Symbol overrides for `axis`, `chart`, `empty`, `background`, `border`, `thresholds`, `point`. |
| `mode` | Plot mode: `'line'`, `'point'`, `'bar'`, `'horizontalBar'`. |
| `debugMode` | Enable debug logging for out-of-bounds draw attempts. |

### Symbols

Override default symbols. Main sections are `axis`, `chart`, `thresholds`, `point`, `empty`, `background`, and `border`.

```typescript
symbols: {
  background: '.',
  border: undefined,
  point: '●',
  thresholds: {
    x: '━',
    y: '┃',
  },
  empty: ' ',
  axis: {
    n: '▲',
    ns: '│',
    y: '┤',
    nse: '└',
    x: '┬',
    we: '─',
    e: '▶',
  },
  chart: {
    we: '━',
    wns: '┓',
    ns: '┃',
    nse: '┗',
    wsn: '┛',
    sne: '┏',
    area: '█',
  },
}
```

### Summary

```typescript
type Settings = {
  color?: Colors; // Colors for the plot lines or areas
  width?: number; // Width of the plot
  height?: number; // Height of the plot
  yRange?: [number, number]; // Range of y-axis values
  showTickLabel?: boolean; // Option to show tick labels on the axis
  hideXAxis?: boolean; // Option to hide the x-axis
  hideXAxisTicks?: boolean; // Option to hide x-axis ticks and labels
  hideYAxis?: boolean; // Option to hide the y-axis
  hideYAxisTicks?: boolean; // Option to hide y-axis ticks and labels
  customXAxisTicks?: number[]; // Custom values for x-axis ticks
  customYAxisTicks?: number[]; // Custom values for y-axis ticks
  title?: string; // Title of the plot
  xLabel?: string; // Label for the x-axis
  yLabel?: string; // Label for the y-axis
  thresholds?: Threshold[]; // Array of threshold lines
  points?: GraphPoint[]; // Array of points to render
  fillArea?: boolean; // Option to fill the area under lines
  legend?: Legend; // Legend settings
  axisCenter?: MaybePoint; // Center point for axes alignment
  formatter?: Formatter; // Custom formatter for axis values
  lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[]; // Custom line formatter
  symbols?: Symbols; // Custom symbols for chart elements
  mode?: GraphMode; // Graph rendering mode
  debugMode?: boolean; // Option to enable debug mode
};
```

## Examples

### Simple Plot

Input:

```typescript
plot(
  [
    [1, 1],
    [2, 4],
    [3, 4],
    [4, 2],
    [5, -1],
  ],
  { width: 9, height: 6 },
);
```

Expected Output:

```bash
  ▲
 4┤ ┏━━━┓
  │ ┃   ┃
 2┤ ┃   ┗━┓
 1┤━┛     ┃
  │       ┃
-1┤       ┗━
  └┬─┬─┬─┬─┬▶
   1 2 3 4 5
```

### Plot with Title and Custom Size

Input:

```typescript
plot(
  [
    [1, 1],
    [2, 4],
    [3, 4],
    [4, 2],
    [5, -1],
    [6, 3],
    [7, -1],
    [8, 9],
  ],
  { title: 'Important data', width: 20, height: 8 },
);
```

Expected Output:

```bash
Important data
  ▲
 9┤                  ┏━
  │                  ┃
  │                  ┃
 4┤  ┏━━━━┓          ┃
 3┤  ┃    ┃     ┏━┓  ┃
 2┤  ┃    ┗━━┓  ┃ ┃  ┃
 1┤━━┛       ┃  ┃ ┃  ┃
-1┤          ┗━━┛ ┗━━┛
  └┬──┬─┬──┬──┬──┬─┬──┬▶
   1  2 3  4  5  6 7  8
```

### Plot with Axis Labels

Input:

```typescript
plot(
  [
    [1, 1],
    [2, 4],
    [3, 4],
    [4, 2],
    [5, -1],
    [6, 3],
    [7, -1],
    [8, 9],
  ],
  { xLabel: 'x', yLabel: 'y', width: 20, height: 8 },
);
```

Expected Output:

```bash
   ▲
  9┤                  ┏━
   │                  ┃
   │                  ┃
  4┤  ┏━━━━┓          ┃
  3┤  ┃    ┃     ┏━┓  ┃
y 2┤  ┃    ┗━━┓  ┃ ┃  ┃
  1┤━━┛       ┃  ┃ ┃  ┃
 -1┤          ┗━━┛ ┗━━┛
   └┬──┬─┬──┬──┬──┬─┬──┬▶
    1  2 3  4  5  6 7  8
             x
```

### Plot with Colors

Input:

```typescript
plot(
  [
    [
      [1, 1],
      [2, 2],
      [3, 4],
      [4, 6],
    ],
    [
      [5, 4],
      [6, 1],
      [7, 2],
      [8, 3],
    ],
  ],
  {
    width: 20,
    fillArea: true,
    color: ['ansiGreen', 'ansiBlue'],
    legend: { position: 'bottom', series: ['first', 'second'] },
  },
);
```

Expected Output:

```bash
 ▲
6┤       ██
 │       ██
4┤    █████  ███
3┤    █████  ███    ██
2┤  ███████  ███ █████
1┤█████████  █████████
 └┬──┬─┬──┬──┬──┬─┬──┬▶
  1  2 3  4  5  6 7  8
█ first
█ second

```

### Plot with Border

Input:

```typescript
plot(
  [
    [1, 1],
    [2, 4],
    [3, 4],
    [4, 2],
    [5, -1],
    [6, 3],
    [7, -1],
    [8, 9],
  ],
  { symbols: { border: '█' }, xLabel: 'x', yLabel: 'y', width: 20, height: 8 },
);
```

Expected Output:

```bash
███████████████████████████
█   ▲                     █
█  9┤                  ┏━ █
█   │                  ┃  █
█   │                  ┃  █
█  4┤  ┏━━━━┓          ┃  █
█  3┤  ┃    ┃     ┏━┓  ┃  █
█y 2┤  ┃    ┗━━┓  ┃ ┃  ┃  █
█  1┤━━┛       ┃  ┃ ┃  ┃  █
█ -1┤          ┗━━┛ ┗━━┛  █
█   └┬──┬─┬──┬──┬──┬─┬──┬▶█
█    1  2 3  4  5  6 7  8 █
█             x           █
███████████████████████████
```

### Plot with Filled Area

Input:

```typescript
plot(
  [
    [
      [1, 1],
      [2, 2],
      [3, 4],
      [4, 6],
    ],
    [
      [1, 4],
      [2, 1],
      [3, 2],
      [4, 3],
    ],
  ],
  {
    fillArea: true,
    color: ['ansiGreen', 'ansiBlue'],
  },
);
```

Expected Output:

```bash
  ▲
 6┤  ██
  │  ██
 4┤████
 3┤████
 2┤████
 1┤████
  └┬┬┬┬▶
   1234
```

### Scaled-Up Plot

Input:

```typescript
plot(
  [
    [1, 1],
    [2, 4],
    [3, 40],
    [4, 2],
    [5, -1],
    [6, 3],
    [7, -1],
    [8, -1],
    [9, 9],
    [10, 9],
  ],
  { width: 40, height: 10 },
);
```

Expected Output:

```bash
   ▲
 40┤        ┏━━━┓
   │        ┃   ┃
   │        ┃   ┃
   │        ┃   ┃
   │        ┃   ┃
   │        ┃   ┃
   │        ┃   ┃
  9┤        ┃   ┃                     ┏━━━━━
  3┤   ┏━━━━┛   ┗━━━┓    ┏━━━┓        ┃
 -1┤━━━┛            ┗━━━━┛   ┗━━━━━━━━┛
   └┬───┬────┬───┬───┬────┬───┬───┬────┬───┬▶
    1   2    3   4   5    6   7   8    9   10
```

### Add Thresholds

Input:

```typescript
plot(
  [
    [1, 1],
    [2, 4],
    [3, 4],
    [4, 2],
    [5, -1],
    [6, 3],
    [7, -1],
    [8, 9],
  ],
  {
    width: 40,
    thresholds: [
      {
        y: 5,
        x: 5,
      },
      {
        x: 2,
      },
    ],
  },
);
```

Expected Output:

```bash
  ▲     ┃               ┃
 9┤     ┃               ┃                ┏━
  │     ┃               ┃                ┃
  │     ┃               ┃                ┃
  │━━━━━┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  │     ┃               ┃                ┃
 4┤     ┃━━━━━━━━━━┓    ┃                ┃
 3┤     ┃          ┃    ┃     ┏━━━━┓     ┃
 2┤     ┃          ┗━━━━┃     ┃    ┃     ┃
 1┤━━━━━┃               ┃     ┃    ┃     ┃
  │     ┃               ┃     ┃    ┃     ┃
-1┤     ┃               ┃━━━━━┛    ┗━━━━━┛
  └┬─────┬────┬─────┬────┬─────┬────┬─────┬▶
   1     2    3     4    5     6    7     8
```

### Add Points, Thresholds, and Legend

Input:

```typescript
plot(
  [
    [
      [1, 2],
      [2, -2],
      [3, 4],
      [4, 1],
    ],
    [
      [1, 6],
      [2, -3],
      [3, 0],
      [4, 0],
    ],
  ],
  {
    width: 40,
    color: ['ansiGreen', 'ansiMagenta', 'ansiBlack', 'ansiYellow'],
    legend: {
      position: 'left',
      series: ['series 1', 'series 2'],
      points: ['point 1', 'point 2', 'point 3'],
      thresholds: ['threshold 1', 'threshold 2'],
    },
    title: 'Points',
    thresholds: [
      {
        y: 5,
        x: 2,
        color: 'ansiBlue',
      },
      {
        y: 2,
        color: 'ansiGreen',
      },
    ],
    points: [
      {
        y: 5,
        x: 5,
        color: 'ansiBlue',
      },
      {
        y: -1,
        x: 1,
        color: 'ansiCyan',
      },
      {
        y: 2,
        x: 2,
        color: 'ansiRed',
      },
    ],
  },
);
```

Expected Output:

```bash
Points
█ series 1     ▲             ┃
█ series 2    6┤━━━━━━━━━━━━┓┃
               │━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●
┃ threshold 1 4┤            ┃┃           ┏━━━━━━━━━━━━┓
┃ threshold 2  │            ┃┃           ┃            ┃
              2┤━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━
● point 1     1┤            ┃┃           ┃            ┗━
● point 2     0┤            ┃┃           ┏━━━━━━━━━━━━━━
● point 3      │●           ┃┃           ┃
             -2┤            ┃┃━━━━━━━━━━━┃
             -3┤            ┗┃━━━━━━━━━━━┛
               └┬────────────┬────────────┬────────────┬▶
                1            2            3            4
```

### Add Points Overlay

Input:

```typescript
plot(
  [
    [1, 1],
    [2, 4],
    [3, 4],
    [4, 2],
    [5, -1],
    [6, 3],
    [7, -1],
    [8, 9],
  ],
  {
    width: 40,
    title: 'Points',
    points: [
      {
        y: 5,
        x: 5,
        color: 'ansiBlue',
      },
      {
        y: -1,
        x: 1,
        color: 'ansiBlue',
      },
      {
        y: 205,
        x: 1005,
        color: 'ansiBlue',
      },
      {
        y: 2,
        x: 2,
        color: 'ansiRed',
      },
    ],
  },
);
```

Expected Output:

```bash
Points
  ▲
 9┤                                      ┏━
  │                                      ┃
  │                                      ┃
  │                                      ┃
  │                      ●               ┃
 4┤     ┏━━━━━━━━━━┓                     ┃
 3┤     ┃          ┃          ┏━━━━┓     ┃
 2┤     ┃●         ┗━━━━┓     ┃    ┃     ┃
 1┤━━━━━┛               ┃     ┃    ┃     ┃
  │                     ┃     ┃    ┃     ┃
-1┤●                    ┗━━━━━┛    ┗━━━━━┛
  └┬─────┬────┬─────┬────┬─────┬────┬─────┬▶
   1     2    3     4    5     6    7     8
```

### Multi-Series Plot

Input:

```typescript
plot(
  [
    [
      [0, 18],
      [1, 1],
      [2, 3],
      [3, 11],
      [4, 5],
      [5, 16],
      [6, 17],
      [7, 14],
      [8, 7],
      [9, 4],
    ],
    [
      [0, 0],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
      [5, 0],
      [6, 1],
      [7, 0],
      [8, 1],
      [9, 0],
    ],
  ],
  { width: 40, height: 10, color: ['ansiBlue', 'ansiGreen'] },
);
```

Expected Output:

```bash
   ▲
 17┤━━━━┓                           ┏━━━━┓
 16┤    ┃                     ┏━━━━━┛    ┃
 14┤    ┃                     ┃          ┗━━━━━┓
 11┤    ┃          ┏━━━━━┓    ┃                ┃
   │    ┃          ┃     ┃    ┃                ┃
  7┤    ┃          ┃     ┃    ┃                ┗━━━━┓
  5┤    ┃          ┃     ┗━━━━┛                     ┃
  4┤    ┃     ┏━━━━┛                                ┗━
  1┤    ┏━━━━━━━━━━━━━━━━━━━━━┓     ┏━━━━┓     ┏━━━━┓
  0┤━━━━┛                     ┗━━━━━┛    ┗━━━━━┛    ┗━
   └┬────┬─────┬────┬─────┬────┬─────┬────┬─────┬────┬▶
    0    1     2    3     4    5     6    7     8    9
```

### Plot with Custom Formatter

Input:

```typescript
plot(
  [
    [
      [0, -10],
      [1, 0.001],
      [2, 10],
      [3, 200],
      [4, 10000],
      [5, 2000000],
      [6, 50000000],
    ],
  ],
  {
    width: 30,
    height: 20,
    formatter: (n: number, { axis }: FormatterHelpers) => {
      const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      if (axis === 'y') return n;
      return labels[n] || 'X';
    },
  },
);
```

Expected Output:

```bash
         ▲
 50000000┤                            ┏━
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
         │                            ┃
  2000000┤                       ┏━━━━┛
      -10┤━━━━━━━━━━━━━━━━━━━━━━━┛
         └┬────┬────┬────┬───┬────┬────┬▶
          A    B    C    D   E    F    G
```

### Plot with Axis Center

Input:

```typescript
plot(
  [
    [
      [-8, -8],
      [-4, -4],
      [-3, -3],
      [-2, -2],
      [-1, -1],
      [0, 0],
      [2, 2],
      [3, 3],
      [4, 4],
      [8, 8],
    ],
  ],
  { width: 60, height: 20, axisCenter: [0, 0] },
);
```

Expected Output:

```bash
                                 ▲
                                8┤                           ┏━
                                 │                           ┃
                                 │                           ┃
                                 │                           ┃
                                 │                           ┃
                                4┤            ┏━━━━━━━━━━━━━━┛
                                3┤         ┏━━┛
                                2┤     ┏━━━┛
                                 │     ┃
  ┬──────────────┬──┬───┬───┬───0│─────────┬──┬──────────────┬─▶
 -8             -4 -3  -2  -1   0│     2   3  4              8
                            ┏━━-1┤
                        ┏━━━┛  -2┤
                    ┏━━━┛      -3┤
                 ┏━━┛          -4┤
                 ┃               │
                 ┃               │
                 ┃               │
                 ┃               │
   ━━━━━━━━━━━━━━┛             -8┤
                                 │
```

### Plot with Custom Symbols

Input:

```typescript
plot(
  [
    [1, 2],
    [2, 0],
    [3, 5],
    [4, 2],
    [5, -2],
    [6, 3],
  ],
  {
    symbols: {
      empty: 'x',
      background: '-',
      axis: {
        n: 'A',
        ns: 'i',
        y: 't',
        nse: 'o',
        x: 'j',
        we: 'm',
        e: 'B',
      },
      chart: {
        we: '1',
        wns: '2',
        ns: '3',
        nse: '4',
        wsn: '5',
        sne: '6',
      },
    },
    width: 40,
    height: 10,
  },
);
```

Expected Output:

```bash
xxA-----------------------------------------
x5t---------------61111112------------------
xxi---------------3------3------------------
xxi---------------3------3------------------
x3t---------------3------3---------------61-
x2t11111112-------3------411111112-------3--
xxi-------3-------3--------------3-------3--
x0t-------411111115--------------3-------3--
xxi------------------------------3-------3--
xxi------------------------------3-------3--
-2t------------------------------411111115--
xxojmmmmmmmjmmmmmmmjmmmmmmjmmmmmmmjmmmmmmmjB
xxx1xxxxxxx2xxxxxxx3xxxxxx4xxxxxxx5xxxxxxx6x
```

### Plot without Axes

Input:

```typescript
plot(
  [
    [-5, 2],
    [2, -3],
    [13, 0.1],
    [4, 2],
    [5, -2],
    [6, 12],
  ],
  {
    width: 40,
    height: 10,
    hideYAxis: true,
    hideXAxis: true,
  },
);
```

Expected Output:

```bash
                           ┏━━━━━━━━━━━━━━┓
                           ┃              ┃
                           ┃              ┃
                           ┃              ┃
                           ┃              ┃
                           ┃              ┃
    ━━━━━━━━━━━━━━┓    ┏━┓ ┃              ┃
                  ┃    ┃ ┃ ┃              ┗━
                  ┃    ┃ ┗━┛
                  ┗━━━━┛
```

### Plot with Large Numbers

Input:

```typescript
plot(
  [
    [-9000, 2000],
    [-8000, -3000],
    [-2000, -2000],
    [2000, 2000],
    [3000, 1500],
    [4000, 5000],
    [10000, 1400],
    [11000, 20000],
    [12000, 30000],
  ],
  {
    width: 60,
    height: 20,
  },
);
```

Expected Output:

```bash
      ▲
   30k┤                                                          ┏━
      │                                                          ┃
      │                                                          ┃
      │                                                          ┃
      │                                                          ┃
      │                                                          ┃
   20k┤                                                       ┏━━┛
      │                                                       ┃
      │                                                       ┃
      │                                                       ┃
      │                                                       ┃
      │                                                       ┃
      │                                                       ┃
      │                                                       ┃
    5k┤                                    ┏━━━━━━━━━━━━━━━┓  ┃
      │                                    ┃               ┃  ┃
  1.4k┤━━┓                           ┏━━━━━┛               ┗━━┛
      │  ┃                           ┃
   -2k┤  ┃                ┏━━━━━━━━━━┛
   -3k┤  ┗━━━━━━━━━━━━━━━━┛
      └┬──┬────────────────┬──────────┬──┬──┬───────────────┬──┬──┬▶
        -8k                          2k    4k                11k
     -9k                 -2k            3k                10k   12k
```

### Plot with Custom Line Formatter

Input:

```typescript
plot(
  [
    [1, 0],
    [2, 20],
    [3, 29],
    [4, 10],
    [5, 3],
    [6, 40],
    [7, 0],
    [8, 20],
  ],
  {
    height: 10,
    width: 30,
    lineFormatter: ({ y, plotX, plotY, input, index }) => {
      const output = [{ x: plotX, y: plotY, symbol: '█' }];

      if (input[index - 1]?.[1] < y) {
        return [...output, { x: plotX, y: plotY - 1, symbol: '▲' }];
      }

      return [...output, { x: plotX, y: plotY + 1, symbol: '▼' }];
    },
  },
);
```

Expected Output:

```bash
   ▲                     ▲
 40┤                     █
   │        ▲
 29┤        █
   │    ▲                        ▲
 20┤    █                        █
   │
   │
 10┤            █
  3┤            ▼    █
  0┤█                ▼       █
   └┬───┬───┬───┬────┬───┬───┬───┬▶
    1   2   3   4    5   6   7   8
```

### Bar Chart

Input:

```typescript
plot(
  [
    [0, 3],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, -2],
    [5, -5],
    [6, 2],
    [7, 0],
  ],
  {
    title: 'bar chart with axis',
    mode: 'bar',
    showTickLabel: true,
    width: 40,
    axisCenter: [0, 0],
  },
);
```

Expected Output:

```bash
bar chart with axis                         
  ▲                █                        
 4┤          █     █                        
 3┤     █    █     █               █        
 2┤     █    █     █               █        
 1┤     █    █     █               █     █  
 0┤─────┬────┬─────┬────┬─────┬────┬─────┬─▶
-1┤     1    2     3    4     5    6     7  
-2┤                           █             
-3┤                           █             
-4┤                           █             
-5┤                                         
  │                                         
```

### Horizontal Bar Chart

Input:

```typescript
plot(
  [
    [0, 3],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, -2],
    [5, -5],
    [6, 2],
    [7, 0],
  ],
  {
    mode: 'horizontalBar',
    showTickLabel: true,
    width: 40,
    height: 20,
    axisCenter: [3, 1],
  },
);
```

Expected Output:

```bash
                 ▲                        
                4┤                        
                 │                        
████████████████3┤                        
                 │                        
      ██████████2┤████████████████        
                 │                        
┬─────┬────┬────1┤────┬─────┬────┬─────┬─▶
0     1    2     3    4     5    6     7  
                0┤██████████████████████  
                 │                        
               -1┤                        
                 │                        
               -2┤                        
                 │█████                   
               -3┤                        
                 │                        
               -4┤                        
                 │                        
                 │                        
               -5┤███████████             
                 │                        
```

## Support

If this project helps you, consider supporting my open-source work:

[Buy me a coffee](https://buymeacoffee.com/gtktsc)
