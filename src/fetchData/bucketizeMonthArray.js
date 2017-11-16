import parseAndValidate from '../utils/parseAndValidate'

/**
 * bucketize monthly array
 * @param {Array} arr - data array
 * @returns {object}
 */
export default (arr) => {
  const buckets = {}
  for (const { yearMonth, data } of arr) {
    buckets[yearMonth] = parseAndValidate(data)
  }
  return buckets
}
