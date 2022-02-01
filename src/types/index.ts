export type PlotCoords = [x: number, y: number][];

export type PlotColor = `ansi${
  | 'Red'
  | 'Green'
  | 'Black'
  | 'Yellow'
  | 'Blue'
  | 'Magenta'
  | 'Cyan'
  | 'White'}`;

export type Settings = {
  color?: PlotColor;
  width?: number;
  height?: number;
};

export type Plot = (coords: PlotCoords, settings?: Settings) => string;
