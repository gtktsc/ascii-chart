import { CHART } from '@constants';
import { Color, Graph, Symbols } from '@types';
import { colorizeSymbol } from '@helpers/colors';
import { toEmpty } from '@helpers/coordinates';
import { drawPosition } from '@services/plot/draw/position';

/**
 * Adds border.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {string} options.borderSymbol - The border symbol.
 * @param {string} options.backgroundSymbol - The background symbol.
 * @param {Color} options.color - The color.
 */
export const addBorder = ({
  graph,
  borderSymbol,
  backgroundSymbol,
  color,
}: {
  graph: Graph;
  borderSymbol: string;
  backgroundSymbol: string;
  color?: Color;
}): void => {
  const styledBorderSymbol = colorizeSymbol(borderSymbol, color);
  const maxLength = Math.max(...graph.map((line) => line.length));
  graph.forEach((line) => {
    while (line.length < maxLength) line.push(backgroundSymbol);
    line.unshift(styledBorderSymbol);
    line.push(styledBorderSymbol);
  });
  graph.unshift(toEmpty(graph[0].length, styledBorderSymbol));
  graph.push(toEmpty(graph[0].length, styledBorderSymbol));
};

/**
 * Applies color to background.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {string} options.backgroundSymbol - The background symbol.
 * @param {Color} options.color - The color.
 */
export const colorBackground = ({
  graph,
  backgroundSymbol,
  color,
}: {
  graph: Graph;
  backgroundSymbol: string;
  color?: Color;
}): void => {
  if (!color) return;
  const styledBackgroundSymbol = colorizeSymbol(backgroundSymbol, color);
  graph.forEach((row) => {
    row.forEach((symbol, column) => {
      if (symbol === backgroundSymbol) row[column] = styledBackgroundSymbol;
    });
  });
};

/**
 * Adds background symbol.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {string} options.backgroundSymbol - The background symbol.
 * @param {string} options.emptySymbol - The empty symbol.
 * @param {boolean} options.debugMode - The debug mode.
 */
export const addBackgroundSymbol = ({
  graph,
  backgroundSymbol,
  emptySymbol,
  debugMode,
}: {
  graph: Graph;
  backgroundSymbol: string;
  emptySymbol: string;
  debugMode?: boolean;
}): void => {
  graph.forEach((line, row) => {
    for (let column = 0; column < line.length; column += 1) {
      if (line[column] !== emptySymbol) break;
      drawPosition({
        debugMode,
        graph,
        scaledX: column,
        scaledY: row,
        symbol: backgroundSymbol,
      });
    }
  });
};

/**
 * Fills cells between a rendered series and its selected axis baseline.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {Symbols['chart']} options.chartSymbols - The chart symbols.
 * @param {{ x: number; y: number }} options.axis - The axis.
 * @param {'x' | 'y'} options.fillAxis - The fill axis.
 * @param {boolean} options.debugMode - The debug mode.
 */
export const setFillArea = ({
  graph,
  chartSymbols,
  axis,
  fillAxis,
  debugMode,
}: {
  graph: Graph;
  chartSymbols: Symbols['chart'];
  axis: { x: number; y: number };
  fillAxis: 'x' | 'y';
  debugMode?: boolean;
}): void => {
  const resolvedChartSymbols = { ...CHART, ...chartSymbols };
  const areaSymbol = resolvedChartSymbols.area;
  const lineSymbols = new Set(Object.values(resolvedChartSymbols));
  const lineCells: Array<{ x: number; y: number }> = [];

  graph.forEach((row, y) =>
    row.forEach((symbol, x) => {
      if (lineSymbols.has(symbol)) lineCells.push({ x, y });
    }),
  );

  const lineCellKeys = new Set(lineCells.map(({ x, y }) => `${x}:${y}`));
  const fillPosition = (x: number, y: number) => {
    if (lineCellKeys.has(`${x}:${y}`)) return;
    drawPosition({ debugMode, graph, scaledX: x, scaledY: y, symbol: areaSymbol });
  };

  lineCells.forEach(({ x, y }) => {
    if (fillAxis === 'x') {
      const axisY = Math.max(0, Math.min(graph.length - 1, axis.y));
      const start = Math.min(y, axisY);
      const end = Math.max(y, axisY);
      for (let fillY = start; fillY <= end; fillY++) fillPosition(x, fillY);
      return;
    }

    const axisX = Math.max(0, Math.min(graph[y].length - 1, axis.x));
    const start = Math.min(x, axisX);
    const end = Math.max(x, axisX);
    for (let fillX = start; fillX <= end; fillX++) fillPosition(fillX, y);
  });
};

/**
 * Removes empty lines.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {string} options.backgroundSymbol - The background symbol.
 */
export const removeEmptyLines = ({
  graph,
  backgroundSymbol,
}: {
  graph: Graph;
  backgroundSymbol: string;
}): void => {
  const rowsToRemove: number[] = [];
  graph.forEach((line, position) => {
    if (line.every((symbol) => symbol === backgroundSymbol)) rowsToRemove.push(position);
    if (graph.every((currentLine) => currentLine[0] === backgroundSymbol)) {
      graph.forEach((currentLine) => currentLine.shift());
    }
  });
  rowsToRemove.reverse().forEach((position) => graph.splice(position, 1));
};
