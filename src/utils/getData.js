import { server } from '../config.json'

import getYearMonth from './getYearMonth'
import parseAndValidate from './parseAndValidate'

async function getDataFromServer(endpoint) {
  try {
    const response = await fetch(`//${server.host}:${server.port}/${endpoint}.json`)
    if (!response.ok) {
      throw new Error(`failed to fetch data: ${endpoint}`)
    }
    return await response.json()
  } catch (err) {
    console.error(err)
    return null
  }
}

/**
 * Caches data fetched from the server to localStorage
 * @param {string} factor 
 * @param {Array} arr 
 */
async function cacheServerData(factor, arr) {
  const o = {}
  const keys = arr.map(item => `${factor}-${getYearMonth(item.t)}`)
  const vals = keys.map(key => localStorage.getItem(key))
  console.time('cache prepare')
  for (let i = 0; i < arr.length; ++i) {
    const item = arr[i]
    const val = vals[i]
    const k = keys[i]
    try {
      parseAndValidate(val)
    } catch (err) {
      let monthArr = o[k]
      if (!monthArr) {
        monthArr = []
        o[k] = monthArr
      }
      monthArr.push(item)
    }
  }
  console.timeEnd('cache prepare')
  for (const [k, v] of Object.entries(o)) {
    localStorage.setItem(k, JSON.stringify(v))
  }
}

/**
 * @function
 * Gets weather data of the specified range
 * @param {string} factor
 * @param {[number, number]} [startYear, endYear]
 * @returns {Array}
 */
export default async (factor, [startYear, endYear]) => {
  const arr = []
  let serverData
  for (let year = startYear; year <= endYear; ++year) {
    for (let month = 1; month <= 12; ++month) {
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`
      const key = `${factor}-${yearMonth}`
      const monthDataStr = localStorage.getItem(key)
      if (monthDataStr) {
        try {
          arr.push(...parseAndValidate(monthDataStr))
          continue
        } catch (err) {
          console.error(err)
        }
      }
      if (!serverData) {
        console.log('fetching', factor, 'data from server')
        serverData = await getDataFromServer(factor)
        cacheServerData(factor, serverData)
      }
      arr.push(...serverData.filter(item => item.t.startsWith(yearMonth)))
    }
  }
  return arr
}
