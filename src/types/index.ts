import { AXIS, CHART, THRESHOLDS } from '../constants';

/**
 * Represents a point with x and y coordinates.
 */
export type Point = [x: number, y: number];

/**
 * A point that may contain undefined values or be completely undefined.
 */
export type MaybePoint = Point | undefined | [number | undefined, number | undefined];

/**
 * A series of connected points representing a single line on a graph.
 */
export type SingleLine = Point[];

/**
 * A collection of single lines, used for plotting multiple lines on a graph.
 */
export type MultiLine = SingleLine[];

/**
 * Coordinates, which can be either a single line or multiple lines.
 */
export type Coordinates = SingleLine | MultiLine;

/**
 * Represents ANSI colors for styling output.
 */
export type Color = `ansi${
  | 'Red'
  | 'Green'
  | 'Black'
  | 'Yellow'
  | 'Blue'
  | 'Magenta'
  | 'Cyan'
  | 'White'}`;

/**
 * Arguments required for custom line formatting.
 */
export type LineFormatterArgs = {
  x: number; // x-coordinate of the point
  y: number; // y-coordinate of the point
  plotX: number; // x-coordinate on the plot
  plotY: number; // y-coordinate on the plot
  input: SingleLine; // line input containing points
  index: number; // index of the current point
  minY: number; // minimum y-value
  minX: number; // minimum y-value
  expansionX: number[]; // expansion values for x-axis
  expansionY: number[]; // expansion values for y-axis
  toPlotCoordinates: (x: number, y: number) => Point; // function to convert coordinates to plot coordinates
};

/**
 * Custom symbol with specified coordinates and symbol character.
 */
export type CustomSymbol = { x: number; y: number; symbol: string };

/**
 * Helpers for formatting, providing axis and range information.
 */
export type FormatterHelpers = {
  axis: 'x' | 'y'; // axis type ('x' or 'y')
  xRange: number[]; // range of x-values for scaling
  yRange: number[]; // range of y-values for scaling
};

/**
 * Symbols for customizing chart appearance, including axis, chart, and background symbols.
 */
export type Symbols = {
  axis?: Partial<typeof AXIS>; // Custom axis symbols
  chart?: Partial<typeof CHART>; // Custom chart symbols
  empty?: string; // Symbol representing empty space
  background?: string; // Symbol for background
  border?: string; // Symbol for border
  thresholds?: Partial<typeof THRESHOLDS>; // Custom threshold symbols
  point?: string; // Symbol for points
};

/**
 * Function type for formatting numbers on the chart.
 */
export type Formatter = (value: number, helpers: FormatterHelpers) => number | string;

/**
 * Configuration for the legend display on the chart.
 */
export type Legend = {
  position?: 'left' | 'right' | 'top' | 'bottom'; // Legend position
  series?: string | string[]; // Series labels in the legend
  points?: string | string[]; // Points labels in the legend
  thresholds?: string | string[]; // Thresholds labels in the legend
};

/**
 * Threshold definition with optional x, y coordinates and a color.
 */
export type Threshold = {
  x?: number; // x-coordinate threshold
  y?: number; // y-coordinate threshold
  color?: Color; // Color for threshold line or point
};

/**
 * Points definition with x, y coordinates and a color.
 */
export type GraphPoint = {
  x: number; // x-coordinate
  y: number; // y-coordinate
  color?: Color; // Color for point
};

/**
 * Function type for dynamically determining color based on series and coordinates.
 */
export type ColorGetter = (series: number, coordinates: MultiLine) => Color;

/**
 * Color options, which can be a single color, an array of colors, or a color getter function.
 */
export type Colors = Color | Color[] | ColorGetter;

/**
 * A 2D array representing the grid of symbols for the graph display.
 */
export type Graph = string[][];

/**
 * Graph mode options for rendering the graph.
 * 'line' mode connects points with lines.
 * 'point' mode displays points without connecting lines.
 * line is the default mode.
 */
export type GraphMode = 'line' | 'point' | 'bar' | 'horizontalBar';

/**
 * Configuration settings for rendering a plot.
 */
export type Settings = {
  color?: Colors; // Colors for the plot lines or areas
  width?: number; // Width of the plot
  height?: number; // Height of the plot
  yRange?: [number, number]; // Range of y-axis values
  showTickLabel?: boolean; // Option to show tick labels on the axis
  hideXAxis?: boolean; // Option to hide the x-axis
  hideYAxis?: boolean; // Option to hide the y-axis
  title?: string; // Title of the plot
  xLabel?: string; // Label for the x-axis
  yLabel?: string; // Label for the y-axis
  thresholds?: Threshold[]; // Array of threshold lines
  points?: GraphPoint[]; // Array of points to plot
  fillArea?: boolean; // Option to fill the area under lines
  legend?: Legend; // Legend settings
  axisCenter?: MaybePoint; // Center point for axes alignment
  formatter?: Formatter; // Custom formatter for axis values
  lineFormatter?: (args: LineFormatterArgs) => CustomSymbol | CustomSymbol[]; // Custom line formatter
  symbols?: Symbols; // Custom symbols for chart elements
  mode?: GraphMode; // Option to enable debug mode
  debugMode?: boolean; // Option to enable debug mode
};

/**
 * Plot function type that takes coordinates and settings to generate a graph output.
 */
export type Plot = (coordinates: Coordinates, settings?: Settings) => string;
