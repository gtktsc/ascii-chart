import { plot } from '../services/plot';
import { examples } from '../examples';

const hasFilter = examples.some(([, { only }]) => only);

console.clear();
examples
  .filter(([, settings]) => (hasFilter ? settings.only : true))
  .forEach(([data, options]) => {
    console.log(plot(data, options));
  });
