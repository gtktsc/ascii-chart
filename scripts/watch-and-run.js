import { spawn } from 'child_process';
import { watch } from 'fs';
import { resolve } from 'path';

const file = resolve('dist/examples.cjs');
let child;

function run() {
  if (child) {
    child.kill();
  }

  child = spawn('node', [file], { stdio: 'inherit' });
}

watch(file, { persistent: true }, (eventType) => {
  if (eventType === 'change') {
    run();
  }
});

run();
