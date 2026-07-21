import { barExamples } from './bars';
import { coreExamples } from './core';
import { withRenderers } from './renderers';

/**
 * Complete legacy plot example collection expanded across renderers.
 */
export const examples = withRenderers([...coreExamples, ...barExamples]);
