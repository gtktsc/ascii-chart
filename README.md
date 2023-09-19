# Simple ascii chart

![NPM License](https://img.shields.io/npm/l/simple-ascii-chart)
![NPM Version](https://img.shields.io/npm/v/simple-ascii-chart)
![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/simple-ascii-chart)
![Codecov](https://img.shields.io/codecov/c/github/gtktsc/ascii-chart)

**Simple ASCII Chart** is a TypeScript package that allows you to create ASCII charts in your terminal. It operates on two-dimensional input data, supports multiple series, custom colors, and formatters to make your data visualization clear and customizable.

[Interactive demo.](https://simple-ascii-chart.vercel.app/)

With colored multiline:

![Example chart](https://user-images.githubusercontent.com/17948218/183446543-9a88e655-d83b-40f4-b7af-ffd8540380d2.png)

With colored area:

![Views per iteration](https://user-images.githubusercontent.com/17948218/183447293-4feac74f-b3d1-4e26-a8c1-02d793d3e81b.png)

With axis:

![Example chart with center position](https://user-images.githubusercontent.com/17948218/183447523-a0604d0c-eb22-451a-91c8-fb56eff039a7.png)

## Usage

Package can be imported via yarn (or npm):

```bash
yarn add simple-ascii-chart
```

And used like:

```typescript
import plot from 'simple-ascii-chart';

const graph = plot(input, settings);
```

## Playground

Alternatively, you can create a graph interactively in the [playground](https://simple-ascii-chart.vercel.app/).

## API Endpoint

You can also use the API endpoint to generate charts by sending a POST request with your input data:

```bash
curl -d input='[[1,2],[2,3],[3,4]]' -G https://simple-ascii-chart.vercel.app/api
```

or as a URL parameter:

```bash
https://simple-ascii-chart.vercel.app/api?input=[[1,2],[2,3],[3,4]]&settings={%22width%22:50}
```

## How to use it

When dependency is imported to project:

```typescript
import plot from 'simple-ascii-chart';

console.log(
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
  ),
);
```

And 🎉, chart appears in your terminal:

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

## Input

Input has to be a two dimensional array or array of arrays for series:

```typescript
Point = [x: number, y: number];
SingleLine = Point[];
MultiLine = SingleLine[];

Input = SingleLine | MultiLine;
```

Therefore input for a single series is:

```typescript
const input = [
  [1, 1],
  [2, 4],
  [3, 40],
];
```

Or for multi-series:

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

## Settings

Plot can be adjusted with a second parameter `settings`.

### color

Changes graph color. Possible values are:

```typescript
color?:
  | 'ansiRed'
  | 'ansiGreen'
  | 'ansiBlack'
  | 'ansiYellow'
  | 'ansiBlue'
  | 'ansiMagenta'
  | 'ansiCyan'
  | 'ansiWhite'
```

Can be used to distinguish series like:

```typescript
color: ['ansiGreen', 'ansiRed'];
```

### width

Changes default width of the graph, can be used to scale up/down values:

```typescript
width?: number
```

### height

Changes default height of the graph, can be used to scale up/down values:

```typescript
height?: number
```

### axisCenter

Changes center of the axis, by default it's placed in the bottom-left:

```typescript
axisCenter?: [x:number, y:number]
```

### formatter

Transforms axis label:

```typescript
formatter?: Formatter
```

Where

```typescript
type FormatterHelpers = {
  axis: 'x' | 'y';
  xRange: number[];
  yRange: number[];
};

type Formatter = (number: number, helpers: FormatterHelpers) => number | string;
```

Default formatter is:

```typescript
defaultFormatter: Formatter = (value, { xRange, yRange }) => {
  // Cut off small values
  if (Math.abs(xRange[0]) < 1000 || Math.abs(yRange[0]) < 1000) {
    return Number(value.toFixed(3));
  }
  // Adds XYZk to cut off large values
  if (Math.abs(value) > 1000) return `${value / 1000}k`;
  return value;
};
```

### lineFormatter

Transforms line, allows to format graph style. Callback takes arguments:

```typescript
LineFormatterArgs = {
  x: number;
  y: number;
  plotX: number;
  plotY: number;
  input: SingleLine;
  index: number;
};
```

`plotX` and `plotY` is coordinate of a point scaled to the plot. Callback has to return:

```typescript
CustomSymbol = { x: number; y: number; symbol: string };
```

where `x` and `y` is also plot coordinate, `symbol` is char to be displayed. If an array is returned, more points can be placed on the graph.

```typescript
lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
```

Check examples section for real world usage.

### title

Adds title above the graph:

```typescript
title?: string;
```

### xLabel

Adds label to the x axis:

```typescript
xLabe
l?: string;
```

### yLabel

Adds label to the y axis:

```typescript
yLabel?: string;
```

### thresholds

Adds thresholds to plot:

```typescript
thresholds?: {
    x?: number;
    y?: number;
    color?: Color;
  }[];
```

### fillArea

Some graphs look better presented as a area, not lines. In order to use area chart, pass fillArea prop:

```typescript
fillArea?: boolean;
```

### hideXAxis

Hide X axis:

```typescript
hideXAxis? boolean;
```

### hideYAxis

Hide Y axis:

```typescript
hideYAxis? boolean;
```

### symbols

Overrides default symbols. Three independent sections are: `empty` - background, `axis` - symbols used to draw axis, `chart` - symbols used to draw graph.

```typescript
symbols: {
  background: ' ',
  border: undefined,
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
    area: '█'
    }
```

## Summary

```typescript
Settings = {
  color?: Color | Color[];
  width?: number;
  height?: number;
  axisCenter?: [number, number];
  formatter?: (number:number) => number;
  lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
  hideXAxis?: boolean;
  legend?: { position?: 'left' | 'right' | 'top' | 'bottom'; series: string | string[] };
  title?: string;
  xLabel?: string;
  yLabel?: string;
  fillArea?: boolean;
  hideYAxis?: boolean;
  thresholds?: {
    x?: number;
    y?: number;
    color?: Color;
  }[];
  symbols?: {
    background?: ' ',
    border?: undefined,
    empty?: ' ',
    axis?: {
      n: '▲',
      ns: '│',
      y: '┤',
      nse: '└',
      x: '┬',
      we: '─',
      e: '▶',
    },
    chart?: {
      we: '━',
      wns: '┓',
      ns: '┃',
      nse: '┗',
      wsn: '┛',
      sne: '┏',
      area: '█',
      }
    }
};
```

## Examples

### Simple plot

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

Output:

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

### Plot with title and defined size

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

Output:

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

### Plot with axis labels

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

Output:

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

### Plot with colors

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

Output:

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

### Plot with borders

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

Output:

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

### Plot with filled area

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

Output:

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

### Scaled up plot

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

Output:

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

### Add thresholds

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

Output:

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

### Multi-series plot

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

Output:

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

### Plot with formatting applied

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

Output:

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

### Plot with axis center

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

Output:

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

## Plot with custom symbols

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
      empty: '-',
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

Output:

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

### Plot without axis

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

Output:

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

### Plot with with large numbers

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

Output:

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

### Plot with custom line format

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

Output:

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
