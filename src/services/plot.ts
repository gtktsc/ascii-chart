import { getPlotCoords, toPlot, toSorted, getAxisCenter } from './coords';
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
  addPoints,
} from './overrides';
import { getSymbols, getChartSize, getLabelShift, getInput } from './defaults';

import {
  drawAxis,
  drawGraph,
  drawChart,
  drawCustomLine,
  drawLine,
  drawShift,
  drawTicks,
  drawAxisCenter,
} from './draw';

export const plot: Plot = (
  rawInput,
  {
    color,
    width,
    height,
    yRange,
    showTickLabel,
    hideXAxisTicks,
    hideYAxisTicks,
    customXAxisTicks,
    customYAxisTicks,
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
    thresholds,
    points,
    debugMode,
    mode = 'line',
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
    axisCenter,
  });
  const {
    axisSymbols,
    emptySymbol,
    backgroundSymbol,
    borderSymbol,
    thresholdSymbols,
    pointSymbol,
  } = getSymbols({ symbols });

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
            mode,
            debugMode,
            index,
            arr,
            graph,
            scaledX,
            scaledY,
            plotHeight,
            emptySymbol,
            chartSymbols,
            axis,
            axisCenter,
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
      thresholdSymbols,
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

  if (points) {
    addPoints({
      pointSymbol,
      debugMode,
      graph,
      points,
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

  // takes the longest label that needs to be rendered
  // on the Y axis and returns it's length
  const { xShift, yShift } = getLabelShift({
    input,
    transformLabel,
    showTickLabel,
    expansionX,
    expansionY,
    minX,
  });

  // shift graph
  let { realXShift } = drawShift({
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

  // axis
  drawAxisCenter({
    realXShift,
    debugMode,
    emptySymbol,
    backgroundSymbol,
    graph,
    axisSymbols,
    axis,
  });

  // draw axis ends and ticks
  drawTicks({
    input,
    graph,
    plotWidth,
    plotHeight,
    axis,
    axisCenter,
    yShift,
    emptySymbol,
    debugMode,
    hideXAxis,
    expansionX,
    expansionY,
    hideYAxis,
    customYAxisTicks,
    customXAxisTicks,
    hideYAxisTicks,
    hideXAxisTicks,
    showTickLabel,
    axisSymbols,
    transformLabel,
  });

  // Remove empty lines
  removeEmptyLines({ graph, backgroundSymbol });

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
      points,
      thresholds,
      pointSymbol,
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

  if (borderSymbol) {
    addBorder({ graph, borderSymbol, backgroundSymbol });
  }

  return drawChart({ graph });
};

export default plot;
