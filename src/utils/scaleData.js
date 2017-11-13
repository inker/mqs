/**
 * @function
 * Scales the data for plotting
 * @param {number[]} arr - data array.
 * @param {number} newSize - canvas' width.
 * @returns {number[]} - Y values
 */
export default (arr, newSize) => {
  if (newSize > arr.length) {
    throw new Error('does not work for upscaling')
  }
  if (newSize < 0 || !Number.isInteger(newSize)) {
    throw new Error('newSize must be a non-negative integer')
  }
  if (newSize === 0) {
    return []
  }
  const dataLength = arr.length
  const pixelsPerPoint = newSize / dataLength

  const bins = []
  bins.length = newSize
  bins.fill(0)

  for (let i = 0; i < dataLength; ++i) {
    const val = arr[i]

    const min = i * pixelsPerPoint
    const max = min + pixelsPerPoint
    const minFloor = ~~min
    const maxFloor = ~~max

    const minPortion = maxFloor - min
    bins[minFloor] += val * minPortion

    const maxPortion = max - maxFloor
    if (maxFloor < newSize) {
      bins[maxFloor] += val * maxPortion
    }
  }

  return bins
}
