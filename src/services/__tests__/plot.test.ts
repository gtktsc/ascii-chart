import { plot } from '../plot';

import { Coordinates, Point } from '../../types';

describe('plot', () => {
  const mockedData: Coordinates = [
    [1, 1],
    [2, 2],
  ];
  describe.each([
    [
      'generates output y axis shift',
      [
        [0.001, 0.001],
        [0.002, 0.004],
        [0.003, 0.002],
        [0.004, -0.001],
        [0.005, 0.004],
        [0.006, 0.014],
      ] as Coordinates,
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
      'generates output with y shift',
      [
        [10, 10],
        [-5, -5],
        [2, 3],
        [20, 4],
      ] as Coordinates,
      { width: 20, height: 4 },
      `
                         
   ▲                     
 10┤          ┏━━━━━━━┓  
  4┤    ┏━━━━━┛       ┗━ 
   │    ┃                
 -5┤━━━━┛                
   └┬────┬─────┬───────┬▶
   -5    2    10      20 
`,
    ],
    [
      'generates output without specified size',
      [
        [1, 5],
        [3, 0],
      ] as Coordinates,
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
      'sorts output',
      [
        [3, 0],
        [1, 5],
      ] as Coordinates,
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
      ] as Coordinates,
      { width: 2, height: 2 },
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
      ] as Coordinates,
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
      ] as Coordinates,
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
      ] as Coordinates,
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
      ] as Coordinates,
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
      ] as Coordinates,
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
      ] as Coordinates,
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
      ] as Coordinates,
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
      ] as Coordinates,
      { width: 20, height: 8 },
      `
                         
   ▲                     
 10┤          ┏━━┏━┓     
   │          ┃  ┃ ┃     
   │          ┃  ┃ ┃     
  3┤  ┏━┓━━━━━┛  ┃ ┃  ┏━ 
  1┤━━┛━┗━━━━━━━━┛ ┃  ┃  
0.5┤  ┃          ┗━┃━━┛  
 -2┤  ┃            ┗━━┓  
 -4┤━━┛               ┗━ 
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
      ] as Coordinates,
      { width: 40, height: 20, axisCenter: [0, 0] as Point },
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
      ] as Coordinates,
      { width: 20, height: 8 },
      `
                         
   ▲                     
 10┤              ┏┓     
   │              ┃┃     
   │              ┃┃     
  3┤         ┏━┓━━┛┃  ┏━ 
  1┤         ┛━┗━━━━  ┃  
0.5┤         ┃     ┗━━┛  
   │         ┃           
 -5┤━━━━━━━━━┛           
   └┬───┬────┬┬─┬┬─┬┬─┬┬▶
   -5  -2    12 34 56 78 
`,
    ],
  ])('', (variant, data, settings, output) => {
    it(variant, () => {
      expect(plot(data, settings)).toBe(output);
    });
  });
});
