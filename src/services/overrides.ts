import { CHART } from '../constants';
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
} from '../types';
import { getPlotCoords, toArray, toEmpty, toPlot } from './coords';
import { defaultFormatter, getAnsiColor, getChartSymbols } from './settings';

/**
 * Adds a title to the graph at the top.
 * @param {object} options - Object containing title options.
 * @param {string} options.title - The title text.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - Background symbol for the graph.
 * @param {number} options.plotWidth - Width of the plot.
 * @param {number} options.yShift - Vertical shift for positioning.
 */
export const setTitle = ({
  title,
  graph,
  backgroundSymbol,
  plotWidth,
  yShift,
}: {
  title: string;
  graph: Graph;
  backgroundSymbol: string;
  plotWidth: number;
  yShift: number;
}) => {
  graph.unshift(toEmpty(plotWidth + yShift + 2, backgroundSymbol));
  Array.from(title).forEach((letter, index) => {
    graph[0][index] = letter;
  });
};

/**
 * Adds an x-axis label centered at the bottom of the graph.
 * @param {object} options - Object containing x-label options.
 * @param {string} options.xLabel - The x-axis label text.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - Background symbol for the graph.
 * @param {number} options.plotWidth - Width of the plot.
 * @param {number} options.yShift - Vertical shift for positioning.
 */
export const addXLable = ({
  graph,
  plotWidth,
  yShift,
  backgroundSymbol,
  xLabel,
}: {
  xLabel: string;
  graph: Graph;
  backgroundSymbol: string;
  plotWidth: number;
  yShift: number;
}) => {
  const totalWidth = graph[0].length;
  const labelLength = toArray(xLabel).length;
  const startingPosition = Math.round((totalWidth - labelLength) / 2);

  graph.push(toEmpty(plotWidth + yShift + 2, backgroundSymbol));
  Array.from(xLabel).forEach((letter, index) => {
    graph[graph.length - 1][startingPosition + index] = letter;
  });
};

/**
 * Adds a y-axis label centered on the left side of the graph.
 * @param {object} options - Object containing y-label options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.backgroundSymbol - Background symbol for the graph.
 * @param {string} options.yLabel - The y-axis label text.
 */
export const addYLabel = ({
  graph,
  backgroundSymbol,
  yLabel,
}: {
  graph: Graph;
  backgroundSymbol: string;
  yLabel: string;
}) => {
  const totalHeight = graph.length;
  const labelLength = toArray(yLabel).length;
  const startingPosition = Math.round((totalHeight - labelLength) / 2) - 1;

  const label = Array.from(yLabel);
  graph.forEach((line, position) => {
    line.unshift(backgroundSymbol);
    if (position > startingPosition && label[position - startingPosition - 1]) {
      graph[position][0] = label[position - startingPosition - 1];
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
 * @param {Colors} [options.color] - Color(s) for each series.
 * @param {Symbols} [options.symbols] - Custom symbols for the chart.
 * @param {boolean} [options.fillArea] - Whether to fill the area below the lines.
 */
export const addLegend = ({
  graph,
  legend,
  backgroundSymbol,
  color,
  symbols,
  fillArea,
  input,
}: {
  graph: Graph;
  legend: Legend;
  backgroundSymbol: string;
  input: MultiLine;
  color?: Colors;
  symbols?: Symbols;
  fillArea?: boolean;
}) => {
  const series = Array.isArray(legend.series) ? legend.series : [legend.series];
  const legendWidth = 2 + series.reduce((acc, label) => Math.max(acc, toArray(label).length), 0);

  for (let i = 0; i < legendWidth; i += 1) {
    graph.forEach((line, lineIndex) => {
      if (legend.position === 'left') {
        line.unshift(backgroundSymbol); // left

        series.forEach((label, index) => {
          if (lineIndex !== index) return;
          // get chart symbols for series
          const chartSymbols = getChartSymbols(color, index, symbols?.chart, input, fillArea);

          const reversedLabel = [
            chartSymbols.area,
            backgroundSymbol,
            ...Array.from(label),
            // add empty space to fill the legend on the left side
            ...Array(legendWidth - label.length - 2).fill(backgroundSymbol),
          ].reverse();
          if (reversedLabel[i]) {
            // eslint-disable-next-line no-param-reassign
            line[0] = reversedLabel[i];
          }
        });
      }
      if (legend.position === 'right') {
        line.push(backgroundSymbol);

        series.forEach((label, index) => {
          // get chart symbols for series

          const chartSymbols = getChartSymbols(color, index, symbols?.chart, input, fillArea);
          const newSymbol = [
            chartSymbols.area,
            backgroundSymbol,
            ...Array.from(label),
            ...Array(legendWidth - label.length - 2).fill(backgroundSymbol),
          ];
          if (lineIndex === index) {
            // eslint-disable-next-line no-param-reassign
            line[line.length - 1] = newSymbol[i];
          }
        });
      }
    });
  }

  if (legend.position === 'top') {
    series.reverse().forEach((label, index) => {
      graph.unshift(toEmpty(graph[0].length, backgroundSymbol)); // top

      // get chart symbols for series
      const chartSymbols = getChartSymbols(color, index, symbols?.chart, input, fillArea);
      const newSymbol = [chartSymbols.area, backgroundSymbol, ...Array.from(label)];

      graph[index].forEach((_, symbolIndex) => {
        if (newSymbol[symbolIndex]) {
          // eslint-disable-next-line no-param-reassign
          graph[0][symbolIndex] = newSymbol[symbolIndex];
        }
      });
    });
  }

  if (legend.position === 'bottom') {
    series.forEach((label, index) => {
      graph.push(toEmpty(graph[0].length, backgroundSymbol)); // bottom

      // get chart symbols for series
      const chartSymbols = getChartSymbols(color, index, symbols?.chart, input, fillArea);
      const newSymbol = [chartSymbols.area, backgroundSymbol, ...Array.from(label)];

      graph[index].forEach((_, symbolIndex) => {
        if (newSymbol[symbolIndex]) {
          // eslint-disable-next-line no-param-reassign
          graph[graph.length - 1][symbolIndex] = newSymbol[symbolIndex];
        }
      });
    });
  }
};

/**
 * Adds a border around the graph.
 * @param {object} options - Object containing border options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {string} options.borderSymbol - The symbol to use for the border.
 */
export const addBorder = ({ graph, borderSymbol }: { graph: Graph; borderSymbol: string }) => {
  graph.forEach((line) => {
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
 */
export const addBackgroundSymbol = ({
  graph,
  backgroundSymbol,
  emptySymbol,
}: {
  graph: Graph;
  backgroundSymbol: string;
  emptySymbol: string;
}) => {
  graph.forEach((line) => {
    for (let index = 0; index < line.length; index += 1) {
      if (line[index] === emptySymbol) line[index] = backgroundSymbol;
      else break;
    }
  });
};

/**
 * Adds threshold lines to the graph based on specified x or y values.
 * @param {object} options - Object containing threshold options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {Threshold[]} options.thresholds - Array of threshold objects with x, y, and color.
 * @param {object} options.axis - The axis configuration.
 * @param {number} options.plotWidth - Width of the plot.
 * @param {number} options.plotHeight - Height of the plot.
 * @param {number[]} options.expansionX - x-axis range for scaling.
 * @param {number[]} options.expansionY - y-axis range for scaling.
 */
export const addThresholds = ({
  graph,
  thresholds,
  axis,
  plotWidth,
  plotHeight,
  expansionX,
  expansionY,
}: {
  graph: Graph;
  thresholds: Threshold[];
  axis: { x: number; y: number };
  plotWidth: number;
  plotHeight: number;
  expansionX: number[];
  expansionY: number[];
}) => {
  const mappedThreshold = thresholds.map(({ x: thresholdX, y: thresholdY }) => {
    let { x, y } = axis;

    if (thresholdX) {
      x = thresholdX;
    }
    if (thresholdY) {
      y = thresholdY;
    }
    return [x, y] as Point;
  });

  getPlotCoords(mappedThreshold, plotWidth, plotHeight, expansionX, expansionY).forEach(
    ([x, y], thresholdNumber) => {
      const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);

      if (thresholds[thresholdNumber]?.x && graph[0][scaledX]) {
        graph.forEach((_, index) => {
          if (graph[index][scaledX]) {
            graph[index][scaledX] = thresholds[thresholdNumber]?.color
              ? `${getAnsiColor(thresholds[thresholdNumber]?.color || 'ansiRed')}${
                  CHART.ns
                }\u001b[0m`
              : CHART.ns;
          }
        });
      }
      if (thresholds[thresholdNumber]?.y && graph[scaledY]) {
        graph[scaledY].forEach((_, index) => {
          if (graph[scaledY][index]) {
            graph[scaledY][index] = thresholds[thresholdNumber]?.color
              ? `${getAnsiColor(thresholds[thresholdNumber]?.color || 'ansiRed')}${
                  CHART.we
                }\u001b[0m`
              : CHART.we;
          }
        });
      }
    },
  );
};

/**
 * Fills the area below chart symbols with the specified area symbol.
 * @param {object} options - Object containing fill options.
 * @param {Graph} options.graph - The graph array to modify.
 * @param {Symbols['chart']} options.chartSymbols - Chart symbols to use for filling.
 */
export const setFillArea = ({
  graph,
  chartSymbols,
}: {
  graph: Graph;
  chartSymbols: Symbols['chart'];
}) => {
  graph.forEach((xValues, yIndex) => {
    xValues.forEach((xSymbol, xIndex) => {
      if (
        xSymbol === chartSymbols?.nse ||
        xSymbol === chartSymbols?.wsn ||
        xSymbol === chartSymbols?.we ||
        xSymbol === chartSymbols?.area
      ) {
        if (graph[yIndex + 1]?.[xIndex]) {
          graph[yIndex + 1][xIndex] = chartSymbols.area || CHART.area;
        }
      }
    });
  });
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
