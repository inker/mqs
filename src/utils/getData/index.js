import dbPromise, { getFromStore, getAll } from '../../db'

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
  console.time('fetch data from db')
  let sendMissingKeys
  const db = await dbPromise.catch(err => {
    console.error(err)
  })
  // console.log(db)
  // const foo = await getAll(variable).catch(err => {
  //   console.error(err)
  // })
  // console.log('foo', foo)
  // const bar = db.objectStoreNames
  for (let year = startYear; year <= endYear; ++year) {
    for (let month = 1; month <= 12; ++month) {
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`
      const key = `${variable}-${yearMonth}`
      const monthDataStr = await getFromStore(variable, yearMonth)
      const monthArr = parseAndValidate(monthDataStr && monthDataStr.data)
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
  console.timeEnd('fetch data from db')
  if (missingKeys.length === 0) {
    return arr
  }
  const missingItems = await sendMissingKeys(missingKeys)
  return arr.concat(missingItems).sort((a, b) => a.t.localeCompare(b.t))
}
