import { drawGraph } from '@services/plot/draw/position';
import { getRendererBackend } from '@services/renderers/backends';
import { foldBrailleGraph, toTerminalCellCoordinate } from '@services/renderers/braille';

describe('foldBrailleGraph', () => {
  it.each([
    [0, 0, '⠁'],
    [0, 1, '⠂'],
    [0, 2, '⠄'],
    [1, 0, '⠈'],
    [1, 1, '⠐'],
    [1, 2, '⠠'],
    [0, 3, '⡀'],
    [1, 3, '⢀'],
  ])('maps subcell (%i, %i) to its Unicode Braille dot', (x, y, expected) => {
    const source = drawGraph({ plotWidth: 2, plotHeight: 4, emptySymbol: ' ' });
    source[y + 1][x + 1] = 'X';

    const result = foldBrailleGraph(source, {
      plotWidth: 1,
      plotHeight: 1,
      emptySymbol: ' ',
    });

    expect(result[1][1]).toBe(expected);
  });

  it('combines all eight subcells into one full Braille cell', () => {
    const source = drawGraph({ plotWidth: 2, plotHeight: 4, emptySymbol: ' ' });
    for (let y = 1; y <= 4; y++) {
      for (let x = 1; x <= 2; x++) source[y][x] = 'X';
    }

    const result = foldBrailleGraph(source, {
      plotWidth: 1,
      plotHeight: 1,
      emptySymbol: ' ',
    });

    expect(result[1][1]).toBe('⣿');
  });

  it('keeps empty cells empty and preserves graph padding', () => {
    const source = drawGraph({ plotWidth: 4, plotHeight: 8, emptySymbol: '.' });

    expect(foldBrailleGraph(source, { plotWidth: 2, plotHeight: 2, emptySymbol: '.' })).toEqual(
      drawGraph({ plotWidth: 2, plotHeight: 2, emptySymbol: '.' }),
    );
  });

  it('treats missing internal subcell rows as empty', () => {
    expect(foldBrailleGraph([], { plotWidth: 1, plotHeight: 1, emptySymbol: ' ' })).toEqual(
      drawGraph({ plotWidth: 1, plotHeight: 1, emptySymbol: ' ' }),
    );
  });

  it('uses the last occupied subcell style for a mixed-color cell', () => {
    const source = drawGraph({ plotWidth: 2, plotHeight: 4, emptySymbol: ' ' });
    source[1][1] = '\u001b[31mX\u001b[0m';
    source[4][2] = '\u001b[34mX\u001b[0m';

    const result = foldBrailleGraph(source, {
      plotWidth: 1,
      plotHeight: 1,
      emptySymbol: ' ',
    });

    expect(result[1][1]).toBe('\u001b[34m⢁\u001b[0m');
  });

  it('uses only highest-priority subcells for a mixed-color cell', () => {
    const source = drawGraph({ plotWidth: 2, plotHeight: 4, emptySymbol: ' ' });
    source[1][1] = '\u001b[31mX\u001b[0m';
    source[4][2] = '\u001b[34mX\u001b[0m';
    const cellPriorities = source.map((row) => row.map(() => -1));
    cellPriorities[1][1] = 2;
    cellPriorities[4][2] = 1;

    const result = foldBrailleGraph(source, {
      plotWidth: 1,
      plotHeight: 1,
      emptySymbol: ' ',
      cellPriorities,
    });

    expect(result[1][1]).toBe('\u001b[31m⠁\u001b[0m');
  });

  it('replaces the visible symbol without corrupting ANSI terminators', () => {
    const source = drawGraph({ plotWidth: 2, plotHeight: 4, emptySymbol: ' ' });
    source[1][1] = '\u001b[31mm\u001b[0m';

    const result = foldBrailleGraph(source, {
      plotWidth: 1,
      plotHeight: 1,
      emptySymbol: ' ',
    });

    expect(result[1][1]).toBe('\u001b[31m⠁\u001b[0m');
  });
});

describe('renderer backend', () => {
  it('keeps ASCII graphs at terminal-cell resolution', () => {
    const graph = drawGraph({ plotWidth: 1, plotHeight: 1, emptySymbol: ' ' });
    const backend = getRendererBackend('ascii');

    expect(backend.foldGraph(graph, { plotWidth: 1, plotHeight: 1, emptySymbol: ' ' })).toBe(graph);
    expect([backend.subcellWidth, backend.subcellHeight]).toEqual([1, 1]);
  });

  it('exposes the 2-by-4 Braille raster scale', () => {
    const backend = getRendererBackend('braille');

    expect([backend.subcellWidth, backend.subcellHeight]).toEqual([2, 4]);
  });

  it.each([
    [-1, 2, -1],
    [0, 2, 0],
    [1, 2, 1],
    [2, 2, 1],
    [3, 2, 2],
    [4, 4, 1],
    [5, 4, 2],
  ])('maps padded coordinate %i at scale %i to cell %i', (coordinate, scale, expected) => {
    expect(toTerminalCellCoordinate(coordinate, scale)).toBe(expected);
  });
});
