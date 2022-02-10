# Simple ascii chart

Simple TS package to draw ASCII charts. It operates on a two-dimensional input.
[Interactive demo.](https://simple-ascii-chart.vercel.app/)

# Usage

Package can be imported and used like:

```
import plot from 'simple-ascii-plot'

const graph = plot(input, settings);
```

Where:

```
Input = [x: number, y: number][];

Color =
  | 'ansiRed'
  | 'ansiGreen'
  | 'ansiBlack'
  | 'ansiYellow'
  | 'ansiBlue'
  | 'ansiMagenta'
  | 'ansiCyan'
  | 'ansiWhite'

Settings = {
  color?: Color;
  width?: number;
  height?: number;
  axisCenter?: [number, number];
  formatter?: (number:number) => number;
};

Plot = (input: Input, settings?: Settings) => string;
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
