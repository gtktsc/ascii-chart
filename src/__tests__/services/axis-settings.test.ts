import {
  assertAxisCenterInDomains,
  resolveSettingsAxes,
  resolveXAxisSettings,
  resolveYAxisSettings,
} from '@services/plot/layout/axes';

describe('plot axis normalization', () => {
  it('uses every structured property over its flat alias', () => {
    const formatter = (value: number) => `axis-${value}`;
    const { xAxis, yAxis } = resolveSettingsAxes({
      customXAxisTicks: [9],
      customYAxisTicks: [9],
      xLabel: 'flat x',
      yLabel: 'flat y',
      hideXAxis: true,
      hideYAxis: true,
      hideXAxisTicks: true,
      hideYAxisTicks: true,
      showTickLabel: true,
      yRange: [9, 10],
      xAxis: {
        domain: [0, 2],
        ticks: [0, 2],
        label: 'axis x',
        formatter,
        hidden: false,
        hideTicks: false,
      },
      yAxis: {
        domain: [0, 3],
        ticks: [0, 3],
        label: 'axis y',
        formatter,
        hidden: false,
        hideTicks: false,
        showTickLabel: false,
      },
    });

    expect(xAxis).toEqual({
      domain: [0, 2],
      ticks: [0, 2],
      label: 'axis x',
      formatter,
      hidden: false,
      hideTicks: false,
    });
    expect(yAxis).toEqual({
      domain: [0, 3],
      ticks: [0, 3],
      label: 'axis y',
      formatter,
      hidden: false,
      hideTicks: false,
      showTickLabel: false,
    });
  });

  it('falls back property-by-property to flat option aliases', () => {
    expect(
      resolveXAxisSettings({
        customXAxisTicks: [1],
        xLabel: 'x',
        hideXAxis: true,
        hideXAxisTicks: true,
      }),
    ).toMatchObject({ ticks: [1], label: 'x', hidden: true, hideTicks: true });
    expect(
      resolveYAxisSettings({
        yRange: [0, 1],
        customYAxisTicks: [1],
        yLabel: 'y',
        hideYAxis: true,
        hideYAxisTicks: true,
        showTickLabel: true,
      }),
    ).toMatchObject({
      domain: [0, 1],
      ticks: [1],
      label: 'y',
      hidden: true,
      hideTicks: true,
      showTickLabel: true,
    });
    expect(resolveSettingsAxes()).toEqual({
      xAxis: {
        domain: undefined,
        ticks: undefined,
        label: undefined,
        formatter: undefined,
        hidden: undefined,
        hideTicks: undefined,
      },
      yAxis: {
        domain: undefined,
        ticks: undefined,
        label: undefined,
        formatter: undefined,
        hidden: undefined,
        hideTicks: undefined,
        showTickLabel: undefined,
      },
    });
  });

  it('accepts partial centers and rejects either out-of-domain coordinate', () => {
    expect(() => assertAxisCenterInDomains([undefined, 1], [0, 1], [0, 1])).not.toThrow();
    expect(() => assertAxisCenterInDomains(undefined, [0, 1], [0, 1])).not.toThrow();
    expect(() => assertAxisCenterInDomains([2, 1], [0, 1], [0, 1])).toThrow(
      'settings.axisCenter[0]',
    );
    expect(() => assertAxisCenterInDomains([0, 2], [0, 1], [0, 1])).toThrow(
      'settings.axisCenter[1]',
    );
  });
});
