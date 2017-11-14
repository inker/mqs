import parseAndValidate from '../parseAndValidate'

import sendDataRequest from './workerCommunication'

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
  let sendMissingKeys
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
      if (!sendMissingKeys) {
        sendMissingKeys = sendDataRequest(variable)
        console.log(variable, 'data is corrupted or incomplete, fetching data from server')
      }
      missingKeys.push(key)
    }
  }
  console.timeEnd('foobar')
  if (missingKeys.length === 0) {
    return arr
  }
  const missingItems = await sendMissingKeys(missingKeys)
  return arr.concat(missingItems).sort((a, b) => a.t.localeCompare(b.t))
}
