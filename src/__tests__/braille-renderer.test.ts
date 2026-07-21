import { plot } from '@services/plot/plot';

describe('Braille renderer', () => {
  it('renders legacy plot input through 2-by-4 subcells', () => {
    const chart = plot(
      [
        [0, 0],
        [1, 1],
      ],
      {
        renderer: 'braille',
        interpolation: 'linear',
        width: 4,
        height: 2,
        color: 'ansiRed',
      },
    );

    expect(chart).toMatch(/[\u2801-\u28ff]/u);
    expect(chart).toContain('\u001b[31m');
  });

  it('renders formatted value labels outside grouped bars', () => {
    const chart = plot(
      [
        [
          [0, 12],
          [1, 18],
          [2, 9],
        ],
        [
          [0, 8],
          [1, 14],
          [2, 16],
        ],
      ],
      {
        renderer: 'braille',
        mode: 'bar',
        barLayout: 'grouped',
        valueLabels: { formatter: (value) => `$${value}` },
        width: 24,
        height: 12,
      },
    );

    expect(chart).toContain('$9');
    expect(chart).toContain('$16');
  });

  it('does not fold left-side fill past the y axis', () => {
    const chart = plot(
      [
        [-4, -3],
        [-3, 2],
        [-2, -1],
        [-1, 3],
      ],
      {
        renderer: 'braille',
        width: 24,
        height: 8,
        fillArea: true,
        hideXAxisTicks: true,
        axisCenter: [0, 0],
        xAxis: { domain: [-5, 0] },
        yAxis: { domain: [-5, 5] },
      },
    );

    chart.split('\n').forEach((row) => {
      const axisColumn = Math.max(row.indexOf('┤'), row.indexOf('│'), row.indexOf('┼'));
      if (axisColumn >= 0) expect(row.slice(axisColumn + 1)).not.toMatch(/[\u2801-\u28ff]/u);
    });
  });
});
