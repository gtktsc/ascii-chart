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
};

Plot = (input: Input, settings?: Settings) => string;
```

# Examples

```
plot([[1, 1],[2, 4],[3, 4],[4, 2],[5, -1]], { width: 9, height: 6})

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
plot([[1, 1],[2, 4],[3, 4],[4, 2],[5, -1],[6, 3],[7, -1],[8, 9]], { width: 20, height: 8})

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
plot([[1, 1],[2, 4],[3, 40],[4, 2],[5, -1],[6, 3],[7, -1],[8, -1],[9, 9],[10, 9]], { width: 40, height: 10})

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
