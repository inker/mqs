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
    const key = `${variable}-${yearMonth}`
    const monthArr = buckets[key]
    if (monthArr) {
      monthArr.push(item)
    } else {
      buckets[key] = [item]
    }
  }
  console.timeEnd('buckets')
  return buckets
}

addEventListener('message', async ({ data }) => {
  if (!data) {
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
  } = data

  const arr = []
  const missingKeys = []

  // ensure idb is enabled
  await dbPromise.catch(err => {
    console.error(err)
  })

  console.time('fetch data from db')
  const keyRange = IDBKeyRange.bound(`${startYear}-01`, `${endYear}-12`)
  const getManyEvent = await getMany(variable, keyRange).catch(err => {
    console.error(err)
  })
  const dataArr = getManyEvent.target.result
  console.timeEnd('fetch data from db')
  console.log('total', dataArr.length, 'objects fetched from idb')

  // bucketize
  const dataObject = {}
  for (const { yearMonth, data: record } of dataArr) {
    dataObject[yearMonth] = parseAndValidate(record)
  }

  let fetchDataPromise
  for (let year = startYear; year <= endYear; ++year) {
    for (let month = 1; month <= 12; ++month) {
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`
      const key = `${variable}-${yearMonth}`
      const monthArr = dataObject[yearMonth]
      if (monthArr) {
        arr.push(...monthArr)
        continue
      }
      if (!fetchDataPromise) {
        fetchDataPromise = getDataFromServer(variable)
        console.log(variable, 'data is corrupted or incomplete, fetching data from server')
      }
      missingKeys.push(key)
    }
  }

  if (missingKeys.length === 0) {
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
  const serverArr = await fetchDataPromise
  const buckets = toBuckets(variable, serverArr)
  for (const key of missingKeys) {
    const filtered = buckets[key]
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
  const records = missingKeys.map(key => ({
    yearMonth: key.split('-').slice(1, 3).join('-'),
    data: JSON.stringify(buckets[key]),
  }))
  putMany(variable, records)
})
