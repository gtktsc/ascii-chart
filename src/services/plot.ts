import {
  getPlotCoords,
  toArrays,
  getMax,
  getMin,
  toArray,
  toPlot,
  toSorted,
  distance,
  toEmpty,
  getAxisCenter,
} from './coords';
import { getChartSymbols, defaultFormatter } from './settings';
import { SingleLine, MultiLine, Plot, CustomSymbol, Formatter } from '../types';
import { AXIS, CHART, EMPTY } from '../constants';

export const plot: Plot = (
  rawInput,
  {
    color,
    width,
    height,
    axisCenter,
    formatter,
    lineFormatter,
    symbols,
    title,
    fillArea,
    hideXAxis,
    hideYAxis,
    xLabel,
    yLabel,
    legend,
  } = {},
) => {
  // Multiline
  let input = rawInput as MultiLine;

  // Singleline
  if (typeof input[0]?.[0] === 'number') {
    input = [rawInput] as MultiLine;
  }

  // Empty
  if (input.length === 0) {
    return '';
  }

  const transformLabel: Formatter = (value, helpers) => {
    if (formatter) {
      return formatter(value, helpers);
    }
    return defaultFormatter(value, helpers);
  };

  let scaledCoords = [[0, 0]];

  const [rangeX, rangeY] = toArrays(input);

  const minX = getMin(rangeX);
  const maxX = getMax(rangeX);
  const minY = getMin(rangeY);
  const maxY = getMax(rangeY);

  const expansionX = [minX, maxX];
  const expansionY = [minY, maxY];

  // set default size
  const plotWidth = width || rangeX.length;

  let plotHeight = Math.round(height || maxY - minY + 1);

  // for small values without height
  if (!height && plotHeight < 3) {
    plotHeight = rangeY.length;
  }

  const axisSymbols = { ...AXIS, ...symbols?.axis };
  const emptySymbol = symbols?.empty || EMPTY;
  const backgroundSymbol = symbols?.background || emptySymbol;
  const borderSymbol = symbols?.border;

  // create placeholder
  const callback = () => toEmpty(plotWidth + 2, emptySymbol);
  const graph = Array.from({ length: plotHeight + 2 }, callback);
  const axis = getAxisCenter(axisCenter, plotWidth, plotHeight, expansionX, expansionY, [
    0,
    graph.length - 1,
  ]);

  // get default chart symbols
  input.forEach((coords: SingleLine, series) => {
    // override default chart symbols with colored ones
    const chartSymbols = getChartSymbols(color, series, symbols?.chart, fillArea);

    // sort input by the first value
    const sortedCoords = toSorted(coords);

    scaledCoords = getPlotCoords(sortedCoords, plotWidth, plotHeight, expansionX, expansionY).map(
      ([x, y], index, arr) => {
        const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);

        if (!lineFormatter) {
          if (index - 1 >= 0) {
            const [prevX, prevY] = arr[index - 1];
            const [currX, currY] = arr[index];

            Array(distance(currY, prevY))
              .fill('')
              .forEach((_, steps, array) => {
                if (Math.round(prevY) > Math.round(currY)) {
                  graph[scaledY + 1][scaledX] = chartSymbols.nse;
                  if (steps === array.length - 1) {
                    graph[scaledY - steps][scaledX] = chartSymbols.wns;
                  } else {
                    graph[scaledY - steps][scaledX] = chartSymbols.ns;
                  }
                } else {
                  graph[scaledY + steps + 2][scaledX] = chartSymbols.wsn;
                  graph[scaledY + steps + 1][scaledX] = chartSymbols.ns;
                }
              });

            if (Math.round(prevY) < Math.round(currY)) {
              graph[scaledY + 1][scaledX] = chartSymbols.sne;
              // The same Y values
            } else if (Math.round(prevY) === Math.round(currY)) {
              // Add line only if space is not occupied already - valid case for small similar Y
              if (graph[scaledY + 1][scaledX] === emptySymbol) {
                graph[scaledY + 1][scaledX] = chartSymbols.we;
              }
            }

            const distanceX = distance(currX, prevX);
            Array(distanceX ? distanceX - 1 : 0)
              .fill('')
              .forEach((_, steps) => {
                const thisY = plotHeight - Math.round(prevY);
                graph[thisY][Math.round(prevX) + steps + 1] = chartSymbols.we;
              });
          }

          // plot the last coordinate
          if (arr.length - 1 === index) {
            graph[scaledY + 1][scaledX + 1] = chartSymbols.we;
          }

          // fill empty area under the line if fill area is true
          if (fillArea) {
            graph.forEach((xValues, yIndex) => {
              xValues.forEach((xSymbol, xIndex) => {
                if (
                  (xSymbol === chartSymbols.nse ||
                    xSymbol === chartSymbols.wsn ||
                    xSymbol === chartSymbols.we ||
                    xSymbol === chartSymbols.area) &&
                  graph[yIndex + 1]?.[xIndex]
                ) {
                  graph[yIndex + 1][xIndex] = chartSymbols.area;
                }
              });
            });
          }
        } else {
          // custom line formatter
          const lineFormatterArgs = {
            x: sortedCoords[index][0],
            y: sortedCoords[index][1],
            plotX: scaledX + 1,
            plotY: scaledY + 1,
            index,
            input: input[0],
          };
          const customSymbols = lineFormatter(lineFormatterArgs);
          if (Array.isArray(customSymbols)) {
            customSymbols.forEach(({ x: symbolX, y: symbolY, symbol }: CustomSymbol) => {
              graph[symbolY][symbolX] = symbol;
            });
          } else {
            graph[customSymbols.y][customSymbols.x] = customSymbols.symbol;
          }
        }

        return [scaledX, scaledY];
      },
    );
  });

  // axis
  graph.forEach((line, index) => {
    line.forEach((_, curr) => {
      let lineChar = '';

      if (curr === axis.x && !hideYAxis) {
        if (index === 0) {
          lineChar = axisSymbols.n;
        } else if (index === graph.length - 1 && !axisCenter && !(hideYAxis || hideXAxis)) {
          lineChar = axisSymbols.nse;
        } else {
          lineChar = axisSymbols.ns;
        }
      } else if (index === axis.y && !hideXAxis) {
        if (curr === line.length - 1) {
          lineChar = axisSymbols.e;
        } else {
          lineChar = axisSymbols.we;
        }
      }

      if (lineChar) {
        // eslint-disable-next-line
        line[curr] = lineChar;
      }
    });
  });

  // labels

  // calculate shift for x and y labels, take the longest number
  // but first format it properly because it can be trimmed
  const formattedMinX = transformLabel(minX, { axis: 'x', xRange: expansionX, yRange: expansionY });

  // takes the longest label that needs to be rendered
  // on the Y axis and returns it's length

  let xShift = 0;
  let longestY = 0;
  input.forEach((current) => {
    current.forEach(([pointX, pointY], index) => {
      xShift = Math.max(
        toArray(
          transformLabel(pointX, {
            axis: 'x',
            xRange: expansionX,
            yRange: expansionY,
          }),
        ).length,
        xShift,
      );

      longestY = Math.max(
        toArray(
          transformLabel(pointY, {
            axis: 'y',
            xRange: expansionX,
            yRange: expansionY,
          }),
        ).length,
        longestY,
      );
    });
  });

  // first x0 label might be longer than the yShift
  // -2 is for the symbol.nse and symbol.x - at least two places for the label
  const x0Shift = toArray(formattedMinX).length - 2;
  const yShift = Math.max(x0Shift, longestY);

  // shift graph
  graph.push(toEmpty(plotWidth + 2, emptySymbol)); // bottom

  // check step
  let step = plotWidth;
  scaledCoords.forEach(([x], index) => {
    if (scaledCoords[index - 1]) {
      const current = x - scaledCoords[index - 1][0];
      step = current <= step ? current : step;
    }
  });

  // x coords overlap
  const hasToBeMoved = step < xShift;
  if (hasToBeMoved) graph.push(toEmpty(plotWidth + 1, emptySymbol));

  graph.forEach((line) => {
    for (let i = 0; i <= yShift; i += 1) {
      line.unshift(emptySymbol); // left
    }
  });

  // apply background symbol if overrided
  if (backgroundSymbol) {
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
  }

  // shift coords
  input.forEach((current) => {
    const coord = getPlotCoords(current, plotWidth, plotHeight, expansionX, expansionY);
    current.forEach(([pointX, pointY], index) => {
      const [x, y] = coord[index];

      const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);
      if (!hideYAxis) {
        // make sure position is not taken already
        if (graph[scaledY + 1][axis.x + yShift + 1] !== axisSymbols.y) {
          const pointYShift = toArray(
            transformLabel(pointY, { axis: 'y', xRange: expansionX, yRange: expansionY }),
          );
          for (let i = 0; i < pointYShift.length; i += 1) {
            graph[scaledY + 1][axis.x + yShift - i] = pointYShift[pointYShift.length - 1 - i];
          }
          graph[scaledY + 1][axis.x + yShift + 1] = axisSymbols.y;
        }
      }

      if (!hideXAxis) {
        const pointXShift = toArray(
          transformLabel(pointX, { axis: 'x', xRange: expansionX, yRange: expansionY }),
        );
        let yPos = graph.length - 1;
        const shift = axisCenter ? -1 : 0;

        // check if place is taken by previous point
        const hasPlaceToRender = pointXShift.every((_, i) => {
          // take into consideration different axis center,
          // when axis center is set to true symbol might be '-'
          return [emptySymbol, axisSymbols.ns].includes(
            graph[yPos - 1][scaledX + yShift - i + 2 + shift],
          );
        });

        for (let i = 0; i < pointXShift.length; i += 1) {
          let signShift = -1;
          if (hasToBeMoved) {
            signShift = -2;
          }

          const isSymbolOnXAxisOccupied =
            graph[yPos + signShift][scaledX + yShift + 2 + shift] === axisSymbols.x;

          // Make sure position is not taken already
          if (isSymbolOnXAxisOccupied) {
            break;
          }

          // make sure that shift is applied only when place is taken
          if (axisCenter) {
            yPos = axis.y + 1;
          }

          const yShiftWhenOccupied = hasPlaceToRender ? -1 : 0;
          const yShiftWhenHasAxisCenter = axisCenter ? 1 : 0;

          const graphY = yPos + yShiftWhenOccupied + yShiftWhenHasAxisCenter;
          const graphX = scaledX + yShift - i + 2 + shift;

          graph[graphY][graphX] = pointXShift[pointXShift.length - 1 - i];
          // Add X tick only for the last value
          if (pointXShift.length - 1 === i) {
            graph[yPos + signShift][scaledX + yShift + 2 + shift] = axisSymbols.x;
          }
        }
      }
    });
  });

  // Remove empty lines

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

  // Adds title above the graph
  if (title) {
    // add one line for the title
    graph.unshift(toEmpty(plotWidth + yShift + 2, backgroundSymbol)); // top
    Array.from(title).forEach((letter, index) => {
      graph[0][index] = letter;
    });
  }

  // Adds x axis label below the graph
  if (xLabel) {
    const totalWidth = graph[0].length;
    const labelLength = toArray(xLabel).length;
    const startingPosition = Math.round((totalWidth - labelLength) / 2);

    // add one line for the xLabel
    graph.push(toEmpty(plotWidth + yShift + 2, backgroundSymbol)); // bottom
    Array.from(xLabel).forEach((letter, index) => {
      graph[graph.length - 1][startingPosition + index] = letter;
    });
  }

  // Adds x axis label below the graph
  if (yLabel) {
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
  }

  if (legend) {
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
            const chartSymbols = getChartSymbols(color, index, symbols?.chart, fillArea);

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
            } else {
              // eslint-disable-next-line no-param-reassign
              line[0] = backgroundSymbol;
            }
          });
        }
        if (legend.position === 'right') {
          line.push(backgroundSymbol);

          series.forEach((label, index) => {
            // get chart symbols for series

            const chartSymbols = getChartSymbols(color, index, symbols?.chart, fillArea);
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
        const chartSymbols = getChartSymbols(color, index, symbols?.chart, fillArea);
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
        const chartSymbols = getChartSymbols(color, index, symbols?.chart, fillArea);
        const newSymbol = [chartSymbols.area, backgroundSymbol, ...Array.from(label)];

        graph[index].forEach((_, symbolIndex) => {
          if (newSymbol[symbolIndex]) {
            // eslint-disable-next-line no-param-reassign
            graph[graph.length - 1][symbolIndex] = newSymbol[symbolIndex];
          }
        });
      });
    }
  }

  if (borderSymbol) {
    graph.forEach((line) => {
      line.unshift(borderSymbol); // left
      line.push(borderSymbol); // right
    });
    graph.unshift(toEmpty(graph[0].length, borderSymbol)); // top
    graph.push(toEmpty(graph[0].length, borderSymbol)); // bottom
  }

  return `\n${graph.map((line) => line.join('')).join('\n')}\n`;
};
