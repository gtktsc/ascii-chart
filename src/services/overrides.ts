import { CHART, THRESHOLDS } from '../constants';
import {
  Colors,
  Formatter,
  Graph,
  Legend,
  MultiLine,
  Point,
  Symbols,
  Threshold,
  FormatterHelpers,
  GraphPoint,
} from '../types';
import { getPlotCoords, toArray, toEmpty, toPlot, normalize } from './coords';
import { drawPosition } from './draw';
import { defaultFormatter, getAnsiColor, getChartSymbols } from './settings';

/**
 * Adds a title to the graph at the top.
 * @param {object} options - Object containing title options.
 * @param {string} options.title - The title text.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - Background symbol for the graph.
 * @param {number} options.plotWidth - Width of the plot.
 * @param {number} options.yShift - Vertical shift for positioning.
 * @param {boolean} [options.debugMode=false] - If true, logs errors for out-of-bounds access.
 */
export const setTitle = ({
  title,
  graph,
  backgroundSymbol,
  plotWidth,
  yShift,
  debugMode,
}: {
  title: string;
  graph: Graph;
  backgroundSymbol: string;
  plotWidth: number;
  yShift: number;
  debugMode?: boolean;
}) => {
  graph.unshift(toEmpty(plotWidth + yShift + 2, backgroundSymbol));
  for (let index = 0; index < title.length; index++) {
    const letter = title[index];
    drawPosition({
      debugMode,
      graph,
      scaledX: index,
      scaledY: 0,
      symbol: letter,
    });
  }
};

/**
 * Adds an x-axis label centered at the bottom of the graph.
 * @param {object} options - Object containing x-label options.
 * @param {string} options.xLabel - The x-axis label text.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - Background symbol for the graph.
 * @param {number} options.plotWidth - Width of the plot.
 * @param {number} options.yShift - Vertical shift for positioning.
 * @param {boolean} [options.debugMode=false] - If true, logs errors for out-of-bounds access.
 */
export const addXLabel = ({
  graph,
  plotWidth,
  yShift,
  backgroundSymbol,
  xLabel,
  debugMode,
}: {
  xLabel: string;
  graph: Graph;
  backgroundSymbol: string;
  plotWidth: number;
  yShift: number;
  debugMode?: boolean;
}) => {
  const totalWidth = graph[0].length;
  const labelLength = toArray(xLabel).length;
  const startingPosition = Math.round((totalWidth - labelLength) / 2);

  graph.push(toEmpty(plotWidth + yShift + 2, backgroundSymbol));
  for (let index = 0; index < xLabel.length; index++) {
    const letter = xLabel[index];
    drawPosition({
      debugMode,
      graph,
      scaledX: startingPosition + index,
      scaledY: graph.length - 1,
      symbol: letter,
    });
  }
};

/**
 * Adds a y-axis label centered on the left side of the graph.
 * @param {object} options - Object containing y-label options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - Background symbol for the graph.
 * @param {string} options.yLabel - The y-axis label text.
 * @param {boolean} [options.debugMode=false] - If true, logs errors for out-of-bounds access.
 */
export const addYLabel = ({
  graph,
  backgroundSymbol,
  yLabel,
  debugMode,
}: {
  graph: Graph;
  backgroundSymbol: string;
  yLabel: string;
  debugMode?: boolean;
}) => {
  const totalHeight = graph.length;
  const labelLength = toArray(yLabel).length;
  const startingPosition = Math.round((totalHeight - labelLength) / 2) - 1;

  const label = Array.from(yLabel);
  graph.forEach((line, position) => {
    line.unshift(backgroundSymbol);
    if (position > startingPosition && label[position - startingPosition - 1]) {
      drawPosition({
        debugMode,
        graph,
        scaledX: 0,
        scaledY: position,
        symbol: label[position - startingPosition - 1],
      });
    }
  });
};

/**
 * Adds a legend to the specified position on the graph (top, bottom, left, or right).
 * @param {object} options - Object containing legend options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {Legend} options.legend - Configuration for the legend's position and series.
 * @param {string} options.backgroundSymbol - Background symbol for the graph.
 * @param {MultiLine} options.input - Input data series for the chart.
 * @param {string} options.pointSymbol - Symbol used to draw points.
 * @param {GraphPoint[]} [options.points] - Points to render, with optional colors.
 * @param {Threshold[]} [options.thresholds] - Thresholds for the plot.
 * @param {Colors} [options.color] - Color(s) for each series.
 * @param {Symbols} [options.symbols] - Custom symbols for the chart.
 * @param {boolean} [options.fillArea] - Whether to fill the area below the lines.
 * @param {boolean} [options.debugMode=false] - If true, logs errors for out-of-bounds access.
 */
export const addLegend = ({
  graph,
  legend,
  backgroundSymbol,
  color,
  symbols,
  fillArea,
  input,
  pointSymbol,
  debugMode,
  points,
  thresholds,
}: {
  graph: Graph;
  legend: Legend;
  backgroundSymbol: string;
  input: MultiLine;
  color?: Colors;
  pointSymbol: string;
  symbols?: Symbols;
  fillArea?: boolean;
  debugMode?: boolean;
  points?: GraphPoint[];
  thresholds?: Threshold[];
}) => {
  // Process legend data directly without using getLegendData to avoid trimming
  // This preserves all legend items regardless of input data length
  const legendSeries = legend.series ? normalize(legend.series) : [];
  const legendPoints = legend.points ? normalize(legend.points) : [];
  const legendThresholds = legend.thresholds ? normalize(legend.thresholds) : [];

  const allLabels = [
    ...legendSeries.map((label: string, i: number) => ({
      type: 'series' as const,
      label,
      index: i,
    })),
    ...(legendThresholds.length > 0 ? [{ type: 'spacer' as const }] : []),
    ...legendThresholds.map((label: string, i: number) => ({
      type: 'threshold' as const,
      label,
      index: i,
    })),
    ...(legendPoints.length > 0 ? [{ type: 'spacer' as const }] : []),
    ...legendPoints.map((label: string, i: number) => ({
      type: 'point' as const,
      label,
      index: i,
    })),
  ];

  const legendWidth =
    2 +
    Math.max(
      ...allLabels.map((entry) => {
        if (entry.type === 'spacer') return 0;
        return toArray(entry.label).length;
      }),
    );

  const makePointSymbol = (index: number) =>
    points && points[index]?.color
      ? `${getAnsiColor(points[index].color)}${pointSymbol}\u001b[0m`
      : pointSymbol;

  const makeThresholdSymbol = (index: number) =>
    thresholds && thresholds[index]?.color
      ? `${getAnsiColor(thresholds[index].color)}┃\u001b[0m`
      : '┃';

  const makeLabelRow = (entry: (typeof allLabels)[number]) => {
    if (entry.type === 'spacer') return Array(legendWidth).fill(backgroundSymbol);

    const { label } = entry;
    const labelText = toArray(label);
    const pad = legendWidth - labelText.length - 2;
    const padArr = Array(pad).fill(backgroundSymbol);

    let symbol: string;
    if (entry.type === 'point') symbol = makePointSymbol(entry.index);
    else if (entry.type === 'threshold') symbol = makeThresholdSymbol(entry.index);
    else symbol = getChartSymbols(color, entry.index, symbols?.chart, input, fillArea).area;

    return [symbol, backgroundSymbol, ...labelText, ...padArr];
  };

  if (legend.position === 'left') {
    const newRows = allLabels.map(makeLabelRow);
    for (let i = 0; i < graph.length; i++) {
      const label = newRows[i];
      if (label) {
        for (let j = legendWidth - 1; j >= 0; j--) {
          graph[i].unshift(label[j]);
        }
      } else {
        for (let j = 0; j < legendWidth; j++) {
          graph[i].unshift(backgroundSymbol);
        }
      }
    }
  }

  if (legend.position === 'right') {
    // Pre-pad each row with empty space on the right so chart rendering doesn't overwrite legend
    for (let row of graph) {
      for (let i = 0; i < legendWidth + 2; i++) {
        row.push(backgroundSymbol);
      }
    }

    const newRows = allLabels.map(makeLabelRow);
    for (let i = 0; i < graph.length; i++) {
      const label = newRows[i];
      if (label) {
        for (let j = 0; j < legendWidth; j++) {
          const columnIndex = graph[i].length - legendWidth + j;
          graph[i][columnIndex] = label[j];
        }
      }
    }
  }

  if (legend.position === 'top') {
    allLabels;
    const reversedEntries = allLabels.slice().reverse();

    for (let entryIndex = 0; entryIndex < reversedEntries.length; entryIndex++) {
      const entry = reversedEntries[entryIndex];
      const line = makeLabelRow(entry);
      const row = toEmpty(graph[0].length, backgroundSymbol);
      graph.unshift(row);

      for (let i = 0; i < line.length; i++) {
        const symbol = line[i];
        drawPosition({
          debugMode,
          graph,
          scaledX: i,
          scaledY: 0,
          symbol,
        });
      }
    }
  }

  if (legend.position === 'bottom' || !legend.position) {
    for (let entryIndex = 0; entryIndex < allLabels.length; entryIndex++) {
      const entry = allLabels[entryIndex];
      const line = makeLabelRow(entry);
      graph.push(toEmpty(graph[0].length, backgroundSymbol));
      const y = graph.length - 1;
      for (let i = 0; i < line.length; i++) {
        const symbol = line[i];
        drawPosition({
          debugMode,
          graph,
          scaledX: i,
          scaledY: y,
          symbol,
        });
      }
    }
  }
};

/**
 * Adds a border around the graph.
 * @param {object} options - Object containing border options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - The symbol to use for the background.
 * @param {string} options.borderSymbol - The symbol to use for the border.
 */
export const addBorder = ({
  graph,
  borderSymbol,
  backgroundSymbol,
}: {
  graph: Graph;
  borderSymbol: string;
  backgroundSymbol: string;
}) => {
  const maxLength = Math.max(...graph.map((line) => line.length));
  graph.forEach((line) => {
    while (line.length < maxLength) line.push(backgroundSymbol);
    line.unshift(borderSymbol);
    line.push(borderSymbol);
  });
  graph.unshift(toEmpty(graph[0].length, borderSymbol));
  graph.push(toEmpty(graph[0].length, borderSymbol));
};

/**
 * Fills the background of empty cells in the graph with a specified symbol.
 * @param {object} options - Object containing background fill options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - Symbol to fill empty cells with.
 * @param {string} options.emptySymbol - Symbol representing empty cells.
 * @param {boolean} [options.debugMode=false] - If true, logs errors for out-of-bounds access.
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
}) => {
  graph.forEach((line, curr) => {
    for (let index = 0; index < line.length; index += 1) {
      if (line[index] === emptySymbol) {
        drawPosition({
          debugMode,
          graph,
          scaledX: index,
          scaledY: curr,
          symbol: backgroundSymbol,
        });
      } else break;
    }
  });
};

/**
 * Adds points to the graph at specified (x, y) coordinates.
 *
 * @param {object} options - Configuration options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {GraphPoint[]} options.points - Points to render, with optional colors.
 * @param {number} options.plotWidth - Width of the plot.
 * @param {number} options.plotHeight - Height of the plot.
 * @param {number[]} options.expansionX - Range of x-values for scaling.
 * @param {number[]} options.expansionY - Range of y-values for scaling.
 * @param {string} options.pointSymbol - Symbol used to draw the point.
 * @param {boolean} [options.debugMode] - Enables debug logging.
 */
export const addPoints = ({
  graph,
  points,
  plotWidth,
  plotHeight,
  expansionX,
  expansionY,
  pointSymbol,
  debugMode,
}: {
  graph: Graph;
  points: GraphPoint[];
  plotWidth: number;
  plotHeight: number;
  expansionX: number[];
  expansionY: number[];
  pointSymbol: string;
  debugMode?: boolean;
}) => {
  const mappedPoints = points.map(({ x, y }) => [x, y] as Point);

  const plotCoords = getPlotCoords(mappedPoints, plotWidth, plotHeight, expansionX, expansionY);
  for (let pointNumber = 0; pointNumber < plotCoords.length; pointNumber++) {
    const [x, y] = plotCoords[pointNumber];
    const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);
    const pointColor = points[pointNumber]?.color;

    drawPosition({
      debugMode,
      graph,
      scaledX: scaledX + 1,
      scaledY: scaledY + 1,
      symbol: pointColor ? `${getAnsiColor(pointColor)}${pointSymbol}\u001b[0m` : pointSymbol,
    });
  }
};

/**
 * Draws threshold lines on the graph at specified x and/or y coordinates.
 *
 * @param {object} options - Configuration object for threshold rendering.
 * @param {Graph} options.graph - The 2D graph matrix to modify.
 * @param {Threshold[]} options.thresholds - List of threshold definitions with x, y, and optional color.
 * @param {object} options.axis - Axis configuration defining origin point.
 * @param {number} options.axis.x - X-position of the Y-axis on the graph.
 * @param {number} options.axis.y - Y-position of the X-axis on the graph.
 * @param {number} options.plotWidth - Width of the plot area in characters.
 * @param {number} options.plotHeight - Height of the plot area in characters.
 * @param {number[]} options.expansionX - Original data range for the X-axis, used for scaling.
 * @param {number[]} options.expansionY - Original data range for the Y-axis, used for scaling.
 * @param {typeof THRESHOLDS} options.thresholdSymbols - Symbols used to draw horizontal and vertical threshold lines.
 * @param {boolean} [options.debugMode=false] - Enables debug logging for invalid coordinates or out-of-bounds access.
 */
export const addThresholds = ({
  graph,
  thresholds,
  axis,
  plotWidth,
  plotHeight,
  expansionX,
  expansionY,
  thresholdSymbols,
  debugMode,
}: {
  graph: Graph;
  thresholds: Threshold[];
  axis: { x: number; y: number };
  plotWidth: number;
  plotHeight: number;
  expansionX: number[];
  expansionY: number[];
  thresholdSymbols: typeof THRESHOLDS;
  debugMode?: boolean;
}) => {
  const mappedThreshold = thresholds.map(({ x: thresholdX, y: thresholdY }) => {
    let { x, y } = axis;

    if (typeof thresholdX === 'number') {
      x = thresholdX;
    }
    if (typeof thresholdY === 'number') {
      y = thresholdY;
    }
    return [x, y] as Point;
  });

  const plotCoords = getPlotCoords(mappedThreshold, plotWidth, plotHeight, expansionX, expansionY);
  for (let thresholdNumber = 0; thresholdNumber < plotCoords.length; thresholdNumber++) {
    const [x, y] = plotCoords[thresholdNumber];
    const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);

    const hasThresholdX = typeof thresholds[thresholdNumber]?.x === 'number';
    const hasThresholdY = typeof thresholds[thresholdNumber]?.y === 'number';
    const thresholdColor = thresholds[thresholdNumber]?.color;

    if (hasThresholdX && graph[0][scaledX]) {
      for (let index = 0; index < graph.length; index++) {
        if (graph[index][scaledX]) {
          drawPosition({
            debugMode,
            graph,
            scaledX: scaledX + 1,
            scaledY: index,
            symbol: thresholdColor
              ? `${getAnsiColor(thresholdColor)}${thresholdSymbols.y}\u001b[0m`
              : thresholdSymbols.y,
          });
        }
      }
    }
    if (hasThresholdY && graph[scaledY]) {
      for (let index = 0; index < graph[scaledY].length; index++) {
        if (graph[scaledY][index]) {
          drawPosition({
            debugMode,
            graph,
            scaledX: index,
            scaledY: scaledY + 1,
            symbol: thresholdColor
              ? `${getAnsiColor(thresholdColor)}${thresholdSymbols.x}\u001b[0m`
              : thresholdSymbols.x,
          });
        }
      }
    }
  }
};

/**
 * Fills the area below chart symbols with the specified area symbol.
 * @param {object} options - Object containing fill options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {Symbols['chart']} options.chartSymbols - Chart symbols to use for filling.
 * @param {boolean} [options.debugMode=false] - If true, logs errors for out-of-bounds access.
 */
export const setFillArea = ({
  graph,
  chartSymbols,
  debugMode,
}: {
  graph: Graph;
  chartSymbols: Symbols['chart'];
  debugMode?: boolean;
}) => {
  for (let yIndex = 0; yIndex < graph.length; yIndex++) {
    const xValues = graph[yIndex];
    for (let xIndex = 0; xIndex < xValues.length; xIndex++) {
      const xSymbol = xValues[xIndex];
      let areaSymbol = chartSymbols?.area || CHART.area;
      if (
        xSymbol === chartSymbols?.nse ||
        xSymbol === chartSymbols?.wsn ||
        xSymbol === chartSymbols?.we ||
        xSymbol === areaSymbol
      ) {
        if (graph[yIndex + 1]?.[xIndex]) {
          drawPosition({
            debugMode,
            graph,
            scaledX: xIndex,
            scaledY: yIndex + 1,
            symbol: areaSymbol,
          });
        }
      }
    }
  }
};

/**
 * Removes any completely empty lines from the graph.
 * @param {object} options - Object containing empty line removal options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - Background symbol for identifying empty lines.
 */
export const removeEmptyLines = ({
  graph,
  backgroundSymbol,
}: {
  graph: Graph;
  backgroundSymbol: string;
}) => {
  const elementsToRemove: number[] = [];
  graph.forEach((line, position) => {
    if (line.every((symbol) => symbol === backgroundSymbol)) {
      elementsToRemove.push(position);
    }

    if (graph.every((currentLine) => currentLine[0] === backgroundSymbol)) {
      graph.forEach((currentLine) => currentLine.shift());
    }
  });

  elementsToRemove.reverse().forEach((position) => {
    graph.splice(position, 1);
  });
};

/**
 * Returns a label transformation function using the specified formatter.
 * @param {object} options - Object containing formatter options.
 * @param {Formatter} [options.formatter] - Formatter function to apply to labels.
 * @returns {Formatter} - A formatter function for transforming labels.
 */
export const getTransformLabel =
  ({ formatter }: { formatter?: Formatter }) =>
  (value: number, helpers: FormatterHelpers) =>
    formatter ? formatter(value, helpers) : defaultFormatter(value, helpers);
