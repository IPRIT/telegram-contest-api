/**
 * @param {string} value
 * @returns {string}
 */
export function ensureString (value) {
  return ( value || '' ).toString();
}

/**
 * @param {number|*} value
 * @returns {number}
 */
export function ensureNumber (value) {
  value = Number( value );
  if (Number.isNaN( value )) {
    return 0;
  }
  return value;
}

export const HOUR_MS = 3600 * 1000;
export const TIME_PERIODS = {
  minute: HOUR_MS / 60,
  hour: HOUR_MS,
  day: HOUR_MS * 24,
  week: HOUR_MS * 24 * 7,
  month: HOUR_MS * 24 * 31,
  year: HOUR_MS * 24 * 365.26
};