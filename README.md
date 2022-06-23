# Simple ascii chart

Simple TS package to draw ASCII charts. It operates on a two-dimensional input.
[Interactive demo.](https://simple-ascii-chart.vercel.app/)

# Usage

Package can be imported and used like:

```
import plot from 'simple-ascii-plot'

const graph = plot(input, settings);
```

or

create a graph in [playground](https://simple-ascii-chart.vercel.app/)

or

hit the endpoint:

```
curl -d input='[[1,2],[2,3],[3,4]]' -G https://simple-ascii-chart.vercel.app/api
```

or

```
https://simple-ascii-chart.vercel.app/api?input=[[1,2],[2,3],[3,4]]&settings={%22width%22:50}
```

# Input

Input has to be a two dimensional array or array of arrays for series:

```
Point = [x: number, y: number];
SingleLine = Point[];
MultiLine = SingleLine[];

Input = SingleLine | MultiLine;
```

Therefore input for a single series is:

```
const input = [
    [1, 1],
    [2, 4],
    [3, 40],
  ]
```

Or for multi-series:

```
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
  ],
```

# Settings

Plot can be adjusted with a second parameter `settings`.

## color

Changes graph color. Possible values are:

```
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

```
color: ['ansiGreen', 'ansiRed']
```

## width

Changes default width of the graph, can be used to scale up/down values:

```
width?: number
```

## height

Changes default height of the graph, can be used to scale up/down values:

```
height?: number
```

## axisCenter

Changes center of the axis, by default it's placed in the bottom-left:

```
axisCenter?: [x:number, y:number]
```

## formatter

Transforms axis label:

```
formatter?: Formatter
```

Where

```
type FormatterHelpers = {
  axis: 'x' | 'y';
  xRange: number[];
  yRange: number[];
};

type Formatter = (number: number, helpers: FormatterHelpers) => number | string;

```

Default formatter is:

```
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

## lineFormatter

Transforms line, allows to format graph style. Callback takes arguments:

```
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

```
CustomSymbol = { x: number; y: number; symbol: string };
```

where `x` and `y` is also plot coordinate, `symbol` is char to be displayed. If an array is returned, more points can be placed on the graph.

```

lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
```

Check examples section for real world usage.

## hideXAxis

Hide X axis:

```
hideXAxis? boolean;
```

## hideYAxis

Hide Y axis:

```
hideYAxis? boolean;
```

## symbols

Overrides default symbols. Three independent sections are: `empty` - background, `axis` - symbols used to draw axis, `chart` - symbols used to draw graph.

```
symbols: {
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
    }
```

## Summary

```
Settings = {
  color?: Color | Color[];
  width?: number;
  height?: number;
  axisCenter?: [number, number];
  formatter?: (number:number) => number;
  lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  symbols?: {
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
      }
    }
};
```

# Examples

```
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

```
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
  { width: 20, height: 8 },
);

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

```
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

```
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

```
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
  )

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

```
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
  )

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

```
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
  )

--------------------------------------------
--A-----------------------------------------
-5t---------------61111112------------------
--i---------------3------3------------------
--i---------------3------3------------------
-3t---------------3------3---------------61-
-2t11111112-------3------411111112-------3--
--i-------3-------3--------------3-------3--
-0t-------411111115--------------3-------3--
--i------------------------------3-------3--
--i------------------------------3-------3--
-2t------------------------------411111115--
--ojmmmmmmmjmmmmmmmjmmmmmmjmmmmmmmjmmmmmmmjB
---1-------2-------3------4-------5-------6-
```

```
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
  )

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

```
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
    )

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

```
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
  )

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
