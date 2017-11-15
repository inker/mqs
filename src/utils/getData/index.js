import { fromTransferable } from '../conversion'

import Worker from 'worker-loader!./worker'

/**
 * @function
 * Gets weather data of the specified range
 * @param {string} variable
 * @param {[number, number]} [startYear, endYear]
 * @returns {Array}
 */
export default (variable, range) => {
  const id = Math.random().toString(36).slice(2)
  console.time(`worker-${id}`)
  console.time('creating worker')
  const worker = new Worker()
  return new Promise((resolve, reject) => {
    worker.onmessage = e => {
      console.timeEnd(`worker-${id}`)
      resolve(fromTransferable(e.data))
    }
    worker.onerror = reject
    console.timeEnd('creating worker')
    worker.postMessage({
      id,
      variable,
      range,
    })
  })
}
