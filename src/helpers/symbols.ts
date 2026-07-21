/**
 * Resolves one symbol group without mutating either input.
 * @param {Symbols} defaults - Complete default symbol group.
 * @param {Partial<Symbols>} [overrides] - Per-call field overrides.
 * @returns {Symbols} A new resolved symbol group.
 */
export const resolveSymbols = <Symbols extends object>(
  defaults: Symbols,
  overrides?: Partial<Symbols>,
): Symbols => ({ ...defaults, ...overrides });
