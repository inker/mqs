import fromBuffer from '../transferable/fromBuffer'
import generateId from '../generateId'

import Worker from 'worker-loader!./worker'

const resolvers = {}

const worker = new Worker()

worker.onmessage = ({ data }) => {
  const { id, arr } = fromBuffer(data)
  console.timeEnd(`worker-${id}`)
  resolvers[id](arr)
  resolvers[id] = undefined
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
  console.time(`worker-${id}`)

  return new Promise((resolve) => {
    resolvers[id] = resolve
    worker.postMessage({
      id,
      variable,
      range,
    })
  })
}
