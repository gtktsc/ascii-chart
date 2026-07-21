const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Formats date tick.
 * @param {Date} value - The value.
 * @param {readonly [number, number]} domain - The domain.
 * @returns {string} - Computed result.
 */
export const formatDateTick = (value: Date, domain: readonly [number, number]): string => {
  const span = domain[1] - domain[0];
  const hours = `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`;
  if (span < 60_000) return `${hours}:${pad(value.getUTCSeconds())}`;
  if (span < 86_400_000) return hours;
  const monthDay = `${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  const startYear = new Date(domain[0]).getUTCFullYear();
  const endYear = new Date(domain[1]).getUTCFullYear();
  return startYear === endYear ? monthDay : `${value.getUTCFullYear()}-${monthDay}`;
};
