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

export type Settings = {
  color?: Color | Color[];
  width?: number;
  height?: number;
};

export type Plot = (coordinates: Coordinates, settings?: Settings) => string;
