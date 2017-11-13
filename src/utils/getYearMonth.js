/**
 * @function
 * YYYY-MM-DD -> YYYY-MM
 * @param {string} str
 * @returns {string}
 */
export default (str) =>
  str.split(/\D+/).slice(0, 2).map(s => s.padStart(2, '0')).join('-')
