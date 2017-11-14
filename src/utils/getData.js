import parseAndValidate from './parseAndValidate'

import Worker from 'worker-loader!./worker'

const worker = new Worker()

const sendMissingKeys = (id, missingKeys) =>
  new Promise(resolve => {
    async function listener(e) {
      console.timeEnd(`worker-${e.data.id}`)
      if (e.data.id !== id) {
        return
      }
      worker.removeEventListener('message', listener)
      const { missingItems, bucketPairs } = e.data
      resolve(missingItems)
      console.time('caching')
      for (let i = 0; i < bucketPairs.length; ++i) {
        const [key, val] = bucketPairs[i]
        localStorage.setItem(key, val)
      }
      console.timeEnd('caching')
    }
    worker.addEventListener('message', listener)
    worker.postMessage({
      id,
      missingKeys,
    })
  })

/**
 * @function
 * Gets weather data of the specified range
 * @param {string} variable
 * @param {[number, number]} [startYear, endYear]
 * @returns {Array}
 */
export default async (variable, [startYear, endYear]) => {
  const arr = []
  const missingKeys = []
  console.time('foobar')
  const id = Math.random().toString(36).slice(2)
  let posted = false
  for (let year = startYear; year <= endYear; ++year) {
    for (let month = 1; month <= 12; ++month) {
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`
      const key = `${variable}-${yearMonth}`
      const monthDataStr = localStorage.getItem(key)
      const monthArr = parseAndValidate(monthDataStr)
      if (monthArr) {
        arr.push(...monthArr)
        continue
      }
      if (!posted) {
        posted = true
        console.time(`worker-${id}`)
        worker.postMessage({
          id,
          variable,
        })
        console.log(variable, 'data is corrupted or incomplete, fetching data from server')
      }
      missingKeys.push(key)
    }
  }
  console.timeEnd('foobar')
  if (missingKeys.length === 0) {
    return arr
  }
  const missingItems = await sendMissingKeys(id, missingKeys)
  return arr.concat(missingItems).sort((a, b) => a.t.localeCompare(b.t))
}
