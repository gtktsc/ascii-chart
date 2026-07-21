import { GRAPHEME_SEGMENTER } from '@constants/terminal';
import {
  assertCellSymbol,
  assertDisplayText,
  assertDisplayValue,
  displayWidth,
  stripAnsi,
  toDisplayCells,
  toDisplayTokens,
} from '@helpers/terminal-text';

describe('terminal text', () => {
  it('skips Unicode segmentation for printable ASCII', () => {
    const segment = jest.spyOn(GRAPHEME_SEGMENTER, 'segment');

    expect(toDisplayTokens('ASCII')).toEqual(Array.from('ASCII', (text) => ({ text, width: 1 })));
    expect(toDisplayCells('plain ASCII 123')).toEqual(Array.from('plain ASCII 123'));
    expect(displayWidth(-123.45)).toBe(7);
    expect(segment).not.toHaveBeenCalled();
    segment.mockRestore();
  });

  it.each([
    ['ascii', 5],
    ['e\u0301', 1],
    ['界', 2],
    ['🙂', 2],
    ['👨‍👩‍👧‍👦', 2],
    ['🇵🇱', 2],
    ['1️⃣', 2],
    ['✈️', 2],
    ['́', 1],
    ['\u001b[31m界\u001b[0m', 2],
  ])('measures %s by terminal columns', (value, width) => {
    expect(displayWidth(value)).toBe(width);
    expect(toDisplayCells(value)).toHaveLength(width);
  });

  it('preserves styled grapheme clusters while reserving continuation columns', () => {
    expect(toDisplayCells('\u001b[31m界\u001b[0m')).toEqual(['\u001b[31m界\u001b[0m', '']);
    expect(toDisplayTokens('Ae\u0301界')).toEqual([
      { text: 'A', width: 1 },
      { text: 'e\u0301', width: 1 },
      { text: '界', width: 2 },
    ]);
  });

  it.each([
    [0x10ff, 1],
    [0x1100, 2],
    [0x115f, 2],
    [0x1160, 1],
    [0x2329, 2],
    [0x232a, 2],
    [0x2e80, 2],
    [0x303f, 1],
    [0xa4cf, 2],
    [0xa4d0, 1],
    [0xac00, 2],
    [0xf900, 2],
    [0xfe10, 2],
    [0xfe30, 2],
    [0xff00, 2],
    [0xffe0, 2],
    [0x1b000, 2],
    [0x1f200, 2],
    [0x20000, 2],
    [0x3fffd, 2],
    [0x3fffe, 1],
    [0x00b7, 1],
  ])('classifies U+%s terminal width', (codePoint, width) => {
    expect(displayWidth(String.fromCodePoint(codePoint))).toBe(width);
  });

  it('handles ANSI-only and trailing-style text without visible cells', () => {
    expect(toDisplayTokens('\u001b[31m')).toEqual([]);
    expect(toDisplayTokens('A\u001b[31m')).toEqual([{ text: 'A\u001b[31m', width: 1 }]);
    expect(stripAnsi('\u001b[31mA\u001b[m')).toBe('A');
  });

  it.each([
    [() => assertDisplayText(1, 'label'), TypeError, 'label'],
    [() => assertDisplayText('\u0080', 'label'), RangeError, 'label'],
    [() => assertDisplayText('\u001b]0;title', 'label'), RangeError, 'label'],
    [() => assertDisplayValue(Number.NaN, 'formatter.result'), RangeError, 'formatter.result'],
    [() => assertDisplayValue({}, 'formatter.result'), TypeError, 'formatter.result'],
    [() => assertCellSymbol('', 'symbol'), RangeError, 'symbol'],
  ])('rejects unsafe terminal value', (call, ErrorClass, path) => {
    expect(call).toThrow(ErrorClass as ErrorConstructor);
    expect(call).toThrow(path as string);
  });

  it('accepts safe numeric and styled values', () => {
    expect(assertDisplayValue(3, 'value')).toBe(3);
    expect(assertDisplayValue('\u001b[1mok\u001b[0m', 'value')).toContain('ok');
    expect(assertCellSymbol('e\u0301', 'symbol')).toBe('é');
  });
});
