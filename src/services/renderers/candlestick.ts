import {
  Candlestick,
  CandlestickDatum,
  CandlestickMarkStyle,
  CandlestickSpec,
  CandlestickStyle,
  CandlestickSymbols,
  CustomSymbol,
  Symbols,
} from '@types';
import { DEFAULT_CHART_HEIGHT } from '@constants/layout';
import { DEFAULT_CANDLESTICK_SYMBOLS } from '@constants/symbols/candlestick';
import { colorizeSymbol } from '@helpers/colors';
import { scaler } from '@helpers/coordinates';
import { resolveSymbols } from '@helpers/symbols';
import { assertCellSymbol } from '@helpers/terminal-text';
import { resolveDomain } from '@services/chart/domain/ranges';
import { renderChart } from '@services/chart/render';
import { validateChartSpec } from '@services/chart/validation/input';
import {
  assertColor,
  assertFiniteNumber,
  assertRecord,
} from '@services/chart/validation/primitives';
import { rangeError, typeError } from '@services/errors';

import type { ResolvedCandlestickMarkStyle, ResolvedCandlestickStyle } from './types';

const assertStyle = (value: unknown): void => {
  if (value === undefined) return;
  const style = assertRecord(value, 'style');
  if (style.wick !== undefined) assertCellSymbol(style.wick, 'style.wick');
  for (const state of ['rising', 'falling', 'unchanged'] as const) {
    if (style[state] === undefined) continue;
    const mark = assertRecord(style[state], `style.${state}`);
    if (mark.symbol !== undefined) assertCellSymbol(mark.symbol, `style.${state}.symbol`);
    assertColor(mark.color, `style.${state}.color`);
  }
};

const resolveMarkStyle = (
  style: CandlestickMarkStyle | undefined,
  symbol: string,
): ResolvedCandlestickMarkStyle => ({
  symbol: style?.symbol ?? symbol,
  color: style?.color,
});

const resolveStyle = (
  style: CandlestickStyle | undefined,
  overrides?: Symbols,
): ResolvedCandlestickStyle => {
  const symbols = resolveSymbols<Required<CandlestickSymbols>>(
    DEFAULT_CANDLESTICK_SYMBOLS,
    overrides?.candlestick,
  );
  return {
    wick: style?.wick ?? symbols.wick,
    rising: resolveMarkStyle(style?.rising, symbols.rising),
    falling: resolveMarkStyle(style?.falling, symbols.falling),
    unchanged: resolveMarkStyle(style?.unchanged, symbols.unchanged),
  };
};

const assertData = (value: unknown): CandlestickDatum[] => {
  if (!Array.isArray(value)) return typeError('data', 'must be an array');
  const xValues = new Set<number>();
  return value.map((datum, index) => {
    const path = `data[${index}]`;
    if (!Array.isArray(datum) || datum.length !== 5) {
      return typeError(path, 'must contain exactly x, open, high, low, and close');
    }
    const values = datum.map((entry, valueIndex) =>
      assertFiniteNumber(entry, `${path}[${valueIndex}]`),
    );
    const [x, open, high, low, close] = values;
    if (xValues.has(x)) rangeError(`${path}[0]`, `duplicate x value ${x}`);
    xValues.add(x);
    if (low > open || low > close) {
      rangeError(`${path}[3]`, 'low must be less than or equal to open and close');
    }
    if (high < open || high < close) {
      rangeError(`${path}[2]`, 'high must be greater than or equal to open and close');
    }
    return [x, open, high, low, close];
  });
};

const assertSpec = (value: unknown): { spec: CandlestickSpec; data: CandlestickDatum[] } => {
  const spec = assertRecord(value, 'spec');
  const data = assertData(spec.data);
  assertStyle(spec.style);
  const validationData = data.length ? data.map(([x, , , , close]) => [x, close]) : [[0, 0]];
  validateChartSpec({
    series: [
      {
        id: 'candlestick',
        data: validationData,
      },
    ],
    width: spec.width,
    height: spec.height,
    title: spec.title,
    xAxis: spec.xAxis,
    yAxis: spec.yAxis,
    thresholds: spec.thresholds,
    symbols: spec.symbols,
    debugMode: spec.debugMode,
  });
  return { spec: spec as unknown as CandlestickSpec, data };
};

const resolveMark = (
  open: number,
  close: number,
  style: ResolvedCandlestickStyle,
): ResolvedCandlestickMarkStyle => {
  if (close > open) return style.rising;
  if (close < open) return style.falling;
  return style.unchanged;
};

const createCandleSymbols = ({
  datum,
  plotX,
  toRow,
  style,
}: {
  datum: CandlestickDatum;
  plotX: number;
  toRow: (value: number) => number;
  style: ResolvedCandlestickStyle;
}): CustomSymbol[] => {
  const [, open, high, low, close] = datum;
  const mark = resolveMark(open, close, style);
  const wick = colorizeSymbol(style.wick, mark.color);
  const body = colorizeSymbol(mark.symbol, mark.color);
  const highRow = toRow(high);
  const lowRow = toRow(low);
  const openRow = toRow(open);
  const closeRow = toRow(close);
  const symbols: CustomSymbol[] = [];

  for (let y = Math.min(highRow, lowRow); y <= Math.max(highRow, lowRow); y++) {
    symbols.push({ x: plotX, y, symbol: wick });
  }
  for (let y = Math.min(openRow, closeRow); y <= Math.max(openRow, closeRow); y++) {
    symbols.push({ x: plotX, y, symbol: body });
  }
  return symbols;
};

const isVisible = (
  [x, , high, low]: CandlestickDatum,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
) => x >= xDomain[0] && x <= xDomain[1] && low >= yDomain[0] && high <= yDomain[1];

const withDomain = <Axis extends CandlestickSpec['xAxis'] | CandlestickSpec['yAxis']>(
  axis: Axis,
  domain: readonly [number, number],
): Axis => {
  if (!axis?.domain && domain[0] === domain[1]) return axis;
  return { ...axis, domain } as Axis;
};

/**
 * Renders finite OHLC tuples as one-cell candlesticks on structured chart axes.
 * @param {CandlestickSpec} value - Candlestick data, styling, axes, and frame options.
 * @returns {string} - Terminal chart text.
 */
export const candlestick: Candlestick = (value) => {
  const { spec, data } = assertSpec(value);
  const xDomain = resolveDomain(
    spec.xAxis,
    data.map(([x]) => x),
  );
  const yDomain = resolveDomain(
    spec.yAxis,
    data.flatMap(([, , high, low]) => [low, high]),
  );
  if (!xDomain || !yDomain) return '';

  const visible = data
    .filter((datum) => isVisible(datum, xDomain, yDomain))
    .sort((left, right) => left[0] - right[0]);
  const height = spec.height ?? DEFAULT_CHART_HEIGHT;
  const toY = scaler(yDomain, [0, height - 1]);
  const toRow = (y: number) => height - Math.round(toY(y));
  const style = resolveStyle(spec.style, spec.symbols);

  return renderChart({
    series: [
      {
        id: 'candlestick',
        data: visible.map(([x, , , , close]) => [x, close]),
        lineFormatter: ({ index, plotX }) =>
          createCandleSymbols({ datum: visible[index], plotX, toRow, style }),
      },
    ],
    width: spec.width,
    height: spec.height,
    title: spec.title,
    xAxis: withDomain(spec.xAxis, xDomain),
    yAxis: withDomain(spec.yAxis, yDomain),
    thresholds: spec.thresholds,
    symbols: spec.symbols,
    debugMode: spec.debugMode,
  });
};
