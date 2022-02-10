# Simple ascii chart

Simple TS package to draw ASCII charts. It operates on a two-dimensional input.
[Interactive demo.](https://simple-ascii-chart.vercel.app/)

# Usage

Package can be imported and used like:

```
import plot from 'simple-ascii-plot'

const graph = plot(input, settings);
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
formatter?: (number:number) => number;
```

Default formatter is:

```
Number(number.toFixed(3));
```

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
