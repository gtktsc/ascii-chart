/**
 * Represents point.
 */
export type Point = [x: number, y: number];
/**
 * Represents maybe point.
 */
export type MaybePoint = Point | undefined | [number | undefined, number | undefined];
/**
 * Represents single line.
 */
export type SingleLine = Point[];
/**
 * Represents multi line.
 */
export type MultiLine = SingleLine[];
/**
 * Represents coordinates.
 */
export type Coordinates = SingleLine | MultiLine;
/**
 * Represents graph.
 */
export type Graph = string[][];
