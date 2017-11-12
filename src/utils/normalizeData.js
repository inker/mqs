/**
 * @function
 * Normalizes the data for plotting
 * @param {number[]} arr - data array.
 * @param {number} height - canvas' height.
 * @returns {number[]} - Y values
 */
export default (arr, height) => {
  const max = Math.max(...arr)
  const multiplier = height / max
  return arr.map(item => item * multiplier)
}
