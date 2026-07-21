import {
  AnnotationSymbols,
  ArrowHeadSymbols,
  CandlestickMarkStyle,
  CandlestickSpec,
  CandlestickStyle,
  CandlestickSymbols,
  ChartAnnotationBase,
  ChartArrowAnnotation,
  ChartErrorBarAnnotation,
  ChartLegend,
  ChartOverlayPoint,
  ChartSeries,
  ChartSpanAnnotation,
  ChartSpec,
  ChartTextAnnotation,
  ChartThreshold,
  ColorContext,
  ErrorBarSymbols,
  FormatterHelpers,
  GraphPoint,
  HeatmapLevel,
  HeatmapSpec,
  HeatmapSymbols,
  HeatmapThreshold,
  HistogramOptions,
  Legend,
  LineFormatterArgs,
  Settings,
  SparklineOptions,
  SparklineSymbols,
  SparklineThreshold,
  Symbols,
  Threshold,
  ValueLabelContext,
  XAxis,
  YAxis,
} from '@types';

import type {
  ChartValueLabelsConfig,
  ConditionalColoring,
  ExampleCoverage,
  GradientColoring,
} from './types';

/**
 * Option metadata for covered settings.
 */
export const coveredSettingsOptions = {
  color: true,
  width: true,
  height: true,
  aspectRatio: true,
  yRange: true,
  overflow: true,
  renderer: true,
  showTickLabel: true,
  hideXAxis: true,
  hideXAxisTicks: true,
  hideYAxis: true,
  hideYAxisTicks: true,
  customXAxisTicks: true,
  customYAxisTicks: true,
  title: true,
  titleColor: true,
  xLabel: true,
  yLabel: true,
  thresholds: true,
  points: true,
  fillArea: true,
  legend: true,
  axisCenter: true,
  formatter: true,
  lineFormatter: true,
  symbols: true,
  borderColor: true,
  backgroundColor: true,
  mode: true,
  interpolation: true,
  coloring: true,
  barLayout: true,
  valueLabels: true,
  debugMode: true,
  xAxis: true,
  yAxis: true,
} satisfies Record<keyof Settings, true>;

/**
 * Option metadata for covered chart spec.
 */
export const coveredChartSpecOptions = {
  series: true,
  width: true,
  height: true,
  aspectRatio: true,
  title: true,
  titleColor: true,
  overflow: true,
  renderer: true,
  xAxis: true,
  yAxis: true,
  secondaryYAxis: true,
  legend: true,
  axisCenter: true,
  points: true,
  thresholds: true,
  annotations: true,
  symbols: true,
  borderColor: true,
  backgroundColor: true,
  debugMode: true,
  barLayout: true,
  valueLabels: true,
} satisfies Record<keyof ChartSpec, true>;

/**
 * Option metadata for covered series.
 */
export const coveredSeriesOptions = {
  id: true,
  name: true,
  data: true,
  mode: true,
  interpolation: true,
  color: true,
  coloring: true,
  fillArea: true,
  lineFormatter: true,
  yAxis: true,
} satisfies Record<keyof ChartSeries, true>;

/**
 * Option metadata for covered xaxis.
 */
export const coveredXAxisOptions = {
  scale: true,
  domain: true,
  ticks: true,
  label: true,
  formatter: true,
  hidden: true,
  hideTicks: true,
  labelCollision: true,
  color: true,
} satisfies Record<keyof XAxis, true>;

/**
 * Option metadata for covered yaxis.
 */
export const coveredYAxisOptions = {
  domain: true,
  ticks: true,
  label: true,
  formatter: true,
  hidden: true,
  hideTicks: true,
  showTickLabel: true,
  color: true,
} satisfies Record<keyof YAxis, true>;

/**
 * Option metadata for covered legend.
 */
export const coveredLegendOptions = {
  position: true,
  series: true,
  points: true,
  thresholds: true,
  color: true,
} satisfies Record<keyof Legend & keyof ChartLegend, true>;

/**
 * Option metadata for covered symbol.
 */
export const coveredSymbolOptions = {
  axis: true,
  chart: true,
  empty: true,
  background: true,
  border: true,
  thresholds: true,
  point: true,
  candlestick: true,
  annotations: true,
  ellipsis: true,
} satisfies Record<keyof Symbols, true>;

/**
 * Option metadata for covered candlestick.
 */
export const coveredCandlestickOptions = {
  data: true,
  width: true,
  height: true,
  title: true,
  xAxis: true,
  yAxis: true,
  style: true,
  thresholds: true,
  symbols: true,
  debugMode: true,
} satisfies Record<keyof CandlestickSpec, true>;

/**
 * Option metadata for covered heatmap.
 */
export const coveredHeatmapOptions = {
  data: true,
  levels: true,
  threshold: true,
  rows: true,
  columns: true,
  title: true,
  legend: true,
  symbols: true,
} satisfies Record<keyof HeatmapSpec, true>;

/**
 * Option metadata for covered heatmap level.
 */
export const coveredHeatmapLevelOptions = {
  value: true,
  symbol: true,
  color: true,
  label: true,
} satisfies Record<keyof HeatmapLevel, true>;

/**
 * Option metadata for covered heatmap threshold.
 */
export const coveredHeatmapThresholdOptions = {
  value: true,
  belowColor: true,
  aboveColor: true,
  belowSymbol: true,
  aboveSymbol: true,
  belowLabel: true,
  aboveLabel: true,
} satisfies Record<keyof HeatmapThreshold, true>;

const settingsExampleCoverage = {
  color: 'dynamic colors overlays symbols and labels',
  width: 'auto width with aspect ratio',
  height: 'single point with inferred domains',
  aspectRatio: 'auto width with aspect ratio',
  yRange: 'dynamic colors overlays symbols and labels',
  overflow: 'clip overflow with linear interpolation',
  renderer: 'single point with inferred domains',
  showTickLabel: 'dynamic colors overlays symbols and labels',
  hideXAxis: 'dynamic colors overlays symbols and labels',
  hideXAxisTicks: 'dynamic colors overlays symbols and labels',
  hideYAxis: 'dynamic colors overlays symbols and labels',
  hideYAxisTicks: 'dynamic colors overlays symbols and labels',
  customXAxisTicks: 'dynamic colors overlays symbols and labels',
  customYAxisTicks: 'dynamic colors overlays symbols and labels',
  title: 'dynamic colors overlays symbols and labels',
  titleColor: 'plot color: blue title',
  xLabel: 'dynamic colors overlays symbols and labels',
  yLabel: 'dynamic colors overlays symbols and labels',
  thresholds: 'dynamic colors overlays symbols and labels',
  points: 'dynamic colors overlays symbols and labels',
  fillArea: 'dynamic colors overlays symbols and labels',
  legend: 'legend position auto',
  axisCenter: 'dynamic colors overlays symbols and labels',
  formatter: 'formatter helper parameters',
  lineFormatter: 'line formatter helper parameters',
  symbols: 'dynamic colors overlays symbols and labels',
  borderColor: 'plot color: magenta border',
  backgroundColor: 'plot color: dim background',
  mode: 'mode line',
  interpolation: 'clip overflow with linear interpolation',
  coloring: 'coloring context parameters',
  barLayout: 'normalized bars with value formatter',
  valueLabels: 'plot color: yellow bar values',
  debugMode: 'debug grid',
  xAxis: 'structured axis objects override flat aliases',
  yAxis: 'structured axis objects override flat aliases',
} satisfies ExampleCoverage<Settings>;

const chartSpecExampleCoverage = {
  series: 'complete numeric specification',
  width: 'complete numeric specification',
  height: 'complete numeric specification',
  aspectRatio: 'band categories and wrapped labels',
  title: 'complete numeric specification',
  titleColor: 'structured color: yellow title',
  overflow: 'complete numeric specification',
  renderer: 'complete numeric specification',
  xAxis: 'complete numeric specification',
  yAxis: 'complete numeric specification',
  secondaryYAxis: 'structured color: magenta secondary axis',
  legend: 'complete numeric specification',
  axisCenter: 'custom axis center',
  points: 'complete numeric specification',
  thresholds: 'complete numeric specification',
  annotations: 'complete numeric specification',
  symbols: 'complete numeric specification',
  borderColor: 'structured color: red border',
  backgroundColor: 'structured color: blue background',
  debugMode: 'complete numeric specification',
  barLayout: 'normalized categorical bars',
  valueLabels: 'structured color: magenta normalized bar values',
} satisfies ExampleCoverage<ChartSpec>;

const seriesExampleCoverage = {
  id: 'complete numeric specification',
  name: 'complete numeric specification',
  data: 'complete numeric specification',
  mode: 'mixed line point and bar series',
  interpolation: 'complete numeric specification',
  color: 'structured color: blue x axis',
  coloring: 'complete numeric specification',
  fillArea: 'complete numeric specification',
  lineFormatter: 'line formatter helper parameters',
  yAxis: 'Date annotations and secondary axis',
} satisfies ExampleCoverage<ChartSeries>;

const xAxisExampleCoverage = {
  scale: 'complete numeric specification',
  domain: 'complete numeric specification',
  ticks: 'complete numeric specification',
  label: 'complete numeric specification',
  formatter: 'complete numeric specification',
  hidden: 'complete numeric specification',
  hideTicks: 'complete numeric specification',
  labelCollision: 'band categories and wrapped labels',
  color: 'structured color: green y axis',
} satisfies ExampleCoverage<XAxis>;

const yAxisExampleCoverage = {
  domain: 'complete numeric specification',
  ticks: 'complete numeric specification',
  label: 'complete numeric specification',
  formatter: 'complete numeric specification',
  hidden: 'complete numeric specification',
  hideTicks: 'complete numeric specification',
  showTickLabel: 'complete numeric specification',
  color: 'structured color: white legend labels',
} satisfies ExampleCoverage<YAxis>;

const legendExampleCoverage = {
  position: 'complete numeric specification',
  series: 'complete numeric specification',
  points: 'complete numeric specification',
  thresholds: 'complete numeric specification',
  color: 'complete numeric specification',
} satisfies ExampleCoverage<Legend & ChartLegend>;

const symbolExampleCoverage = {
  axis: 'dynamic colors overlays symbols and labels',
  chart: 'dynamic colors overlays symbols and labels',
  empty: 'dynamic colors overlays symbols and labels',
  background: 'dynamic colors overlays symbols and labels',
  border: 'dynamic colors overlays symbols and labels',
  thresholds: 'dynamic colors overlays symbols and labels',
  point: 'dynamic colors overlays symbols and labels',
  candlestick: 'custom candlestick glyph catalog',
  annotations: 'custom annotation glyph catalog',
  ellipsis: 'custom ellipsis glyph',
} satisfies ExampleCoverage<Symbols>;

const graphPointExampleCoverage = {
  x: 'dynamic colors overlays symbols and labels',
  y: 'dynamic colors overlays symbols and labels',
  color: 'dynamic colors overlays symbols and labels',
} satisfies ExampleCoverage<GraphPoint>;

const legacyThresholdExampleCoverage = {
  x: 'dynamic colors overlays symbols and labels',
  y: 'dynamic colors overlays symbols and labels',
  color: 'dynamic colors overlays symbols and labels',
} satisfies ExampleCoverage<Threshold>;

const conditionalColoringExampleCoverage = {
  type: 'coloring context parameters',
  getColor: 'coloring context parameters',
} satisfies ExampleCoverage<ConditionalColoring>;

const gradientColoringExampleCoverage = {
  type: 'per-series gradient coloring',
  by: 'per-series gradient coloring',
  colors: 'per-series gradient coloring',
  domain: 'per-series gradient coloring',
} satisfies ExampleCoverage<GradientColoring>;

const chartValueLabelsExampleCoverage = {
  formatter: 'value label context parameters',
  color: 'structured color: cyan grouped bar values',
} satisfies ExampleCoverage<ChartValueLabelsConfig>;

const sparklineOptionsExampleCoverage = {
  symbols: 'custom sparkline glyph catalog',
  color: 'multicolor service health',
  threshold: 'threshold compact latency',
} satisfies ExampleCoverage<SparklineOptions>;

const sparklineThresholdExampleCoverage = {
  value: 'threshold compact latency',
  belowColor: 'threshold compact latency',
  aboveColor: 'threshold compact latency',
} satisfies ExampleCoverage<SparklineThreshold>;

const sparklineSymbolsExampleCoverage = {
  levels: 'custom sparkline glyph catalog',
  empty: 'custom sparkline glyph catalog',
} satisfies ExampleCoverage<SparklineSymbols>;

const heatmapSymbolsExampleCoverage = {
  cell: 'custom heatmap glyph catalog',
  belowThreshold: 'custom heatmap glyph catalog',
  aboveThreshold: 'custom heatmap glyph catalog',
  empty: 'custom heatmap glyph catalog',
  gap: 'custom heatmap glyph catalog',
} satisfies ExampleCoverage<HeatmapSymbols>;

const candlestickSymbolsExampleCoverage = {
  wick: 'custom candlestick glyph catalog',
  rising: 'custom candlestick glyph catalog',
  falling: 'custom candlestick glyph catalog',
  unchanged: 'custom candlestick glyph catalog',
} satisfies ExampleCoverage<CandlestickSymbols>;

const annotationSymbolsExampleCoverage = {
  span: 'custom annotation glyph catalog',
  arrowLine: 'custom annotation glyph catalog',
  arrowHeads: 'custom annotation glyph catalog',
  errorBar: 'custom annotation glyph catalog',
} satisfies ExampleCoverage<AnnotationSymbols>;

const arrowHeadSymbolsExampleCoverage = {
  left: 'custom annotation glyph catalog',
  right: 'custom annotation glyph catalog',
  up: 'custom annotation glyph catalog',
  down: 'custom annotation glyph catalog',
  upLeft: 'custom annotation glyph catalog',
  upRight: 'custom annotation glyph catalog',
  downLeft: 'custom annotation glyph catalog',
  downRight: 'custom annotation glyph catalog',
} satisfies ExampleCoverage<ArrowHeadSymbols>;

const errorBarSymbolsExampleCoverage = {
  horizontal: 'custom annotation glyph catalog',
  vertical: 'custom annotation glyph catalog',
  leftCap: 'custom annotation glyph catalog',
  rightCap: 'custom annotation glyph catalog',
  topCap: 'custom annotation glyph catalog',
  bottomCap: 'custom annotation glyph catalog',
  center: 'custom annotation glyph catalog',
} satisfies ExampleCoverage<ErrorBarSymbols>;

const overlayPointExampleCoverage = {
  id: 'string annotations and overlays',
  name: 'string annotations and overlays',
  x: 'string annotations and overlays',
  y: 'string annotations and overlays',
  color: 'string annotations and overlays',
} satisfies ExampleCoverage<ChartOverlayPoint<string>>;

const thresholdExampleCoverage = {
  id: 'string annotations and overlays',
  name: 'string annotations and overlays',
  x: 'string annotations and overlays',
  y: 'string annotations and overlays',
  color: 'string annotations and overlays',
} satisfies ExampleCoverage<ChartThreshold<string>>;

const annotationBaseExampleCoverage = {
  id: 'string annotations and overlays',
  color: 'string annotations and overlays',
} satisfies ExampleCoverage<ChartAnnotationBase>;

const spanAnnotationExampleCoverage = {
  id: 'string annotations and overlays',
  color: 'string annotations and overlays',
  type: 'string annotations and overlays',
  axis: 'string annotations and overlays',
  from: 'string annotations and overlays',
  to: 'string annotations and overlays',
  symbol: 'string annotations and overlays',
} satisfies ExampleCoverage<ChartSpanAnnotation<string>>;

const textAnnotationExampleCoverage = {
  id: 'string annotations and overlays',
  color: 'string annotations and overlays',
  type: 'string annotations and overlays',
  x: 'string annotations and overlays',
  y: 'string annotations and overlays',
  text: 'string annotations and overlays',
  align: 'string annotations and overlays',
} satisfies ExampleCoverage<ChartTextAnnotation<string>>;

const arrowAnnotationExampleCoverage = {
  id: 'Date annotations and secondary axis',
  color: 'Date annotations and secondary axis',
  type: 'Date annotations and secondary axis',
  from: 'Date annotations and secondary axis',
  to: 'Date annotations and secondary axis',
  lineSymbol: 'Date annotations and secondary axis',
} satisfies ExampleCoverage<ChartArrowAnnotation<Date>>;

const errorBarAnnotationExampleCoverage = {
  id: 'Date annotations and secondary axis',
  color: 'Date annotations and secondary axis',
  type: 'Date annotations and secondary axis',
  x: 'Date annotations and secondary axis',
  y: 'Date annotations and secondary axis',
  yError: 'Date annotations and secondary axis',
  xError: 'Date annotations and secondary axis',
} satisfies ExampleCoverage<ChartErrorBarAnnotation<Date>>;

const formatterHelpersExampleCoverage = {
  axis: 'formatter helper parameters',
  xRange: 'formatter helper parameters',
  yRange: 'formatter helper parameters',
} satisfies ExampleCoverage<FormatterHelpers>;

const lineFormatterArgsExampleCoverage = {
  x: 'line formatter helper parameters',
  y: 'line formatter helper parameters',
  plotX: 'line formatter helper parameters',
  plotY: 'line formatter helper parameters',
  input: 'line formatter helper parameters',
  index: 'line formatter helper parameters',
  minY: 'line formatter helper parameters',
  minX: 'line formatter helper parameters',
  expansionX: 'line formatter helper parameters',
  expansionY: 'line formatter helper parameters',
  toPlotCoordinates: 'line formatter helper parameters',
} satisfies ExampleCoverage<LineFormatterArgs>;

const colorContextExampleCoverage = {
  series: 'coloring context parameters',
  mode: 'coloring context parameters',
  x: 'coloring context parameters',
  y: 'coloring context parameters',
  plotX: 'coloring context parameters',
  plotY: 'coloring context parameters',
} satisfies ExampleCoverage<ColorContext>;

const valueLabelContextExampleCoverage = {
  seriesIndex: 'value label context parameters',
  seriesId: 'value label context parameters',
  seriesName: 'value label context parameters',
  datumIndex: 'value label context parameters',
  x: 'value label context parameters',
  y: 'value label context parameters',
  mode: 'value label context parameters',
  layout: 'value label context parameters',
} satisfies ExampleCoverage<ValueLabelContext>;

const candlestickExampleCoverage = {
  data: 'complete custom specification',
  width: 'complete custom specification',
  height: 'complete custom specification',
  title: 'complete custom specification',
  xAxis: 'complete custom specification',
  yAxis: 'complete custom specification',
  style: 'complete custom specification',
  thresholds: 'threshold: profit target',
  symbols: 'complete custom specification',
  debugMode: 'complete custom specification',
} satisfies ExampleCoverage<CandlestickSpec>;

const candlestickStyleExampleCoverage = {
  wick: 'complete custom specification',
  rising: 'complete custom specification',
  falling: 'complete custom specification',
  unchanged: 'complete custom specification',
} satisfies ExampleCoverage<CandlestickStyle>;

const candlestickMarkStyleExampleCoverage = {
  symbol: 'complete custom specification',
  color: 'complete custom specification',
} satisfies ExampleCoverage<CandlestickMarkStyle>;

const heatmapExampleCoverage = {
  data: 'CI compatibility matrix',
  levels: 'CI compatibility matrix',
  threshold: 'CPU saturation threshold heatmap',
  rows: 'CI compatibility matrix',
  columns: 'CI compatibility matrix',
  title: 'Unicode labels and title',
  legend: 'CI compatibility matrix',
  symbols: 'minimal unlabeled heatmap',
} satisfies ExampleCoverage<HeatmapSpec>;

const heatmapLevelExampleCoverage = {
  value: 'CI compatibility matrix',
  symbol: 'CI compatibility matrix',
  color: 'CI compatibility matrix',
  label: 'CI compatibility matrix',
} satisfies ExampleCoverage<HeatmapLevel>;

const heatmapThresholdExampleCoverage = {
  value: 'CPU saturation threshold heatmap',
  belowColor: 'CPU saturation threshold heatmap',
  aboveColor: 'CPU saturation threshold heatmap',
  belowSymbol: 'CPU saturation threshold heatmap',
  aboveSymbol: 'CPU saturation threshold heatmap',
  belowLabel: 'CPU saturation threshold heatmap',
  aboveLabel: 'CPU saturation threshold heatmap',
} satisfies ExampleCoverage<HeatmapThreshold>;

/**
 * Maps each public rendering surface to options exercised by examples.
 */
export const exampleCoverageBySurface = {
  settings: settingsExampleCoverage,
  chartSpec: chartSpecExampleCoverage,
  series: seriesExampleCoverage,
  xAxis: xAxisExampleCoverage,
  yAxis: yAxisExampleCoverage,
  legend: legendExampleCoverage,
  symbols: symbolExampleCoverage,
  graphPoint: graphPointExampleCoverage,
  legacyThreshold: legacyThresholdExampleCoverage,
  conditionalColoring: conditionalColoringExampleCoverage,
  gradientColoring: gradientColoringExampleCoverage,
  chartValueLabels: chartValueLabelsExampleCoverage,
  sparklineOptions: sparklineOptionsExampleCoverage,
  sparklineThreshold: sparklineThresholdExampleCoverage,
  sparklineSymbols: sparklineSymbolsExampleCoverage,
  heatmapSymbols: heatmapSymbolsExampleCoverage,
  candlestickSymbols: candlestickSymbolsExampleCoverage,
  annotationSymbols: annotationSymbolsExampleCoverage,
  arrowHeadSymbols: arrowHeadSymbolsExampleCoverage,
  errorBarSymbols: errorBarSymbolsExampleCoverage,
  overlayPoint: overlayPointExampleCoverage,
  threshold: thresholdExampleCoverage,
  annotationBase: annotationBaseExampleCoverage,
  spanAnnotation: spanAnnotationExampleCoverage,
  textAnnotation: textAnnotationExampleCoverage,
  arrowAnnotation: arrowAnnotationExampleCoverage,
  errorBarAnnotation: errorBarAnnotationExampleCoverage,
  formatterHelpers: formatterHelpersExampleCoverage,
  lineFormatterArgs: lineFormatterArgsExampleCoverage,
  colorContext: colorContextExampleCoverage,
  valueLabelContext: valueLabelContextExampleCoverage,
  candlestick: candlestickExampleCoverage,
  candlestickStyle: candlestickStyleExampleCoverage,
  candlestickMarkStyle: candlestickMarkStyleExampleCoverage,
  heatmap: heatmapExampleCoverage,
  heatmapLevel: heatmapLevelExampleCoverage,
  heatmapThreshold: heatmapThresholdExampleCoverage,
} as const;

/** Maps nonvisual helper options to executable helper examples. */
export const helperExampleCoverageBySurface = {
  histogramOptions: {
    binCount: 'explicit histogram bin count',
  } satisfies ExampleCoverage<HistogramOptions>,
} as const;
