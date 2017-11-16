/**
 * Same as lodash's fromPairs
 * @param {Array} arr
 * @returns {object}
 */
export default (arr) => {
  const o = {}
  for (const [k, v] of arr) {
    o[k] = v
  }
  return o
}
