/** Numeric segment used by clipping inputs and outputs. */
export type ClippingSegment = readonly (readonly [number, number])[];

/** Named clipping input and expected segment collection. */
export type ClippingCase = readonly [
  name: string,
  data: ClippingSegment,
  expected: readonly ClippingSegment[],
];
