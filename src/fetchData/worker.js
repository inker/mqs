import { ensureConnection, getMany, putMany } from '../db'

import ensureIncreasing from '../utils/ensureIncreasing'
import toBuffer from '../utils/transferable/toBuffer'

import getDataFromServer from './getDataFromServer'
import bucketizeDayArray from './bucketizeDayArray'
import bucketizeMonthArray from './bucketizeMonthArray'

addEventListener('message', async (e) => {
  if (!e.data) {
    return
  }

  const {
    id,
    variable,
    range: [
      startYear,
      endYear,
    ],
  } = e.data

  const arr = []
  const missingMonths = []

  // ensure connection to idb has been established
  try {
    await ensureConnection()
  } catch (err) {
    console.error(err)
    postMessage({
      id,
      error: err.message,
    })
    return
  }

  const keyRange = IDBKeyRange.bound(`${startYear}-01`, `${endYear}-12`)
  const dataArr = await getMany(variable, keyRange).catch(err => {
    console.error(err)
    return []
  })
  console.log('total', dataArr.length, 'objects fetched from idb')

  // bucketize existing data
  const dataObject = bucketizeMonthArray(dataArr)

  // collect existing data
  let fetchDataPromise
  for (let year = startYear; year <= endYear; ++year) {
    for (let month = 1; month <= 12; ++month) {
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`
      const monthArr = dataObject[yearMonth]
      if (monthArr) {
        arr.push(...monthArr)
        continue
      }
      if (!fetchDataPromise) {
        fetchDataPromise = getDataFromServer(variable)
        console.log(variable, 'data is corrupted or incomplete, fetching data from server')
      }
      missingMonths.push(yearMonth)
    }
  }

  if (missingMonths.length === 0) {
    // all data is present
    const buffer = toBuffer({
      id,
      arr: ensureIncreasing(arr, item => item.t),
    })
    postMessage(buffer, [buffer])
    return
  }

  // fill up missing data
  const itemsFound = arr.length
  const serverArr = await fetchDataPromise
  const buckets = bucketizeDayArray(serverArr)
  for (const yearMonth of missingMonths) {
    const filtered = buckets[yearMonth]
    arr.push(...filtered)
  }
  const buffer = toBuffer({
    id,
    arr: ensureIncreasing(arr, item => item.t),
  })

  // send data back
  postMessage(buffer, [buffer])

  // cache
  // cache everything if nothing was found
  const yearMonths = itemsFound ? missingMonths : Object.keys(buckets)
  const records = yearMonths.map(yearMonth => ({
    yearMonth,
    data: JSON.stringify(buckets[yearMonth]),
  }))
  putMany(variable, records)
})
