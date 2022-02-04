import { plot } from './services/plot';

console.log(
  plot(
    [
      [
        [1, -5.0123],
        [2, 2.0123],
        [3, 3.01231231231231],
        [8, 3],
      ],
      [
        [3, 5.0123],
        [4, 2.0123],
        [5, 1],
        [-2, -3],
      ],
    ],
    { width: 30, color: ['ansiBlue', 'ansiRed'] },
  ),
);
export default plot;
