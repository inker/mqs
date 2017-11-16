import fromBuffer from '../utils/transferable/fromBuffer'
import generateId from '../utils/generateId'

import Worker from 'worker-loader!./worker'

const callbacks = {}

const worker = new Worker()

worker.onmessage = ({ data }) => {
  const { id, error, arr } = data instanceof ArrayBuffer ? fromBuffer(data) : data
  if (error) {
    callbacks[id].reject(new Error(error))
  } else {
    callbacks[id].resolve(arr)
  }
  callbacks[id] = undefined
}

worker.onerror = console.error

/**
 * @function
 * Gets weather data of the specified range
 * @param {string} variable
 * @param {[number, number]} [startYear, endYear]
 * @returns {Array}
 */
export default (variable, range) => {
  const id = generateId()

  return new Promise((resolve, reject) => {
    callbacks[id] = {
      resolve,
      reject,
    }
    worker.postMessage({
      id,
      variable,
      range,
    })
  })
}
