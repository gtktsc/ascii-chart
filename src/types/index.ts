export type PlotCoords = [x: number, y: number][];
export type Plot = (coords: PlotCoords, plotWidth: number, plotHeight: number) => string;
