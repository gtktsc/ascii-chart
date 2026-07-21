import { Renderer } from '@types';

import { create, Example } from './conversion';
import { RENDERER_VARIANTS } from './variants';

/**
 * Supported renderer list used by example generation.
 */
export const RENDERERS = RENDERER_VARIANTS;

/**
 * Builds one value for every supported renderer.
 * @param {(renderer: Renderer) => Value} createValue - The create value.
 * @returns {Value[]} - Computed result.
 */
export const forEachRenderer = <Value>(createValue: (renderer: Renderer) => Value): Value[] =>
  RENDERERS.map(createValue);

/**
 * Expands each example across all supported renderers.
 * @param {readonly Example[]} baseExamples - The base examples.
 * @returns {Example[]} - Computed result.
 */
export const withRenderers = (baseExamples: readonly Example[]): Example[] =>
  baseExamples.flatMap(([data, settings]) =>
    forEachRenderer((renderer) =>
      create(data, {
        ...settings,
        title: `${settings.title} [${renderer}]`,
        snapshotTitle: `${settings.snapshotTitle ?? settings.title} [${renderer}]`,
        renderer,
      }),
    ),
  );
