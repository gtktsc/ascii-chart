import plot, { renderChart } from '@ascii-chart';
import type { ChartSpec } from '@types';

describe('chart element coloring', () => {
  it('colors axes, labels, title, legend, value labels, border, and background independently', () => {
    const spec: ChartSpec<number> = {
      width: 12,
      height: 5,
      series: [{ id: 'series', data: [[0, 1]], mode: 'bar' }],
      title: 'T',
      titleColor: 'ansiBlue',
      xAxis: { domain: [0, 1], ticks: [0, 1], label: 'X', color: 'ansiRed' },
      yAxis: { domain: [0, 2], ticks: [0, 2], label: 'Y', color: 'ansiGreen' },
      legend: { position: 'bottom', color: 'ansiCyan' },
      borderColor: 'ansiMagenta',
      backgroundColor: 'ansiBrightBlack',
      symbols: {
        axis: { we: '-', ns: '|', x: '+', y: '+' },
        background: '.',
        border: '#',
      },
    };

    const chart = renderChart(spec);

    expect(chart).toContain('\u001b[34mT\u001b[0m');
    expect(chart).toContain('\u001b[31m-\u001b[0m');
    expect(chart).toContain('\u001b[32m|\u001b[0m');
    expect(chart).toContain('\u001b[31mX\u001b[0m');
    expect(chart).toContain('\u001b[32mY\u001b[0m');
    expect(chart).toContain('\u001b[36ms\u001b[0m');
    expect(chart).toContain('\u001b[35m#\u001b[0m');
    expect(chart).toContain('\u001b[90m.\u001b[0m');
  });

  it('colors bar value labels', () => {
    const chart = renderChart({
      width: 12,
      height: 5,
      series: [{ id: 'bar', data: [[0, 1]], mode: 'bar' }],
      xAxis: { domain: [0, 1], hideTicks: true },
      yAxis: { domain: [0, 2], hideTicks: true },
      valueLabels: { color: 'ansiYellow' },
    });

    expect(chart).toContain('\u001b[33m1\u001b[0m');
  });

  it('preserves value-label color while normalizing categorical axes', () => {
    const chart = renderChart({
      width: 18,
      height: 5,
      series: [{ id: 'bar', data: [['Q1', 3]], mode: 'bar' }],
      xAxis: { scale: 'band' },
      yAxis: { domain: [0, 4] },
      valueLabels: { color: 'ansiBrightCyan' },
    });

    expect(chart).toContain('\u001b[96m3\u001b[0m');
  });

  it('colors a secondary y-axis with its own axis color', () => {
    const spec: ChartSpec<number> = {
      width: 12,
      height: 5,
      series: [{ id: 'secondary', data: [[0, 10]], yAxis: 'secondary' }],
      xAxis: { domain: [0, 1], hideTicks: true },
      yAxis: { domain: [0, 1], hideTicks: true },
      secondaryYAxis: {
        domain: [0, 10],
        ticks: [0, 10],
        label: 'S',
        color: 'ansiBrightMagenta',
      },
      symbols: { axis: { ns: '|' } },
    };

    const chart = renderChart(spec);

    expect(chart).toContain('\u001b[95m|\u001b[0m');
    expect(chart).toContain('\u001b[95mS\u001b[0m');
  });

  it('uses the same structured color fields through plot', () => {
    const chart = plot([[0, 1]], {
      width: 8,
      height: 4,
      xAxis: { domain: [0, 1], label: 'X', color: 'ansiRed' },
      yAxis: { domain: [0, 2], label: 'Y', color: 'ansiGreen' },
      title: 'T',
      titleColor: 'ansiBlue',
    });

    expect(chart).toContain('\u001b[31mX\u001b[0m');
    expect(chart).toContain('\u001b[32mY\u001b[0m');
    expect(chart).toContain('\u001b[34mT\u001b[0m');
  });

  test.each([
    ['xAxis.color', () => renderChart({ series: [], xAxis: { color: 'red' as never } })],
    [
      'legend.color',
      () =>
        renderChart({
          series: [],
          legend: { position: 'bottom', color: 'red' as never },
        }),
    ],
    [
      'valueLabels.color',
      () => renderChart({ series: [], valueLabels: { color: 'red' as never } }),
    ],
    ['settings.backgroundColor', () => plot([], { backgroundColor: 'red' as never })],
  ])('validates %s', (path, render) => {
    expect(render).toThrow(path);
  });
});
