/**
 * @function
 * parse Json or throw error
 * @param {string} str - string.
 * @returns {object}
 */
function tryParseJson(str) {
  try {
    return JSON.parse(str)
  } catch (err) {
    throw new Error(`could not parse "${str}"`)
  }
}

/**
 * @function
 * Parse, validate & return
 * @param {string} val - item.
 * @returns {}
 */
export default (val) => {
  const arr = tryParseJson(val)
  if (!Array.isArray(arr)) {
    throw new Error('item should be an array')
  }
  if (!arr.every(i => 't' in i && 'v' && i)) {
    throw new Error("each item's element should have 'i' & 'v' keys")
  }
  return arr
}
