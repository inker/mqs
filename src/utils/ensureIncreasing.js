/**
 * check if the array is increasing
 * @param {Array} arr
 * @param {Function} iteratee
 */
function isIncreasing(arr, iteratee) {
  let prevCriterion = iteratee(arr)
  for (let i = 1; i < arr.length; ++i) {
    const criterion = iteratee(arr[i])
    if (criterion < prevCriterion) {
      return false
    }
    prevCriterion = criterion
  }
  return true
}

const cb = (a, b) =>
  a.criterion < b.criterion ? -1 : a.criterion > b.criterion ? 1 : 0

function fasterSort(arr, iteratee) {
  const vals = arr.map(item => ({
    item,
    criterion: iteratee(item),
  }))
  return vals.sort(cb).map(i => i.item)
}

export default (arr, iteratee) =>
  isIncreasing(arr, iteratee) ? arr : fasterSort(arr, iteratee)
