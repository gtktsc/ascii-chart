#!/usr/bin/env node

import * as yargs from 'yargs';
import plot from './index';
import { MultiLine, Settings } from './types';

const { argv } = yargs
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
  })
  .option('options', {
    alias: 'o',
    type: 'string',
    description: 'plot settings',
  })
  .option('height', {
    alias: 'h',
    type: 'number',
    description: 'plot height',
  })
  .option('hideXAxis', {
    type: 'boolean',
    description: 'hide x axis',
  })
  .option('hideYAxis', {
    type: 'boolean',
    description: 'hide Y axis',
  })
  .option('fillArea', {
    type: 'boolean',
    description: 'fill plot area',
  })
  .option('width', {
    alias: 'w',
    type: 'number',
    description: 'plot width',
  })
  .option('title', {
    alias: 't',
    type: 'string',
    description: 'plot title',
  })
  .option('xLabel', {
    type: 'string',
    description: 'x axis label',
  })
  .option('color', {
    alias: 'c',
    type: 'array',
    description: 'plot colors',
  })
  .option('axisCenter', {
    type: 'array',
    description: 'plot center coordinates',
  })
  .option('yLabel', {
    type: 'string',
    description: 'y axis label',
  });

const withError = (cb: () => unknown) => {
  try {
    cb();
  } catch (error) {
    process.stderr.write('Oops! Something went wrong!\n');
    process.exit(1);
  }
};

const execute = ({ input, options }: { input: MultiLine; options?: Settings }) => {
  withError(() => {
    const output = plot(input, options);
    process.stdout.write(output);
    process.exit(0);
  });
};

const prepareParams = ({
  input,
  options,
  width,
  height,
  hideYAxis,
  hideXAxis,
  fillArea,
  title,
  xLabel,
  yLabel,
  color,
  axisCenter,
}: {
  input: string;
  options?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  fillArea?: boolean;
  hideYAxis?: boolean;
  hideXAxis?: boolean;
  color?: (string | number)[];
  axisCenter?: (string | number)[];
}) => {
  const currentOptions = options ? JSON.parse(options) : {};

  return {
    input: JSON.parse(input) as MultiLine,
    options: {
      ...currentOptions,
      width,
      height,
      hideYAxis,
      hideXAxis,
      title,
      xLabel,
      yLabel,
      fillArea,
      color,
      axisCenter,
    },
  };
};

if (argv instanceof Promise) {
  argv.then((parameters) => {
    withError(() => {
      execute(prepareParams(parameters));
    });
  });
} else {
  withError(() => {
    execute(prepareParams(argv));
  });
}
