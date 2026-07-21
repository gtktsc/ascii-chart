import { displayWidth } from '@helpers/terminal-text';
import {
  measureLegendWidth,
  resolveAspectHeight,
  resolveAutoPlotWidth,
  resolveLegendPosition,
  resolveTerminalColumns,
  resolveXAxisTickLayout,
} from '@services/plot/layout/adaptive';

describe('adaptive layout', () => {
  it('resolves terminal columns with a deterministic fallback', () => {
    expect(resolveTerminalColumns(120)).toBe(120);
    expect(resolveTerminalColumns(0)).toBe(80);
    expect(resolveTerminalColumns(1.5)).toBe(80);
    expect(resolveTerminalColumns(undefined)).toBe(80);
  });

  it('derives physical height using terminal cell correction', () => {
    expect(resolveAspectHeight(80, 2)).toBe(20);
    expect(resolveAspectHeight(80, 1)).toBe(40);
    expect(resolveAspectHeight(4, 20)).toBe(3);
  });

  it('moves automatic legends below narrow charts', () => {
    expect(
      resolveLegendPosition({
        position: 'auto',
        terminalColumns: 100,
        fixedPlotWidth: 60,
        baseOverhead: 8,
        legendWidth: 10,
      }),
    ).toBe('right');
    expect(
      resolveLegendPosition({
        position: 'auto',
        terminalColumns: 50,
        fixedPlotWidth: 40,
        baseOverhead: 8,
        legendWidth: 10,
      }),
    ).toBe('bottom');
    expect(
      resolveLegendPosition({
        position: 'left',
        terminalColumns: 20,
        fixedPlotWidth: 20,
        baseOverhead: 8,
        legendWidth: 10,
      }),
    ).toBe('left');
  });

  it('reserves side decorations inside the terminal budget', () => {
    expect(measureLegendWidth(undefined)).toBe(0);
    expect(measureLegendWidth({ position: 'bottom' })).toBe(0);
    expect(measureLegendWidth({ position: 'bottom', series: 'A' })).toBe(3);
    expect(measureLegendWidth({ position: 'right', series: ['A', 'Wide 界'] })).toBe(9);
    expect(
      resolveAutoPlotWidth({
        terminalColumns: 40,
        baseOverhead: 7,
        legendPosition: 'right',
        legendWidth: 9,
      }),
    ).toBe(22);
    expect(
      resolveAutoPlotWidth({
        terminalColumns: 40,
        baseOverhead: 7,
        legendPosition: 'bottom',
        legendWidth: 9,
      }),
    ).toBe(33);
    expect(
      resolveAutoPlotWidth({
        terminalColumns: 40,
        baseOverhead: 7,
        legendPosition: 'left',
        legendWidth: 9,
      }),
    ).toBe(24);
    expect(
      resolveAutoPlotWidth({
        terminalColumns: 5,
        baseOverhead: 7,
        legendPosition: 'top',
        legendWidth: 9,
      }),
    ).toBe(1);
  });

  it('keeps labels unchanged when they already fit', () => {
    const layout = resolveXAxisTickLayout({
      ticks: [0, 1],
      width: 10,
      xDomain: [0, 1],
      yDomain: [0, 1],
      formatter: (value) => value,
      policy: 'hide',
      path: 'xAxis.ticks',
    });

    expect(layout.map(({ lines }) => lines)).toEqual([['0'], ['1']]);
  });

  it('thins colliding labels while retaining endpoints', () => {
    const layout = resolveXAxisTickLayout({
      ticks: [0, 25, 50, 75, 100],
      width: 16,
      xDomain: [0, 100],
      yDomain: [0, 1],
      formatter: (value) => `tick-${value}`,
      policy: 'hide',
      path: 'xAxis.ticks',
    });

    expect(layout.map(({ value }) => value)).toEqual([0, 100]);
    expect(layout.map(({ lines }) => lines)).toEqual([['tick-0'], ['tick-100']]);

    const endpoints = resolveXAxisTickLayout({
      ticks: [0, 0.5, 1],
      width: 5,
      xDomain: [0, 1],
      yDomain: [0, 1],
      formatter: (value) => (value === 0.5 ? 'xxx' : 'aa'),
      policy: 'hide',
      path: 'xAxis.ticks',
    });
    expect(endpoints.map(({ value }) => value)).toEqual([0, 1]);

    const firstOnly = resolveXAxisTickLayout({
      ticks: [0, 0.5, 1],
      width: 4,
      xDomain: [0, 1],
      yDomain: [0, 1],
      formatter: () => 'long',
      policy: 'hide',
      path: 'xAxis.ticks',
    });
    expect(firstOnly.map(({ value }) => value)).toEqual([0]);

    const twoColliding = resolveXAxisTickLayout({
      ticks: [0, 1],
      width: 2,
      xDomain: [0, 1],
      yDomain: [0, 1],
      formatter: () => 'long',
      policy: 'hide',
      path: 'xAxis.ticks',
    });
    expect(twoColliding.map(({ value }) => value)).toEqual([0]);
  });

  it('leaves a blank column between visible labels', () => {
    const layout = resolveXAxisTickLayout({
      ticks: [0, 1, 2],
      width: 9,
      xDomain: [0, 2],
      yDomain: [0, 1],
      formatter: () => 'aaa',
      policy: 'hide',
      path: 'xAxis.ticks',
    });

    expect(layout.map(({ value }) => value)).toEqual([0, 2]);
  });

  it('truncates labels into their tick slots', () => {
    const layout = resolveXAxisTickLayout({
      ticks: [0, 50, 100],
      width: 9,
      xDomain: [0, 100],
      yDomain: [0, 1],
      formatter: (value) => `value-${value}`,
      policy: 'truncate',
      path: 'xAxis.ticks',
    });

    expect(layout).toHaveLength(3);
    expect(layout.every(({ lines }) => lines.length === 1)).toBe(true);
    expect(layout.every(({ lines, slotWidth }) => displayWidth(lines[0]) <= slotWidth)).toBe(true);
    expect(layout.some(({ lines }) => lines[0].includes('…'))).toBe(true);

    const narrow = resolveXAxisTickLayout({
      ticks: [0, 1],
      width: 2,
      xDomain: [0, 1],
      yDomain: [0, 1],
      formatter: () => 'long',
      policy: 'truncate',
      path: 'xAxis.ticks',
    });
    expect(narrow.map(({ lines }) => lines)).toEqual([['…'], ['…']]);

    expect(
      resolveXAxisTickLayout({
        ticks: [0],
        width: 5,
        xDomain: [0, 1],
        yDomain: [0, 1],
        formatter: () => 'ok',
        policy: 'truncate',
        path: 'xAxis.ticks',
      })[0].lines,
    ).toEqual(['ok']);
  });

  it('wraps labels into additional rows', () => {
    const layout = resolveXAxisTickLayout({
      ticks: [0, 1],
      width: 6,
      xDomain: [0, 1],
      yDomain: [0, 1],
      formatter: () => 'abcdef',
      policy: 'wrap',
      path: 'xAxis.ticks',
    });

    expect(layout.map(({ lines }) => lines)).toEqual([
      ['abc', 'def'],
      ['abc', 'def'],
    ]);

    expect(
      resolveXAxisTickLayout({
        ticks: [0],
        width: 2,
        xDomain: [0, 0],
        yDomain: [0, 1],
        formatter: () => '',
        policy: 'wrap',
        path: 'xAxis.ticks',
      })[0].lines,
    ).toEqual(['']);

    const wide = resolveXAxisTickLayout({
      ticks: [0, 1],
      width: 2,
      xDomain: [0, 1],
      yDomain: [0, 1],
      formatter: () => '🙂',
      policy: 'wrap',
      path: 'xAxis.ticks',
    });
    expect(wide.map(({ lines }) => lines)).toEqual([['…'], ['…']]);
  });

  it('preserves a partial row before replacing an over-wide grapheme', () => {
    const layout = resolveXAxisTickLayout({
      ticks: [0],
      width: 1,
      xDomain: [0, 1],
      yDomain: [0, 1],
      formatter: () => 'a界',
      policy: 'wrap',
      path: 'xAxis.ticks',
      ellipsis: '~',
    });

    expect(layout[0].lines).toEqual(['a', '~']);
  });

  it('preserves the label-fit error policy', () => {
    expect(
      resolveXAxisTickLayout({
        ticks: [0],
        width: 2,
        xDomain: [0, 0],
        yDomain: [0, 1],
        formatter: () => '0',
        policy: 'error',
        path: 'xAxis.ticks',
      })[0].lines,
    ).toEqual(['0']);

    expect(() =>
      resolveXAxisTickLayout({
        ticks: [0, 1],
        width: 2,
        xDomain: [0, 1],
        yDomain: [0, 1],
        formatter: () => 'long',
        policy: 'error',
        path: 'xAxis.ticks',
      }),
    ).toThrow(/xAxis.ticks/);

    expect(() =>
      resolveXAxisTickLayout({
        ticks: [0],
        width: 2,
        xDomain: [0, 1],
        yDomain: [0, 1],
        formatter: () => 'long',
        policy: 'error',
        path: 'xAxis.ticks',
      }),
    ).toThrow(/xAxis.ticks/);
  });
});
