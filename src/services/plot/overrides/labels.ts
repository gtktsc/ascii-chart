import { Color, Graph } from '@types';
import { colorizeSymbol } from '@helpers/colors';
import { toArray, toEmpty } from '@helpers/coordinates';
import { toDisplayTokens } from '@helpers/terminal-text';
import { drawPosition } from '@services/plot/draw/position';

/**
 * Writes a centered title into the graph header.
 * @param {object} options - Structured options.
 * @param {string} options.title - The title.
 * @param {Graph} options.graph - The graph.
 * @param {string} options.backgroundSymbol - The background symbol.
 * @param {number} options.plotWidth - The plot width.
 * @param {number} options.yShift - The y shift.
 * @param {boolean} options.debugMode - The debug mode.
 * @param {Color} options.color - The color.
 */
export const setTitle = ({
  title,
  graph,
  backgroundSymbol,
  plotWidth,
  yShift,
  debugMode,
  color,
}: {
  title: string;
  graph: Graph;
  backgroundSymbol: string;
  plotWidth: number;
  yShift: number;
  debugMode?: boolean;
  color?: Color;
}): void => {
  const titleCells = toArray(title);
  const width = Math.max(plotWidth + yShift + 2, titleCells.length);
  graph.unshift(toEmpty(width, backgroundSymbol));
  for (let index = 0; index < titleCells.length; index++) {
    drawPosition({
      debugMode,
      graph,
      scaledX: index,
      scaledY: 0,
      symbol: colorizeSymbol(titleCells[index], color),
    });
  }
};

/**
 * Adds xlabel.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {number} options.plotWidth - The plot width.
 * @param {number} options.yShift - The y shift.
 * @param {string} options.backgroundSymbol - The background symbol.
 * @param {string} options.xLabel - The x label.
 * @param {boolean} options.debugMode - The debug mode.
 * @param {Color} options.color - The color.
 */
export const addXLabel = ({
  graph,
  plotWidth,
  yShift,
  backgroundSymbol,
  xLabel,
  debugMode,
  color,
}: {
  xLabel: string;
  graph: Graph;
  backgroundSymbol: string;
  plotWidth: number;
  yShift: number;
  debugMode?: boolean;
  color?: Color;
}): void => {
  const label = toArray(xLabel);
  const labelLength = label.length;
  const totalWidth = Math.max(
    plotWidth + yShift + 2,
    labelLength,
    ...graph.map((row) => row.length),
  );
  const startingPosition = Math.round((totalWidth - labelLength) / 2);

  graph.push(toEmpty(totalWidth, backgroundSymbol));
  for (let index = 0; index < label.length; index++) {
    drawPosition({
      debugMode,
      graph,
      scaledX: startingPosition + index,
      scaledY: graph.length - 1,
      symbol: colorizeSymbol(label[index], color),
    });
  }
};

/**
 * Adds ylabel.
 * @param {object} options - Structured options.
 * @param {Graph} options.graph - The graph.
 * @param {string} options.backgroundSymbol - The background symbol.
 * @param {string} options.yLabel - The y label.
 * @param {boolean} options.debugMode - The debug mode.
 * @param {Color} options.color - The color.
 */
export const addYLabel = ({
  graph,
  backgroundSymbol,
  yLabel,
  debugMode,
  color,
}: {
  graph: Graph;
  backgroundSymbol: string;
  yLabel: string;
  debugMode?: boolean;
  color?: Color;
}): void => {
  const totalHeight = graph.length;
  const label = toDisplayTokens(yLabel);
  const labelLength = label.length;
  const startingPosition = Math.round((totalHeight - labelLength) / 2) - 1;
  const labelWidth = Math.max(1, ...label.map((token) => token.width));

  graph.forEach((line, position) => {
    for (let column = 0; column < labelWidth; column++) line.unshift(backgroundSymbol);
    const token = label[position - startingPosition - 1];
    if (position > startingPosition && token) {
      drawPosition({
        debugMode,
        graph,
        scaledX: 0,
        scaledY: position,
        symbol: colorizeSymbol(token.text, color),
      });
      for (let column = 1; column < token.width; column++) {
        drawPosition({ debugMode, graph, scaledX: column, scaledY: position, symbol: '' });
      }
    }
  });
};
