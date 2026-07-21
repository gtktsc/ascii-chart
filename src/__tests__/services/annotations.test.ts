import { AnnotationSymbols, Graph } from '@types';
import { ESCAPE } from '@constants/terminal';
import { drawAnnotations } from '@services/chart/annotations/draw';
import type { NumericAnnotation } from '@services/chart/annotations/types';

const createGraph = (fill = ' '): Graph =>
  Array.from({ length: 6 }, () => Array.from({ length: 10 }, () => fill));

const draw = (
  graph: Graph,
  annotations: readonly NumericAnnotation[],
  phase: 'background' | 'foreground',
  symbols?: AnnotationSymbols,
) =>
  drawAnnotations({
    graph,
    annotations,
    phase,
    plotWidth: 8,
    plotHeight: 4,
    xDomain: [0, 10],
    yDomain: [0, 10],
    emptySymbol: ' ',
    symbols,
  });

describe('annotation rasterization', () => {
  it('clips X and Y spans to plot bounds and fills only unoccupied cells', () => {
    const graph = createGraph();
    graph[2][5] = 'D';

    draw(
      graph,
      [
        { id: 'x', type: 'span', axis: 'x', from: -5, to: 2, symbol: 'x' },
        { id: 'y', type: 'span', axis: 'y', from: 4, to: 6, symbol: 'y' },
      ],
      'background',
    );

    expect(graph[1].slice(1, 3)).toEqual(['x', 'x']);
    expect(graph[2].slice(1, 9)).toEqual(['y', 'y', 'y', 'y', 'D', 'y', 'y', 'y']);
    expect(graph[3].slice(1, 9)).toEqual(Array(8).fill('y'));
    expect(graph[4].slice(1, 3)).toEqual(['x', 'x']);
  });

  it('omits spans outside their selected domain', () => {
    const graph = createGraph();

    draw(
      graph,
      [{ id: 'outside', type: 'span', axis: 'x', from: 20, to: 30, symbol: 'x' }],
      'background',
    );

    expect(graph).toEqual(createGraph());
  });

  it('places terminal-width-aware text on the selected side of its anchor', () => {
    const graph = createGraph();

    draw(
      graph,
      [
        { id: 'left', type: 'text', x: 5, y: 10, text: 'LEFT', align: 'left' },
        { id: 'center', type: 'text', x: 5, y: 5, text: 'A界', align: 'center' },
        { id: 'right', type: 'text', x: 5, y: 0, text: 'RIGHT', align: 'right' },
      ],
      'foreground',
    );

    expect(graph[1].slice(2, 6)).toEqual(['L', 'E', 'F', 'T']);
    expect(graph[2].slice(4, 7)).toEqual(['A', '界', '']);
    expect(graph[4].slice(4, 9)).toEqual(['R', 'I', 'G', 'H', 'T']);
  });

  it('keeps complete text labels inside both horizontal plot boundaries', () => {
    const graph = createGraph();

    draw(
      graph,
      [
        { id: 'start', type: 'text', x: 0, y: 10, text: 'START', align: 'center' },
        { id: 'end', type: 'text', x: 10, y: 0, text: 'END', align: 'center' },
      ],
      'foreground',
    );

    expect(graph[1].slice(1, 6)).toEqual(['S', 'T', 'A', 'R', 'T']);
    expect(graph[4].slice(6, 9)).toEqual(['E', 'N', 'D']);
  });

  it('clips text cells that are wider than the complete plot', () => {
    const graph = createGraph();

    draw(
      graph,
      [{ id: 'wide', type: 'text', x: 0, y: 5, text: 'LONGER-THAN-PLOT', align: 'right' }],
      'foreground',
    );

    expect(graph[2].slice(1, 9).join('')).toBe('LONGER-T');
  });

  it('applies one ANSI color to every visible text cell', () => {
    const graph = createGraph();

    draw(
      graph,
      [{ id: 'colored', type: 'text', x: 5, y: 5, text: 'OK', color: 'ansiRed' }],
      'foreground',
    );

    expect(graph[2][5]).toBe(`${ESCAPE}[31mO${ESCAPE}[0m`);
    expect(graph[2][6]).toBe(`${ESCAPE}[31mK${ESCAPE}[0m`);
  });

  it('draws a clipped Bresenham arrow with a direction-aware target head', () => {
    const graph = createGraph();

    draw(graph, [{ id: 'growth', type: 'arrow', from: [-5, -5], to: [10, 10] }], 'foreground');

    expect(graph.flat()).toContain('·');
    expect(graph[1][8]).toBe('↗');
  });

  it('omits arrows whose segment never intersects the plot', () => {
    const graph = createGraph();

    draw(graph, [{ id: 'outside', type: 'arrow', from: [-10, -10], to: [-5, -5] }], 'foreground');

    expect(graph).toEqual(createGraph());
  });

  it('draws a clipped line without a head when its arrow target is outside', () => {
    const graph = createGraph();

    draw(graph, [{ id: 'exit', type: 'arrow', from: [5, 5], to: [20, 5] }], 'foreground');

    expect(graph.flat()).toContain('·');
    expect(graph.flat()).not.toContain('→');
  });

  it('clips vertical arrows and omits a parallel segment outside the X domain', () => {
    const graph = createGraph();

    draw(
      graph,
      [
        { id: 'inside', type: 'arrow', from: [5, -5], to: [5, 10] },
        { id: 'outside', type: 'arrow', from: [-5, 0], to: [-5, 10] },
      ],
      'foreground',
    );

    expect(graph[1][5]).toBe('↑');
    expect(graph.flat()).not.toContain('←');
  });

  it.each([
    [[5, 5], [10, 5], '→'],
    [[5, 5], [0, 5], '←'],
    [[5, 5], [5, 10], '↑'],
    [[5, 5], [5, 0], '↓'],
    [[5, 5], [0, 10], '↖'],
    [[5, 5], [0, 0], '↙'],
  ] as const)('selects the arrow head for %j to %j', (from, to, head) => {
    const graph = createGraph();

    draw(graph, [{ id: 'arrow', type: 'arrow', from, to }], 'foreground');

    expect(graph.flat()).toContain(head);
  });

  it.each([
    [[5, 5], [10, 5], '>'],
    [[5, 5], [0, 5], '<'],
    [[5, 5], [5, 10], '^'],
    [[5, 5], [5, 0], 'v'],
    [[5, 5], [0, 10], '1'],
    [[5, 5], [10, 10], '2'],
    [[5, 5], [0, 0], '3'],
    [[5, 5], [10, 0], '4'],
  ] as const)('uses custom arrow head for %j to %j', (from, to, head) => {
    const graph = createGraph();
    const symbols = {
      arrowLine: '~',
      arrowHeads: {
        left: '<',
        right: '>',
        up: '^',
        down: 'v',
        upLeft: '1',
        upRight: '2',
        downLeft: '3',
        downRight: '4',
      },
    } as const;

    draw(graph, [{ id: 'custom', type: 'arrow', from, to }], 'foreground', symbols);

    expect(graph.flat()).toContain('~');
    expect(graph.flat()).toContain(head);
  });

  it('uses every custom span and error-bar piece', () => {
    const spanGraph = createGraph();
    draw(spanGraph, [{ id: 'span', type: 'span', axis: 'x', from: 2, to: 4 }], 'background', {
      span: 's',
    });
    expect(spanGraph.flat()).toContain('s');

    const errorGraph = createGraph();
    draw(
      errorGraph,
      [{ id: 'error', type: 'errorBar', x: 5, y: 5, xError: 5, yError: 5 }],
      'foreground',
      {
        errorBar: {
          horizontal: '-',
          vertical: '|',
          leftCap: '[',
          rightCap: ']',
          topCap: '^',
          bottomCap: 'v',
          center: '+',
        },
      },
    );
    ['-', '|', '[', ']', '^', 'v', '+'].forEach((symbol) =>
      expect(errorGraph.flat()).toContain(symbol),
    );
  });

  it('draws symmetric and asymmetric error bars with caps and a shared center', () => {
    const graph = createGraph();

    draw(
      graph,
      [{ id: 'error', type: 'errorBar', x: 5, y: 5, xError: 5, yError: [5, 5] }],
      'foreground',
    );

    expect(graph[2][1]).toBe('├');
    expect(graph[2][8]).toBe('┤');
    expect(graph[1][5]).toBe('┬');
    expect(graph[4][5]).toBe('┴');
    expect(graph[2][5]).toBe('┼');
    expect(graph[2].slice(2, 5)).toEqual(['─', '─', '─']);
    expect(graph[3][5]).toBe('│');
  });

  it('clips error whiskers and collapses zero magnitudes at the center', () => {
    const graph = createGraph();

    draw(
      graph,
      [
        { id: 'clipped', type: 'errorBar', x: 0, y: 10, xError: [5, 20] },
        { id: 'zero', type: 'errorBar', x: 10, y: 0, yError: 0 },
      ],
      'foreground',
    );

    expect(graph[1][1]).toBe('┼');
    expect(graph[1][8]).toBe('┤');
    expect(graph[4][8]).toBe('┼');
  });

  it('omits text and error bars whose anchors are outside either domain', () => {
    const graph = createGraph();

    draw(
      graph,
      [
        { id: 'text-x', type: 'text', x: -1, y: 5, text: 'X' },
        { id: 'text-y', type: 'text', x: 5, y: 11, text: 'Y' },
        { id: 'error-x', type: 'errorBar', x: 11, y: 5, xError: 1 },
        { id: 'error-y', type: 'errorBar', x: 5, y: -1, yError: 1 },
      ],
      'foreground',
    );

    expect(graph).toEqual(createGraph());
  });

  it('renders only spans in background phase and only foreground variants later', () => {
    const graph = createGraph();
    const annotations = [
      { id: 'span', type: 'span', axis: 'y', from: 0, to: 10, symbol: 's' },
      { id: 'text', type: 'text', x: 5, y: 5, text: 'T' },
    ] as const satisfies readonly NumericAnnotation[];

    draw(graph, annotations, 'background');
    expect(graph.flat()).not.toContain('T');

    draw(graph, annotations, 'foreground');
    expect(graph.flat()).toContain('T');
  });
});
