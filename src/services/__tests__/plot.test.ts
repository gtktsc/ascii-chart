import {
  scaler, getExtrema, getPlotCoords, plot,
} from '../plot';

import { type PlotCoords } from '../../types';

describe('plotter', () => {
  describe('getPlotCoords', () => {
    describe.each([
      [
        'returns proper data',
        [
          [0, 0],
          [1, 1],
        ],
        2,
        2,
        [
          [0, 0],
          [1, 1],
        ],
      ],
      [
        'scales data',
        [
          [0, 0],
          [1, 1],
        ],
        4,
        4,
        [
          [0, 0],
          [3, 3],
        ],
      ],
      [
        'returns proper range',
        [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
        6,
        6,
        [
          [0, 0],
          [2.5, 2.5],
          [5, 5],
        ],
      ],
    ])('', (variant, coords, width, height, output) => {
      it(variant, () => {
        expect(getPlotCoords(coords as any, width, height)).toStrictEqual(output);
      });
    });
  });

  describe('scaler', () => {
    describe.each([
      ['picks right range', [0, 1], [1, 1], 0, 1],
      ['picks right range with negative values', [-1, 1], [0, 100], -1, 0],
      ['picks right domain and range', [-1, 1], [-100, 100], -1, -100],
      ['picks right domain and range with negatives', [0, 10], [-100, 0], 10, 0],
      ['picks right domain and range from zero', [-1, 0], [-100, 100], 0, 100],
      ['picks right values from the range', [-1, 1], [-100, 100], 0.5, 50],
      ['picks right negative values', [0, 1], [-100, 0], 0.5, -50],
      ['picks fractional range', [0, 1], [0, 3], 0.5, 1.5],
    ])('', (variant, domain, range, input, output) => {
      it(variant, () => {
        expect(scaler(domain as any, range as any)(input)).toBe(output);
      });
    });
  });

  describe('getExtrema', () => {
    describe.each([
      [
        'gets max value',
        [
          [0, 1],
          [1, 1],
          [4, 1],
          [2, 1],
        ],
        'max',
        0,
        0,
        4,
      ],
      [
        'gets max value with negative values',
        [
          [-1, 1],
          [1.3, 1],
          [4, 1],
          [0, 1],
        ],
        'max',
        0,
        0,
        4,
      ],
      [
        'gets min value',
        [
          [-1, 1],
          [1.3, 1],
          [4, 1],
          [0, 1],
        ],
        'min',
        0,
        0,
        -1,
      ],
      [
        'gets max value with lowest value higher than any from the array',
        [
          [-1, 1],
          [1.3, 1],
          [1, 1],
          [0, 1],
        ],
        'max',
        2,
        0,
        2,
      ],
      [
        'gets min value from second row when all values are equal',
        [
          [-1, 1],
          [1.3, 1],
          [1, 1],
          [0, 1],
        ],
        'min',
        2,
        1,
        1,
      ],
      [
        'gets max value from second row',
        [
          [-1, 1],
          [1.3, 10],
          [1, -10],
          [0, 100],
        ],
        'max',
        0,
        1,
        100,
      ],
    ])('', (variant, arr, type, start, position, output) => {
      it(variant, () => {
        expect(getExtrema(arr as any, type as 'min' | 'max', start, position)).toBe(output);
      });
    });
  });

  describe('plot', () => {
    const mockedData: PlotCoords = [
      [1, 1],
      [2, 2],
    ];
    describe.each([
      [
        'generates output without specified size',
        [
          [1, 5],
          [3, 0],
        ] as PlotCoords,
        undefined,
        undefined,
        `
      
  ▲   
 5┤┓  
  │┃  
  │┃  
  │┃  
  │┃  
 0┤┗━ 
  └┬┬▶
   13 
`,
      ],
      [
        'special case',
        [
          [1, 1000],
          [3, 2000],
        ] as PlotCoords,
        2,
        2,
        `
         
     ▲   
 2000┤┏━ 
 1000┤┛  
     └┬┬▶
      13 
`,
      ],
      [
        'generates basic output',
        mockedData,
        2,
        2,
        `
      
  ▲   
 2┤┏━ 
 1┤┛  
  └┬┬▶
   12 
`,
      ],
      [
        'special case',
        [
          [1, 1],
          [2, 2],
          [3, 2],
        ] as PlotCoords,
        3,
        3,
        `
       
  ▲    
 2┤┏━━ 
  │┃   
 1┤┛   
  └┬┬┬▶
   123 
`,
      ],
      [
        'scale vertically',
        mockedData,
        4,
        2,
        `
        
  ▲     
 2┤  ┏━ 
 1┤━━┛  
  └┬──┬▶
   1  2 
`,
      ],
      [
        'scale horizontally',
        mockedData,
        2,
        4,
        `
      
  ▲   
 2┤┏━ 
  │┃  
  │┃  
 1┤┛  
  └┬┬▶
   12 
`,
      ],
      [
        'generates more complex plot',
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
        ] as PlotCoords,
        4,
        4,
        `
        
  ▲     
 4┤  ┏━ 
 3┤ ┏┛  
 2┤┏┛   
 1┤┛    
  └┬┬┬┬▶
   1234 
`,
      ],
      [
        'generates more complex plot',
        [
          [1, 1],
          [2, 4],
          [3, 4],
          [4, 1],
        ] as PlotCoords,
        20,
        8,
        `
                        
  ▲                     
 4┤     ┏━━━━━━━━━━━━┓  
  │     ┃            ┃  
  │     ┃            ┃  
  │     ┃            ┃  
  │     ┃            ┃  
  │     ┃            ┃  
  │     ┃            ┃  
 1┤━━━━━┛            ┗━ 
  └┬─────┬──────┬─────┬▶
   1     2      3     4 
`,
      ],
    ])('', (variant, data, width, height, output) => {
      it(variant, () => {
        expect(plot(data, width, height)).toBe(output);
      });
    });
  });
});
