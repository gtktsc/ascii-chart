import { plot } from './services/plot';

console.log(
  plot(
    [
      [1, 1],
      [2, 4],
      [3, 4],
      [4, 2],
      [5, -1],
      [6, 3],
      [7, -1],
      [8, 9],
    ],
    {
      width: 40,
      thresholds: [
        {
          y: 5,
          x: 5,
        },
        {
          x: 2,
        },
      ],
    },
  ),
);

export default plot;
