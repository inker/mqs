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
 * @param {string} variable
 * @param {Array} arr
 */
function cacheServerData(variable, arr, missingMonths) {
  console.time('cache prepare')
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
  console.timeEnd('cache prepare')
  const flat = []
  for (const yearMonth of missingMonths) {
    const key = `${variable}-${yearMonth}`
    const filtered = buckets[key]
    localStorage.setItem(key, JSON.stringify(filtered))
    flat.push(...filtered)
  }
  return flat
}

/**
 * @function
 * Gets weather data of the specified range
 * @param {string} variable
 * @param {[number, number]} [startYear, endYear]
 * @returns {Array}
 */
export default async (variable, [startYear, endYear]) => {
  const arr = []
  const missingMonths = []
  let serverDataPromise
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
      if (!serverDataPromise) {
        serverDataPromise = getDataFromServer(variable)
        console.log('fetching', variable, 'data from server')
      }
      missingMonths.push(yearMonth)
    }
  }
  if (missingMonths.length === 0) {
    return arr
  }
  const serverData = await serverDataPromise
  console.log('caching')
  const missingItems = cacheServerData(variable, serverData, missingMonths)
  return arr.concat(missingItems).sort((a, b) => a.t.localeCompare(b.t))
}
