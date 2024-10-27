import { getPlotCoords, toArray, toPlot, toSorted, getAxisCenter } from './coords';
import { getChartSymbols } from './settings';
import { SingleLine, Plot } from '../types/index';
import {
  addBackgroundSymbol,
  addBorder,
  addLegend,
  addThresholds,
  addXLable,
  addYLabel,
  setTitle,
  setFillArea,
  removeEmptyLines,
  getTransformLabel,
} from './overrides';
import { getSymbols, getChartSize, getLabelShift, getInput } from './defaults';

import {
  drawAxis,
  drawGraph,
  drawChart,
  drawCustomLine,
  drawLine,
  drawYAxisEnd,
  drawXAxisEnd,
  drawShift,
} from './draw';

export const plot: Plot = (
  rawInput,
  {
    color,
    width,
    height,
    yRange,
    showTickLabel,
    axisCenter,
    formatter,
    lineFormatter,
    symbols,
    title,
    fillArea,
    horizontalBarChart,
    barChart,
    hideXAxis,
    hideYAxis,
    xLabel,
    yLabel,
    legend,
    thresholds,
    debugMode,
  } = {},
) => {
  // Multiline
  let input = getInput({ rawInput });

  // Filter out points that are outside of the yRange (if defined)
  if (yRange) {
    const [yMin, yMax] = yRange;
    input = input.map((line) => line.filter(([, y]) => y >= yMin && y <= yMax));
  }

  // Empty input, return early
  if (input.length === 0) {
    return '';
  }

  // Proceed with the rest of your function as usual
  const transformLabel = getTransformLabel({ formatter });

  let scaledCoords = [[0, 0]];

  const { minX, minY, plotWidth, plotHeight, expansionX, expansionY } = getChartSize({
    width,
    height,
    input,
    yRange,
  });
  const { axisSymbols, emptySymbol, backgroundSymbol, borderSymbol } = getSymbols({ symbols });

  // create placeholder
  const graph = drawGraph({ plotWidth, plotHeight, emptySymbol });

  const axis = getAxisCenter(axisCenter, plotWidth, plotHeight, expansionX, expansionY, [
    0,
    graph.length - 1,
  ]);

  // get default chart symbols
  input.forEach((coords: SingleLine, series) => {
    // override default chart symbols with colored ones
    const chartSymbols = getChartSymbols(color, series, symbols?.chart, input, fillArea);

    // sort input by the first value
    const sortedCoords = toSorted(coords);

    scaledCoords = getPlotCoords(sortedCoords, plotWidth, plotHeight, expansionX, expansionY).map(
      ([x, y], index, arr) => {
        const toPlotCoordinates = toPlot(plotWidth, plotHeight);
        const [scaledX, scaledY] = toPlotCoordinates(x, y);
        if (!lineFormatter) {
          drawLine({
            debugMode,
            index,
            arr,
            graph,
            scaledX,
            scaledY,
            plotHeight,
            emptySymbol,
            chartSymbols,
            horizontalBarChart,
            axis,
            axisCenter,
            barChart,
          });

          // fill empty area under the line if fill area is true
          if (fillArea) {
            setFillArea({ graph, chartSymbols, debugMode });
          }
        } else {
          drawCustomLine({
            debugMode,
            sortedCoords,
            scaledX,
            scaledY,
            input,
            index,
            lineFormatter,
            graph,
            toPlotCoordinates,
            expansionX,
            expansionY,
            minY,
            minX,
          });
        }

        return [scaledX, scaledY];
      },
    );
  });

  if (thresholds) {
    addThresholds({
      debugMode,
      graph,
      thresholds,
      axis,
      plotWidth,
      plotHeight,
      expansionX,
      expansionY,
    });
  }

  // axis
  drawAxis({
    debugMode,
    graph,
    hideXAxis,
    hideYAxis,
    axisCenter,
    axisSymbols,
    axis,
  });

  // labels

  // takes the longest label that needs to be rendered
  // on the Y axis and returns it's length
  const { xShift, yShift } = getLabelShift({ input, transformLabel, expansionX, expansionY, minX });

  // shift graph
  const { hasToBeMoved } = drawShift({
    graph,
    plotWidth,
    emptySymbol,
    scaledCoords,
    xShift,
    yShift,
  });

  // apply background symbol if override
  if (backgroundSymbol) {
    addBackgroundSymbol({ debugMode, graph, backgroundSymbol, emptySymbol });
  }

  // shift coords
  input.forEach((current) => {
    const coord = getPlotCoords(current, plotWidth, plotHeight, expansionX, expansionY);
    current.forEach(([pointX, pointY], index) => {
      const [x, y] = coord[index];

      const [scaledX, scaledY] = toPlot(plotWidth, plotHeight)(x, y);
      if (!hideYAxis) {
        drawYAxisEnd({
          debugMode,
          showTickLabel,
          plotHeight,
          graph,
          scaledY,
          axisCenter,
          yShift,
          axis,
          pointY,
          transformLabel,
          axisSymbols,
          expansionX,
          expansionY,
        });
      }

      if (!hideXAxis) {
        const pointXShift = toArray(
          transformLabel(pointX, { axis: 'x', xRange: expansionX, yRange: expansionY }),
        );
        let yPos = graph.length - 1;
        const shift = axisCenter ? -1 : 0;

        // check if place is taken by previous point
        // take into consideration different axis center,
        // when axis center is set to true symbol might be '-'
        const hasPlaceToRender = pointXShift.every((_, i) =>
          [emptySymbol, axisSymbols.ns].includes(graph[yPos - 1][scaledX + yShift - i + 2 + shift]),
        );

        for (let i = 0; i < pointXShift.length; i += 1) {
          let signShift = -1;
          if (hasToBeMoved) {
            signShift = -2;
          }

          const rowIndex = yPos + signShift;
          const colIndex = scaledX + yShift + 2 + shift;

          // Check if rowIndex is within bounds
          const rowExists = rowIndex >= 0 && rowIndex < graph.length;

          // Initialize isSymbolOnXAxisOccupied
          let isSymbolOnXAxisOccupied = false;

          if (rowExists) {
            const row = graph[rowIndex];

            // Check if colIndex is within bounds
            const colExists = colIndex >= 0 && colIndex < row.length;

            if (colExists) {
              isSymbolOnXAxisOccupied = row[colIndex] === axisSymbols.x;
            }
          }

          // Make sure position is not taken already
          if (isSymbolOnXAxisOccupied) {
            break;
          }

          // Apply shift only when place is taken
          if (axisCenter) {
            yPos = axis.y + 1;
          }

          drawXAxisEnd({
            debugMode,
            hasPlaceToRender,
            axisCenter,
            yPos,
            graph,
            yShift,
            i,
            scaledX,
            shift,
            signShift,
            axisSymbols,
            pointXShift,
          });
        }
      }
    });
  });

  // Remove empty lines
  removeEmptyLines({ graph, backgroundSymbol });

  // Adds title above the graph
  if (title) {
    setTitle({
      debugMode,
      title,
      graph,
      backgroundSymbol,
      plotWidth,
      yShift,
    });
  }

  // Adds x axis label below the graph
  if (xLabel) {
    addXLable({
      debugMode,
      xLabel,
      graph,
      backgroundSymbol,
      plotWidth,
      yShift,
    });
  }

  // Adds x axis label below the graph
  if (yLabel) {
    addYLabel({
      debugMode,
      yLabel,
      graph,
      backgroundSymbol,
    });
  }

  if (legend) {
    addLegend({
      debugMode,
      input,
      graph,
      legend,
      backgroundSymbol,
      color,
      symbols,
      fillArea,
    });
  }

  if (borderSymbol) {
    addBorder({ graph, borderSymbol });
  }

  return drawChart({ graph });
};

export default plot;
