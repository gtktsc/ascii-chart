/**
 * Default annotation symbols used when callers provide no override.
 */
export const DEFAULT_ANNOTATION_SYMBOLS = {
  span: '░',
  arrowLine: '·',
  arrowHeads: {
    left: '←',
    right: '→',
    up: '↑',
    down: '↓',
    upLeft: '↖',
    upRight: '↗',
    downLeft: '↙',
    downRight: '↘',
  },
  errorBar: {
    horizontal: '─',
    vertical: '│',
    leftCap: '├',
    rightCap: '┤',
    topCap: '┬',
    bottomCap: '┴',
    center: '┼',
  },
} as const;
