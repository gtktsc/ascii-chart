import { PlotCoordinates, Settings } from '@types';
import { plotOptionExamples } from '@examples/plot-options';

const plot = jest.fn((_data: PlotCoordinates, settings: Settings) =>
  settings.formatter!(2, { axis: 'x', xRange: [0, 4], yRange: [-2, 4] }),
);

jest.mock('../services/plot/plot', () => ({
  plot: (data: PlotCoordinates, settings: Settings) => plot(data, settings),
}));

describe('plot option examples', () => {
  it('configures the flat formatter that structured axes override', () => {
    const example = plotOptionExamples.find(({ title }) =>
      title.startsWith('structured axis objects override flat aliases'),
    );

    expect(example?.render()).toBe('flat:2');
    expect(plot).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        formatter: expect.any(Function),
        xAxis: expect.objectContaining({ formatter: expect.any(Function) }),
        yAxis: expect.objectContaining({ formatter: expect.any(Function) }),
      }),
    );
  });
});
