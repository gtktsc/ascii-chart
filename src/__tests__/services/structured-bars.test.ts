import { ChartSpec } from '@types';
import { assertStructuredBarAxisCenter } from '@services/chart/bars/structured';

describe('structured bar domain validation', () => {
  it('attributes an implicit baseline outside the domain to the axis domain', () => {
    const spec: ChartSpec = { series: [] };

    expect(() => assertStructuredBarAxisCenter(spec, [undefined, 0], [0, 1], [1, 2])).toThrow(
      'yAxis.domain: must fall within the resolved domain',
    );
  });
});
