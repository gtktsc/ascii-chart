import { plot } from './services/plot';

console.log(
  plot(
    [
      [10, 10],
      [-5, -5],
      [2, 3],
      [20, 4],
    ],
    20,
    4,
  ),
);

export default plot;
