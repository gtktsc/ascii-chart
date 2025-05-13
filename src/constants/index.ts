/**
 * Symbols for drawing the axes on the graph.
 */
export const AXIS = {
  n: '▲', // Symbol for the top end of the Y-axis
  ns: '│', // Vertical line for the Y-axis
  y: '┤', // Right tick mark on the Y-axis
  nse: '└', // Bottom corner for the Y-axis meeting the X-axis
  x: '┬', // Top tick mark on the X-axis
  we: '─', // Horizontal line for the X-axis
  e: '▶', // Arrow symbol for the end of the X-axis
};

/**
 * Symbols for rendering chart elements, including lines and areas.
 */
export const CHART = {
  we: '━', // Bold horizontal line in the chart
  wns: '┓', // Top-right corner for vertical-to-horizontal connection
  ns: '┃', // Bold vertical line in the chart
  nse: '┗', // Bottom-left corner for vertical-to-horizontal connection
  wsn: '┛', // Bottom-right corner for vertical-to-horizontal connection
  sne: '┏', // Top-left corner for vertical-to-horizontal connection
  area: '█', // Filled area symbol for chart representation
};

/**
 * Symbol representing an empty space on the graph.
 */
export const EMPTY = ' ';

/**
 * Symbols for drawing thresholds on the graph.
 */
export const THRESHOLDS = {
  x: '━', // Symbol for horizontal threshold line
  y: '┃', // Symbol for vertical threshold line
};

/**
 * Symbol for the point of the graph.
 */
export const POINT = '●';
