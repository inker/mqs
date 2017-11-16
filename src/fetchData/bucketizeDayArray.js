import getYearMonth from '../utils/getYearMonth'

/**
 * bucketize daily array
 * @param {Array} arr - data array
 * @returns {object}
 */
export default (arr) => {
  const buckets = {}
  for (const item of arr) {
    const yearMonth = getYearMonth(item.t)
    const monthArr = buckets[yearMonth]
    if (monthArr) {
      monthArr.push(item)
    } else {
      buckets[yearMonth] = [item]
    }
  }
  return buckets
}
