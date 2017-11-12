/**
 * @function
 * Parse, validate & return
 * @param {string} val - item.
 * @returns {}
 */
export default (val) => {
  const arr = JSON.parse(val)
  if (!Array.isArray(arr)) {
    throw new Error('item should be an array')
  }
  if (!arr.every(i => 't' in i && 'v' && i)) {
    throw new Error("each item's element should have 'i' & 'v' keys")
  }
  return arr
}
