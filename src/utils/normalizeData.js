/**
 * @function
 * Normalizes the data for plotting
 * @param {number[]} arr - data array.
 * @param {number} height - canvas' height.
 * @returns {number[]} - Y values
 */
export default (arr, height) => { // 1
  const max = Math.max(...arr) // 5
  const min = Math.min(...arr) // -3
  const multiplier = height / (max - min) // 1/8
  return arr.map(item => (item - min) * multiplier)
}
