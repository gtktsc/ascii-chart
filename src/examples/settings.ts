import { Coordinates, Settings } from '@types';

import { create, Example } from './conversion';

const settingsSchema = {
  showTickLabel: 'boolean',
  hideXAxis: 'boolean',
  hideXAxisTicks: 'boolean',
  hideYAxis: 'boolean',
  hideYAxisTicks: 'boolean',
  fillArea: 'boolean',
  debugMode: 'boolean',
  width: 'number',
  height: 'number',
  title: 'string',
  xLabel: 'string',
  yLabel: 'string',
  yRange: 'tuple:number:number',
  axisCenter: 'tuple:number:number',
} as const;

const typedSettings = <T extends Settings>(settings: T): T => {
  return settings;
};

/**
 * Examples covering generate all settings behavior.
 * @param {Coordinates} data - The data.
 * @returns {Example[]} - Computed result.
 */
export const generateAllSettingsExamples = (data: Coordinates): Example[] => {
  const examples: Example[] = [];

  for (const [key, type] of Object.entries(settingsSchema)) {
    if (key === 'debugMode') continue;

    if (type === 'boolean') {
      for (const value of [true, false]) {
        examples.push(
          create(
            data,
            typedSettings({
              title: `${key} = ${value}`,
              [key]: value,
            } as const),
          ),
        );
      }
    } else if (type === 'number') {
      for (const value of [10, 50]) {
        examples.push(
          create(
            data,
            typedSettings({
              title: `${key} = ${value}`,
              [key]: value,
            } as const),
          ),
        );
      }
    } else if (type === 'tuple:number:number') {
      for (const value of [
        [0, 10],
        [-5, 5],
      ] as [number, number][]) {
        examples.push(
          create(
            data,
            typedSettings({
              title: `${key} = [${value.join(', ')}]`,
              [key]: value,
            } as const),
          ),
        );
      }
    } else if (type === 'string') {
      if (key !== 'title') {
        examples.push(
          create(
            data,
            typedSettings({
              title: `${key} = "label"`,
              [key]: 'label',
            } as const),
          ),
        );
      }
    }
  }

  return examples;
};
