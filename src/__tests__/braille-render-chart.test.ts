import { renderChart } from '@services/chart/render';

describe('Braille structured renderer', () => {
  it('renders line geometry while keeping axes as text cells', () => {
    const chart = renderChart({
      renderer: 'braille',
      width: 6,
      height: 3,
      series: [
        {
          id: 'signal',
          data: [
            [0, 0],
            [1, 1],
            [2, 0.25],
          ],
          interpolation: 'linear',
          color: 'ansiCyan',
        },
      ],
      xAxis: { domain: [0, 2], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 1], hidden: true, hideTicks: true },
    });

    expect(chart).toMatch(/[\u2801-\u28ff]/u);
    expect(chart).toContain('\u001b[36m');
    expect(chart).not.toMatch(/[━┃┏┓┗┛]/u);
  });

  it('keeps grouped bar series in independently colored terminal cells', () => {
    const chart = renderChart({
      renderer: 'braille',
      width: 6,
      height: 4,
      barLayout: 'grouped',
      series: [
        { id: 'red', data: [[0, 3]], mode: 'bar', color: 'ansiRed' },
        { id: 'blue', data: [[0, 3]], mode: 'bar', color: 'ansiBlue' },
      ],
      xAxis: { domain: [0, 1], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 3], hidden: true, hideTicks: true },
    });

    expect(chart).toContain('\u001b[31m');
    expect(chart).toContain('\u001b[34m');
  });

  it('keeps a later line one dot thick when it shares a Braille cell with a bar', () => {
    const chart = renderChart({
      renderer: 'braille',
      width: 2,
      height: 1,
      series: [
        { id: 'bar', data: [[0, 4]], mode: 'bar', color: 'ansiBrightBlue' },
        {
          id: 'line',
          data: [
            [0, 1],
            [1, 3],
          ],
          color: 'ansiBrightGreen',
        },
      ],
      xAxis: { domain: [0, 1], hidden: true, hideTicks: true },
      yAxis: { domain: [0, 4], hidden: true, hideTicks: true },
    });

    expect(chart).toContain('\u001b[92m⠤\u001b[0m');
  });
});
