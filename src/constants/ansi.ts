/**
 * Maps supported color names to ANSI SGR sequences.
 */
export const ANSI_COLORS = {
  ansiBlack: '\u001b[30m',
  ansiRed: '\u001b[31m',
  ansiGreen: '\u001b[32m',
  ansiYellow: '\u001b[33m',
  ansiBlue: '\u001b[34m',
  ansiMagenta: '\u001b[35m',
  ansiCyan: '\u001b[36m',
  ansiWhite: '\u001b[37m',
  ansiBrightBlack: '\u001b[90m',
  ansiBrightRed: '\u001b[91m',
  ansiBrightGreen: '\u001b[92m',
  ansiBrightYellow: '\u001b[93m',
  ansiBrightBlue: '\u001b[94m',
  ansiBrightMagenta: '\u001b[95m',
  ansiBrightCyan: '\u001b[96m',
  ansiBrightWhite: '\u001b[97m',
} as const;

/**
 * ANSI sequence that clears active terminal styling.
 */
export const ANSI_RESET = '\u001b[0m';
