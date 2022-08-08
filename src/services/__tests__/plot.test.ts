import { plot } from '../plot';

import { Coordinates, LineFormatterArgs, Settings, FormatterHelpers } from '../../types';

describe('plot', () => {
  const mockedData = [
    [1, 1],
    [2, 2],
  ];

  describe('plot', () => {
    it('Return empty string if values are not present', () => {
      const chart = plot([]);
      expect(chart).toStrictEqual('');
    });
  });
  describe.each([
    [
      'generates output with custom formatter',
      [
        [0, 6000],
        [100, 9000],
        [200, 9100],
        [300, 9200],
        [400, 9344],
        [500, 9877],
        [600, 10200],
        [700, 15000],
        [800, 9100],
        [900, 9200],
        [1000, 9344],
        [1100, 9877],
        [1200, 10001],
        [1300, 9000],
        [1400, 9100],
        [1500, 9200],
        [1600, 9344],
        [1700, 9877],
        [1800, 10001],
        [1900, 9000],
        [2000, 9100],
        [2100, 9200],
        [2200, 9344],
        [2300, 9877],
        [2400, 10001],
        [2500, 10001],
        [2600, 9000],
        [2700, 9100],
        [2800, 9200],
        [2900, 9344],
        [3000, 9877],
        [3100, 10001],
      ],
      {
        height: 12,
        width: 60,
        hideXAxis: true,
        formatter: (value: number) => {
          if (Math.abs(value) > 1000) return `${value / 1000}k`;
          return value;
        },
      },
      `
                                                                    
      ▲                                                             
   15k┤            ┏━┓                                              
      │            ┃ ┃                                              
      │            ┃ ┃                                              
      │            ┃ ┃                                              
      │            ┃ ┃                                              
      │            ┃ ┃                                              
9.877k┤         ┏━━┛ ┃     ┏━━━┓      ┏━━━┓       ┏━━━━┓       ┏━━━ 
    9k┤ ┏━━━━━━━┛    ┗━━━━━┛   ┗━━━━━━┛   ┗━━━━━━━┛    ┗━━━━━━━┛    
      │ ┃                                                           
      │ ┃                                                           
      │ ┃                                                           
    6k┤━┛                                                           
      │                                                             
                                                                    
                                                                   
`,
    ],
    [
      'generates output with formatter for large numbers',
      [
        [-9000, 2000],
        [-8000, -3000],
        [-2000, -2000],
        [2000, 2000],
        [3000, 1500],
        [4000, 5000],
        [10000, 1400],
        [11000, 20000],
        [12000, 30000],
      ],
      {
        width: 60,
        height: 20,
      },
      `
                                                                    
      ▲                                                             
   30k┤                                                          ┏━ 
      │                                                          ┃  
      │                                                          ┃  
      │                                                          ┃  
      │                                                          ┃  
      │                                                          ┃  
   20k┤                                                       ┏━━┛  
      │                                                       ┃     
      │                                                       ┃     
      │                                                       ┃     
      │                                                       ┃     
      │                                                       ┃     
      │                                                       ┃     
      │                                                       ┃     
    5k┤                                    ┏━━━━━━━━━━━━━━━┓  ┃     
      │                                    ┃               ┃  ┃     
    2k┤━━┓                           ┏━━━━━┛               ┗━━┛     
      │  ┃                           ┃                              
   -2k┤  ┃                ┏━━━━━━━━━━┛                              
   -3k┤  ┗━━━━━━━━━━━━━━━━┛                                         
      └┬──┬────────────────┬──────────┬──┬──┬───────────────┬──┬──┬▶
        -8k                          2k    4k                11k    
     -9k                 -2k            3k                10k   12k
`,
    ],
    [
      'generates output with formatter for categorical data',
      [
        [0, -10],
        [1, 0.001],
        [2, 10],
        [3, 200],
        [4, 10000],
        [5, 2000000],
        [6, 50000000],
      ],
      {
        width: 30,
        height: 20,
        formatter: (n: number, { axis }: FormatterHelpers) => {
          const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
          if (axis === 'y') return n;
          return labels[n] || 'X';
        },
      },
      `
                                         
         ▲                               
 50000000┤                            ┏━ 
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
         │                            ┃  
  2000000┤                       ┏━━━━┛  
      -10┤━━━━━━━━━━━━━━━━━━━━━━━┛       
         └┬────┬────┬────┬───┬────┬────┬▶
          A    B    C    D   E    F    G 
`,
    ],
    [
      'generates output y axis shift',
      [
        [0.001, 0.001],
        [0.002, 0.004],
        [0.003, 0.002],
        [0.004, -0.001],
        [0.005, 0.004],
        [0.006, 0.014],
      ],
      {
        width: 20,
        height: 10,
        formatter: (n: number) => Number(n.toFixed(0)),
      },
      `
                            
      ▲                     
     0┤                  ┏━ 
      │                  ┃  
      │                  ┃  
      │                  ┃  
      │                  ┃  
      │                  ┃  
     0┤   ┏━━━┓      ┏━━━┛  
     0┤   ┃   ┗━━┓   ┃      
     0┤━━━┛      ┃   ┃      
     0┤          ┗━━━┛      
      └┬───┬───┬──┬───┬───┬▶
           0      0       0 
       0       0      0    
`,
    ],
    [
      'generates output y axis shift',
      [
        [0.001, 0.001],
        [0.002, 0.004],
        [0.003, 0.002],
        [0.004, -0.001],
        [0.005, 0.004],
        [0.006, 0.014],
      ],
      {
        width: 20,
        height: 10,
      },
      `
                            
      ▲                     
 0.014┤                  ┏━ 
      │                  ┃  
      │                  ┃  
      │                  ┃  
      │                  ┃  
      │                  ┃  
 0.004┤   ┏━━━┓      ┏━━━┛  
 0.002┤   ┃   ┗━━┓   ┃      
 0.001┤━━━┛      ┃   ┃      
-0.001┤          ┗━━━┛      
      └┬───┬───┬──┬───┬───┬▶
       0.002  0.004   0.006 
   0.001   0.003  0.005    
`,
    ],
    [
      'custom line formatter for a single field',
      [
        [1, 0],
        [2, 20],
        [3, 29],
        [4, 10],
        [5, 3],
        [6, 40],
        [7, 0],
        [8, 20],
      ],
      {
        height: 10,
        width: 30,
        lineFormatter: ({ y, plotX, plotY, input, index }: LineFormatterArgs) => {
          const output = [{ x: plotX, y: plotY, symbol: '█' }];

          if (input[index - 1]?.[1] < y) {
            return [...output, { x: plotX, y: plotY - 1, symbol: '▲' }];
          }

          return [...output, { x: plotX, y: plotY + 1, symbol: '▼' }];
        },
      },
      `
                                   
   ▲                     ▲         
 40┤                     █         
   │        ▲                      
 29┤        █                      
   │    ▲                        ▲ 
 20┤    █                        █ 
   │                               
   │                               
 10┤            █                  
  3┤            ▼    █             
  0┤█                ▼       █     
   └┬───┬───┬───┬────┬───┬───┬───┬▶
    1   2   3   4    5   6   7   8 
`,
    ],

    [
      'custom line formatter for a single field',
      [
        [1, 0],
        [2, 20],
        [3, 29],
        [4, 10],
        [5, 3],
        [6, 40],
        [7, 0],
        [8, 20],
      ],
      {
        height: 10,
        width: 30,
        lineFormatter: ({ y, plotX, plotY, input, index }: LineFormatterArgs) => {
          if (input[index - 1]?.[1] < y) {
            return { x: plotX, y: plotY, symbol: '+' };
          }
          return { x: plotX, y: plotY - 1, symbol: '-' };
        },
      },
      `
                                   
   ▲                               
 40┤                     +         
   │                               
 29┤        +                      
   │                               
 20┤    +                        + 
   │                               
   │            -                  
 10┤                 -             
  3┤-                        -     
  0┤                               
   └┬───┬───┬───┬────┬───┬───┬───┬▶
    1   2   3   4    5   6   7   8 
`,
    ],
    [
      'generates output with y shift',
      [
        [10, 10],
        [-5, -5],
        [2, 3],
        [20, 4],
      ],
      { width: 20, height: 4 },
      `
                         
   ▲                     
 10┤          ┏━━━━━━━┓  
  3┤    ┏━━━━━┛       ┗━ 
   │    ┃                
 -5┤━━━━┛                
   └┬────┬─────┬───────┬▶
   -5    2    10      20 
`,
    ],
    [
      'generates output with similar small y values',
      [
        [-8, 8],
        [-4, 4],
        [-3, 3],
        [80, 80],
      ],
      { width: 60, height: 10 },
      `
                                                                 
   ▲                                                             
 80┤                                                          ┏━ 
   │                                                          ┃  
   │                                                          ┃  
   │                                                          ┃  
   │                                                          ┃  
   │                                                          ┃  
   │                                                          ┃  
   │                                                          ┃  
  8┤━━┓                                                       ┃  
  4┤  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  
   └┬──┬───────────────────────────────────────────────────────┬▶
      -4                                                      80 
   -8                                                           
`,
    ],
    [
      'generates output without specified size',
      [
        [1, 5],
        [3, 0],
      ],
      { width: undefined, height: undefined },
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
      'generates output with title ',
      [
        [1, 5],
        [3, 0],
      ],
      { width: 10, height: 10, title: 'title' },
      `
title         
  ▲           
 5┤━━━━━━━━┓  
  │        ┃  
  │        ┃  
  │        ┃  
  │        ┃  
  │        ┃  
  │        ┃  
  │        ┃  
  │        ┃  
 0┤        ┗━ 
  └┬────────┬▶
   1        3 
`,
    ],
    [
      'generates output with title ',
      [
        [1, 5],
        [3, 0],
      ],
      {
        title:
          'verylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitle',
      },
      `
verylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitleverylongtitle
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
      'sorts output',
      [
        [3, 0],
        [1, 5],
      ],
      { width: undefined, height: undefined },
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
      ],
      { width: 2, height: 2 },
      `
         
     ▲   
   2k┤┏━ 
   1k┤┛  
     └┬┬▶
      13 
`,
    ],
    [
      'fill area',
      [
        [1, -5],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 10],
        [6, 0],
        [7, -0.5],
        [8, 3],
      ],
      { width: 20, height: 8, fillArea: true },
      `
                         
   ▲                     
 10┤          ████       
   │          ████       
   │          ████       
  3┤    ██████████    ██ 
  2┤  ████████████    ██ 
  0┤  ██████████████████ 
   │  ██████████████████ 
 -5┤████████████████████ 
   └┬──┬─┬──┬──┬──┬─┬──┬▶
    1  2 3  4  5  6 7  8 
`,
    ],
    [
      'fill area with custom symbol',
      [
        [1, -5],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 10],
        [6, 0],
        [7, -0.5],
        [8, 3],
      ],
      { width: 20, height: 8, fillArea: true, symbols: { chart: { area: 'O' } } },
      `
                         
   ▲                     
 10┤          OOOO       
   │          OOOO       
   │          OOOO       
  3┤    OOOOOOOOOO    OO 
  2┤  OOOOOOOOOOOO    OO 
  0┤  OOOOOOOOOOOOOOOOOO 
   │  OOOOOOOOOOOOOOOOOO 
 -5┤OOOOOOOOOOOOOOOOOOOO 
   └┬──┬─┬──┬──┬──┬─┬──┬▶
    1  2 3  4  5  6 7  8 
`,
    ],
    [
      'generates basic output',
      mockedData,
      { width: 2, height: 2 },
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
      ],
      { width: 3, height: 3 },
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
      { width: 4, height: 2 },
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
      { width: 2, height: 4 },
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
      ],
      { width: 4, height: 4 },
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
      'overrides symbols',
      [
        [1, 2],
        [2, 0],
        [3, 5],
        [4, 2],
        [5, -2],
        [6, 3],
      ],
      {
        symbols: {
          empty: '-',
          axis: {
            n: 'A',
            ns: 'i',
            y: 't',
            nse: 'o',
            x: 'j',
            we: 'm',
            e: 'B',
          },
          chart: {
            we: '1',
            wns: '2',
            ns: '3',
            nse: '4',
            wsn: '5',
            sne: '6',
          },
        },
        width: 40,
        height: 10,
      },
      `
--------------------------------------------
--A-----------------------------------------
-5t---------------61111112------------------
--i---------------3------3------------------
--i---------------3------3------------------
-3t---------------3------3---------------61-
-2t11111112-------3------411111112-------3--
--i-------3-------3--------------3-------3--
-0t-------411111115--------------3-------3--
--i------------------------------3-------3--
--i------------------------------3-------3--
-2t------------------------------411111115--
--ojmmmmmmmjmmmmmmmjmmmmmmjmmmmmmmjmmmmmmmjB
---1-------2-------3------4-------5-------6-
`,
    ],
    [
      'hide axis',
      [
        [-5, 2],
        [2, -3],
        [13, 0.1],
        [4, 2],
        [5, -2],
        [6, 12],
      ],
      {
        width: 40,
        height: 10,
        hideYAxis: true,
        hideXAxis: true,
      },
      `
                                             
                                             
                           ┏━━━━━━━━━━━━━━┓  
                           ┃              ┃  
                           ┃              ┃  
                           ┃              ┃  
                           ┃              ┃  
                           ┃              ┃  
    ━━━━━━━━━━━━━━┓    ┏━┓ ┃              ┃  
                  ┃    ┃ ┃ ┃              ┗━ 
                  ┃    ┃ ┗━┛                 
                  ┗━━━━┛                     
                                             
                                             
`,
    ],
    [
      'draws one value in y axis',
      [
        [0, 2],
        [1, 2],
      ],
      { width: undefined, height: undefined },
      `
      
  ▲   
 2┤━━ 
  └┬┬▶
   01 
`,
    ],
    [
      'generates more complex plot',
      [
        [1, 1],
        [2, 4],
        [3, 4],
        [4, 1],
      ],
      { width: 20, height: 8 },
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
    [
      'draws two series on one graphs',
      [
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
        ],
        [
          [1, 4],
          [2, 3],
          [3, 2],
          [4, 1],
        ],
      ],
      { width: 4, height: 4 },
      `
        
  ▲     
 4┤┓ ┏━ 
 3┤┗┓┛  
 2┤┏┗┓  
 1┤┛ ┗━ 
  └┬┬┬┬▶
   1234 
`,
    ],
    [
      'draws two series on one graphs with colors and fill',
      [
        [
          [1, 1],
          [2, 2],
          [3, 4],
          [4, 6],
        ],
        [
          [1, 4],
          [2, 1],
          [3, 2],
          [4, 3],
        ],
      ],
      { fillArea: true },
      `
        
  ▲     
 6┤  ██ 
  │  ██ 
 4┤████ 
 3┤████ 
 2┤████ 
 1┤████ 
  └┬┬┬┬▶
   1234 
`,
    ],
    [
      'draws two complicated graphs',
      [
        [
          [1, -5],
          [2, 2],
          [3, 3],
          [4, 4],
          [5, 10],
          [6, 0],
          [7, -0.5],
          [8, 3],
        ],
        [
          [1, 2],
          [2, 3],
          [3, 2],
          [4, 1],
          [5, 1],
          [6, 10],
          [7, -2],
          [8, -4],
        ],
      ],
      { width: 20, height: 8 },
      `
                         
   ▲                     
 10┤          ┏━━┏━┓     
   │          ┃  ┃ ┃     
   │          ┃  ┃ ┃     
  3┤  ┏━┓━━━━━┛  ┃ ┃  ┏━ 
  2┤━━┛━┗━━━━━━━━┛ ┃  ┃  
  0┤  ┃          ┗━┃━━┛  
 -2┤  ┃            ┗━━┓  
 -5┤━━┛               ┗━ 
   └┬──┬─┬──┬──┬──┬─┬──┬▶
    1  2 3  4  5  6 7  8 
`,
    ],

    [
      'draws two complicated graphs with moved axis',
      [
        [
          [-8, -8],
          [-4, -4],
          [-3, -3],
          [-2, -2],
          [-1, -1],
          [0, 0],
          [2, 2],
          [3, 3],
          [4, 4],
          [8, 8],
        ],
      ],
      { width: 40, height: 20, axisCenter: [0, 0] },
      `
                                            
                      ▲                     
                     8┤                  ┏━ 
                      │                  ┃  
                      │                  ┃  
                      │                  ┃  
                      │                  ┃  
                     4┤        ┏━━━━━━━━━┛  
                     3┤      ┏━┛            
                     2┤   ┏━━┛              
                      │   ┃                 
  ┬─────────┬─┬──┬─┬─0┬───┬──┬─┬─────────┬─▶
 -8        -4-3 -2-1  0   2  3 4         8  
                   ┏-1┤                     
                 ┏━┛-2┤                     
              ┏━━┛  -3┤                     
            ┏━┛     -4┤                     
            ┃         │                     
            ┃         │                     
            ┃         │                     
            ┃         │                     
   ━━━━━━━━━┛       -8┤                     
                      │                     
                                            
`,
    ],
    [
      'draws two complicated graphs',
      [
        [
          [-5, -5],
          [-2, -5],
          [2, 2],
          [3, 3],
          [4, 4],
          [5, 10],
          [6, 0],
          [7, -0.5],
          [8, 3],
        ],
        [
          [1, 2],
          [2, 3],
          [3, 2],
          [4, 1],
          [5, 1],
        ],
      ],
      { width: 20, height: 8 },
      `
                         
   ▲                     
 10┤              ┏┓     
   │              ┃┃     
   │              ┃┃     
  3┤         ┏━┓━━┛┃  ┏━ 
  2┤         ┛━┗━━━━  ┃  
  0┤         ┃     ┗━━┛  
   │         ┃           
 -5┤━━━━━━━━━┛           
   └┬───┬────┬┬─┬┬─┬┬─┬┬▶
   -5  -2    12 34 56 78 
`,
    ],
  ])('', (variant, data, settings, output) => {
    it(variant, () => {
      expect(plot(data as Coordinates, settings as Settings)).toBe(output);
    });
  });
});
