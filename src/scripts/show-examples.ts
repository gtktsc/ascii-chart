import { snapshotExamples } from '@examples';

const hasFilter = snapshotExamples.some(({ only }) => only);

console.clear();
snapshotExamples
  .filter(({ only }) => (hasFilter ? only : true))
  .forEach(({ group, title, render }) => {
    console.log(`${group}: ${title}`);
    console.log(render());
  });
