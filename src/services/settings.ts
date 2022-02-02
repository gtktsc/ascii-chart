import { Color } from '../types';

export const getAnsiColor = (color: Color): string => {
  switch (color) {
    case 'ansiBlack':
      return '\u001b[30m';
    case 'ansiRed':
      return '\u001b[31m';
    case 'ansiGreen':
      return '\u001b[32m';
    case 'ansiYellow':
      return '\u001b[33m';
    case 'ansiBlue':
      return '\u001b[34m';
    case 'ansiMagenta':
      return '\u001b[35m';
    case 'ansiCyan':
      return '\u001b[36m';
    case 'ansiWhite':
    default:
      return '\u001b[37m';
  }
};
