import { getAnsiColor, getChartSymbols } from '../settings';
import { Color } from '../../types/index';

describe('getAnsiColor', () => {
  describe.each([
    ['ansiBlack', '\u001b[30m'],
    ['ansiRed', '\u001b[31m'],
    ['ansiGreen', '\u001b[32m'],
    ['ansiYellow', '\u001b[33m'],
    ['ansiBlue', '\u001b[34m'],
    ['ansiMagenta', '\u001b[35m'],
    ['ansiCyan', '\u001b[36m'],
    ['ansiWhite', '\u001b[37m'],
    ['default', '\u001b[37m'],
  ])('', (input, output) => {
    it(input, () => {
      const formatted = getAnsiColor(input as Color);
      expect(formatted).toBe(output);
    });
  });
});

describe('getChartSymbols', () => {
  describe.each([
    ['ansiBlack', '\u001b[30m', 0],
    ['ansiRed', '\u001b[31m', 0],
    ['ansiGreen', '\u001b[32m', 0],
    ['ansiYellow', '\u001b[33m', 0],
    ['ansiBlue', '\u001b[34m', 0],
    ['ansiMagenta', '\u001b[35m', 0],
    ['ansiCyan', '\u001b[36m', 0],
    ['ansiWhite', '\u001b[37m', 0],
    ['default', '\u001b[37m', 0],
    [['ansiBlack', 'ansiRed'], '\u001b[30m', 0],
    [['ansiBlack', 'ansiRed'], '\u001b[31m', 1],
  ])('', (input, output, series) => {
    it(input.toString(), () => {
      const formatted = getChartSymbols(input as Color, series, undefined, [[]], false);
      expect(formatted.we).toBe(`${output}━\u001b[0m`);
      expect(formatted.wns).toBe(`${output}┓\u001b[0m`);
      expect(formatted.ns).toBe(`${output}┃\u001b[0m`);
      expect(formatted.nse).toBe(`${output}┗\u001b[0m`);
      expect(formatted.wsn).toBe(`${output}┛\u001b[0m`);
      expect(formatted.sne).toBe(`${output}┏\u001b[0m`);
      expect(formatted.area).toBe(`${output}█\u001b[0m`);
    });
  });
});
