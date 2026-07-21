import { ChartRangeError, ChartTypeError } from '@services/errors';
import { sparkline } from '@services/renderers/sparkline';

describe('sparkline', () => {
  it('maps a numeric range across all eight Unicode block levels', () => {
    expect(sparkline([0, 1, 2, 3, 4, 5, 6, 7])).toBe('▁▂▃▄▅▆▇█');
  });

  it('scales negative and positive values by numeric distance', () => {
    expect(sparkline([-4, -2, 0, 2, 4])).toBe('▁▃▅▇█');
  });

  it('preserves null positions as spaces, including trailing spaces', () => {
    expect(sparkline([1, null, 3, null])).toBe('▁ █ ');
  });

  it('uses a middle block for constant finite values', () => {
    expect(sparkline([5, 5, 5])).toBe('▄▄▄');
    expect(sparkline([5, null, 5])).toBe('▄ ▄');
  });

  it('scales finite values whose direct numeric range would overflow', () => {
    expect(sparkline([-Number.MAX_VALUE, Number.MAX_VALUE])).toBe('▁█');
  });

  it('handles empty and all-null input without losing positions', () => {
    expect(sparkline([])).toBe('');
    expect(sparkline([null, null, null])).toBe('   ');
  });

  it('applies one ANSI color to the rendered sparkline', () => {
    expect(sparkline([1, null, 3], { color: 'ansiGreen' })).toBe('\u001b[32m▁ █\u001b[0m');
  });

  it('applies colors by input position while leaving gaps and undefined colors plain', () => {
    expect(
      sparkline([1, null, 3, 2], {
        color: ['ansiRed', 'ansiYellow', 'ansiBlue', undefined],
      }),
    ).toBe('\u001b[31m▁\u001b[0m \u001b[34m█\u001b[0m▅');
  });

  it('colors values below and at or above a threshold', () => {
    expect(
      sparkline([1, 2, null, 3, 4], {
        threshold: {
          value: 3,
          belowColor: 'ansiBlue',
          aboveColor: 'ansiRed',
        },
      }),
    ).toBe('\u001b[34m▁\u001b[0m\u001b[34m▃\u001b[0m \u001b[31m▆\u001b[0m\u001b[31m█\u001b[0m');
  });

  it('does not emit ANSI escapes for an empty colored sparkline', () => {
    expect(sparkline([], { color: 'ansiGreen' })).toBe('');
  });

  it('does not mutate input', () => {
    const values = [3, null, 1];
    const original = [...values];

    sparkline(values);

    expect(values).toEqual(original);
  });

  it.each([
    [[1, Number.NaN], 'values[1]', ChartRangeError],
    [[Number.NEGATIVE_INFINITY], 'values[0]', ChartRangeError],
    [[1, '2'] as never, 'values[1]', ChartTypeError],
    ['bad' as never, 'values', ChartTypeError],
  ])('rejects invalid input %#', (input, path, ErrorClass) => {
    expect(() => sparkline(input as never)).toThrow(ErrorClass as unknown as ErrorConstructor);
    expect(() => sparkline(input as never)).toThrow(path as string);
  });

  it.each([
    ['bad' as never, 'options', ChartTypeError],
    [{ color: 'green' } as never, 'options.color', ChartRangeError],
  ])('rejects invalid options %#', (options, path, ErrorClass) => {
    expect(() => sparkline([1, 2], options)).toThrow(ErrorClass as unknown as ErrorConstructor);
    expect(() => sparkline([1, 2], options)).toThrow(path as string);
  });

  it('validates options even when values are empty', () => {
    expect(() => sparkline([], { color: 'green' } as never)).toThrow('options.color');
  });

  it('requires one configured color per input position', () => {
    expect(() => sparkline([1, 2], { color: ['ansiRed'] })).toThrow('options.color');
  });

  it('reports invalid indexed colors at their exact path', () => {
    expect(() => sparkline([1, 2], { color: ['ansiRed', 'red'] } as never)).toThrow(
      'options.color[1]',
    );
  });

  it.each([
    [
      { threshold: { value: Number.NaN, belowColor: 'ansiBlue', aboveColor: 'ansiRed' } },
      'options.threshold.value',
      ChartRangeError,
    ],
    [
      { threshold: { value: 2, belowColor: 'blue', aboveColor: 'ansiRed' } },
      'options.threshold.belowColor',
      ChartRangeError,
    ],
    [
      { threshold: { value: 2, belowColor: 'ansiBlue' } },
      'options.threshold.aboveColor',
      ChartTypeError,
    ],
    [
      {
        color: 'ansiGreen',
        threshold: { value: 2, belowColor: 'ansiBlue', aboveColor: 'ansiRed' },
      },
      'options',
      ChartTypeError,
    ],
  ])('rejects invalid threshold coloring %#', (options, path, ErrorClass) => {
    expect(() => sparkline([1, 2], options as never)).toThrow(
      ErrorClass as unknown as ErrorConstructor,
    );
    expect(() => sparkline([1, 2], options as never)).toThrow(path as string);
  });
});
