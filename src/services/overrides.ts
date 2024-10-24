import { CHART } from '../constants';
import { Colors, Formatter, Graph, Legend, MultiLine, Point, Symbols, Threshold } from '../types';
import { getPlotCoords, toArray, toEmpty, toPlot } from './coords';
import { defaultFormatter, getAnsiColor, getChartSymbols } from './settings';

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
  // add one line for the title
  graph.unshift(toEmpty(plotWidth + yShift + 2, backgroundSymbol)); // top
  Array.from(title).forEach((letter, index) => {
    graph[0][index] = letter;
  });
};

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

  // add one line for the xLabel
  graph.push(toEmpty(plotWidth + yShift + 2, backgroundSymbol)); // bottom
  Array.from(xLabel).forEach((letter, index) => {
    graph[graph.length - 1][startingPosition + index] = letter;
  });
};

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
  // add one line for the xLabel
  graph.forEach((line, position) => {
    line.unshift(backgroundSymbol); // left
    if (position > startingPosition && label[position - startingPosition - 1]) {
      graph[position][0] = label[position - startingPosition - 1];
    }
  });
};

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
  // calculate legend width as the longest label
  // adds 2 for one space and color indicator

  const series = Array.isArray(legend.series) ? legend.series : [legend.series];
  const legendWidth = 2 + series.reduce((acc, label) => Math.max(acc, toArray(label).length), 0);

  // prepare space for legend
  // and then place the legend
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
            // adds to fill space
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

export const addBorder = ({ graph, borderSymbol }: { graph: Graph; borderSymbol: string }) => {
  graph.forEach((line) => {
    line.unshift(borderSymbol); // left
    line.push(borderSymbol); // right
  });
  graph.unshift(toEmpty(graph[0].length, borderSymbol)); // top
  graph.push(toEmpty(graph[0].length, borderSymbol)); // bottom
};

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
      if (line[index] === emptySymbol) {
        // eslint-disable-next-line
        line[index] = backgroundSymbol;
      } else {
        break;
      }
    }
  });
};

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

  // add threshold line
  getPlotCoords(mappedThreshold, plotWidth, plotHeight, expansionX, expansionY).forEach(
    ([x, y], thresholdNumber) => {
      const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);

      // display x threshold only if it's in the graph
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
      // display y threshold only if it's in the graph
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

export const removeEmptyLines = ({
  graph,
  backgroundSymbol,
}: {
  graph: Graph;
  backgroundSymbol: string;
}) => {
  // clean up empty lines after shift
  // when there are occupied positions and shift is not needed
  // there might be empty lines at the bottom
  const elementsToRemove: number[] = [];
  graph.forEach((line, position) => {
    if (line.every((symbol) => symbol === backgroundSymbol)) {
      // collect empty line positions and remove them later
      elementsToRemove.push(position);
    }

    // remove empty lines from the beginning
    if (graph.every((currentLine) => currentLine[0] === backgroundSymbol)) {
      graph.forEach((currentLine) => currentLine.shift());
    }
  });

  // reverse to remove from the end, otherwise positions will be shifted
  elementsToRemove.reverse().forEach((position) => {
    graph.splice(position, 1);
  });
};

export const getTransformLabel = ({ formatter }: { formatter?: Formatter }) => {
  const transformLabel: Formatter = (value, helpers) => {
    if (formatter) {
      return formatter(value, helpers);
    }
    return defaultFormatter(value, helpers);
  };
  return transformLabel as Formatter;
};
