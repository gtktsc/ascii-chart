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
};

export type Plot = (
  coords: PlotCoords,
  plotWidth?: number,
  plotHeight?: number,
  settings?: Settings,
) => string;
