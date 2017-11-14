import getYearMonth from './getYearMonth'
import getDataFromServer from './getDataFromServer'

const promises = {}

addEventListener('message', ({ data }) => {
  if (!data) {
    return
  }

  if ('variable' in data) {
    const { id, variable } = data
    promises[id] = getDataFromServer(data.variable).then(arr => {
      const buckets = {}
      for (const item of arr) {
        const yearMonth = getYearMonth(item.t)
        const key = `${variable}-${yearMonth}`
        const monthArr = buckets[key]
        if (monthArr) {
          monthArr.push(item)
        } else {
          buckets[key] = [item]
        }
      }
      return buckets
    })
    return
  }

  if ('missingKeys' in data) {
    const missingItems = []
    const bucketPairs = []
    promises[data.id].then(buckets => {
      for (const key of data.missingKeys) {
        const filtered = buckets[key]
        bucketPairs.push([key, JSON.stringify(filtered)])
        missingItems.push(...filtered)
      }
      postMessage({
        id: data.id,
        missingItems,
        bucketPairs,
      })
      promises[data.id] = undefined
    })
  }
})
