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
    return null
    // throw new Error(`could not parse "${str}"`)
  }
}

/**
 * @function
 * Parse, validate & return
 * @param {string} val - item.
 * @returns {}
 */
export default (val) => {
  if (!val) {
    return null
  }
  const arr = tryParseJson(val)
  return Array.isArray(arr) && arr.every(i => 't' in i && 'v' && i) && arr || null
}
