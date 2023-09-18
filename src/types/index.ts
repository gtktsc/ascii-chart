import { AXIS, CHART } from '../constants';

export type Point = [x: number, y: number];
export type SingleLine = Point[];
export type MultiLine = SingleLine[];

export type Coordinates = SingleLine | MultiLine;

export type Color = `ansi${
  | 'Red'
  | 'Green'
  | 'Black'
  | 'Yellow'
  | 'Blue'
  | 'Magenta'
  | 'Cyan'
  | 'White'}`;

export type LineFormatterArgs = {
  x: number;
  y: number;
  plotX: number;
  plotY: number;
  input: SingleLine;
  index: number;
};

export type CustomSymbol = { x: number; y: number; symbol: string };

export type FormatterHelpers = {
  axis: 'x' | 'y';
  xRange: number[];
  yRange: number[];
};

export type Formatter = (number: number, helpers: FormatterHelpers) => number | string;

export type Settings = {
  color?: Color | Color[];
  width?: number;
  height?: number;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  fillArea?: boolean;
  legend?: { position?: 'left' | 'right' | 'top' | 'bottom'; series: string | string[] };
  axisCenter?: Point;
  formatter?: Formatter;
  lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[];
  symbols?: {
    axis?: Partial<typeof AXIS>;
    chart?: Partial<typeof CHART>;
    empty?: string;
    background?: string;
    border?: string;
  };
};

export type Plot = (coordinates: Coordinates, settings?: Settings) => string;
