import { putToStore } from '../../db'

import Worker from 'worker-loader!./worker'

const worker = new Worker()

function cacheData(variable, bucketPairs) {
  // debugger
  // const db = await dbPromise
  // debugger
  for (const [key, val] of bucketPairs) {
    putToStore(variable, {
      yearMonth: key.split('-').slice(1, 3).join('-'),
      data: val,
    }).catch(console.error)
  }
}

const sendMissingKeys = (id, variable, missingKeys) =>
  new Promise(resolve => {
    async function listener({ data }) {
      console.timeEnd(`worker-${data.id}`)
      if (data.id !== id) {
        return
      }
      worker.removeEventListener('message', listener)
      resolve(data.missingItems)
      console.time('caching')
      cacheData(variable, data.bucketPairs)
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
 * Posts message & returns the next function
 * @param {string} variable
 * @returns {Function}
 */
export default (variable) => {
  const id = Math.random().toString(36).slice(2)
  console.time(`worker-${id}`)
  worker.postMessage({
    id,
    variable,
  })
  return (missingKeys) => sendMissingKeys(id, variable, missingKeys)
}
