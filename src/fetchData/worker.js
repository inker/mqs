import dbPromise, { getMany, putMany } from '../db'

import ensureIncreasing from '../utils/ensureIncreasing'
import parseAndValidate from '../utils/parseAndValidate'
import toBuffer from '../utils/transferable/toBuffer'

import getYearMonth from '../utils/getYearMonth'
import getDataFromServer from './getDataFromServer'

function toBuckets(variable, arr) {
  console.time('buckets')
  const buckets = {}
  for (const item of arr) {
    const yearMonth = getYearMonth(item.t)
    const monthArr = buckets[yearMonth]
    if (monthArr) {
      monthArr.push(item)
    } else {
      buckets[yearMonth] = [item]
    }
  }
  console.timeEnd('buckets')
  return buckets
}

addEventListener('message', async (e) => {
  if (!e.data) {
    return
  }

  console.log('data received')

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

  // ensure idb is enabled
  await dbPromise.catch(err => {
    console.error(err)
  })

  console.time('fetch data from db')
  const keyRange = IDBKeyRange.bound(`${startYear}-01`, `${endYear}-12`)
  const dataArr = await getMany(variable, keyRange).catch(err => {
    console.error(err)
    return []
  })
  console.timeEnd('fetch data from db')
  console.log('total', dataArr.length, 'objects fetched from idb')

  // bucketize
  const dataObject = {}
  for (const { yearMonth, data } of dataArr) {
    dataObject[yearMonth] = parseAndValidate(data)
  }

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
    console.time('sorting')
    const sortedArr = ensureIncreasing(arr, item => item.t)
    console.timeEnd('sorting')
    const buffer = toBuffer({ id, arr: sortedArr })
    postMessage(buffer, [buffer])
    return
  }

  // fill up missing data
  console.time('missings')
  const itemsFound = arr.length
  const serverArr = await fetchDataPromise
  const buckets = toBuckets(variable, serverArr)
  for (const yearMonth of missingMonths) {
    const filtered = buckets[yearMonth]
    arr.push(...filtered)
  }
  console.time('sorting')
  const sortedArr = ensureIncreasing(arr, item => item.t)
  console.timeEnd('sorting')
  console.timeEnd('missings')
  const buffer = toBuffer({ id, arr: sortedArr })
  console.time('sending data back')
  postMessage(buffer, [buffer])
  console.timeEnd('sending data back')

  // cache
  // cache everything if nothing was found
  const yearMonths = itemsFound ? missingMonths : Object.keys(buckets)
  const records = yearMonths.map(yearMonth => ({
    yearMonth,
    data: JSON.stringify(buckets[yearMonth]),
  }))
  putMany(variable, records)
})
