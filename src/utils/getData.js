import { server } from '../config.json'

import getYearMonth from './getYearMonth'
import validateAndGetFromLocalStorage from './validateAndGetFromLocalStorage'

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

async function cacheServerData(factor, arr) {
  const o = {}
  for (const item of arr) {
    const k = `${factor}-${getYearMonth(item.t)}`
    const val = localStorage.getItem(k)
    try {
      validateAndGetFromLocalStorage(val)
    } catch (err) {
      let monthArr = o[k]
      if (!monthArr) {
        monthArr = []
        o[k] = monthArr
      }
      monthArr.push(item)      //
    }
  }
  for (const [k, v] of Object.entries(o)) {
    localStorage.setItem(k, JSON.stringify(v))
  }
}

// precipitation-2017-11
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
          arr.push(...validateAndGetFromLocalStorage(monthDataStr))
          continue
        } catch (err) {
          console.error(err)
          console.error('could not parse', monthDataStr, 'at', key)
        }
      }
      if (!serverData) {
        console.log('fetching data from server for', factor)
        serverData = await getDataFromServer(factor)
        cacheServerData(factor, serverData)
      }
      arr.push(...serverData.filter(item => item.t.startsWith(yearMonth)))
    }
  }
  return arr
}
