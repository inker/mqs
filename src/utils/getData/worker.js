import dbPromise, { getAll, putMany } from '../../db'

import parseAndValidate from '../parseAndValidate'
import { toTransferable } from '../conversion'

import getYearMonth from '../getYearMonth'
import getDataFromServer from './getDataFromServer'

function getBucketsFromServer(variable, arr) {
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

  const db = await dbPromise.catch(err => {
    console.error(err)
  })

  console.time('fetch data from db')
  const getAllEvent = await getAll(variable).catch(err => {
    console.error(err)
  })
  const dataArr = getAllEvent.target.result
  console.timeEnd('fetch data from db')
  console.log('total', dataArr.length, 'objects fetched from idb')
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
    const buffer = toTransferable({ id, arr })
    postMessage(buffer, [buffer])
    return
  }
  console.time('missings')
  const serverArr = await fetchDataPromise
  const buckets = getBucketsFromServer(variable, serverArr)

  for (const key of missingKeys) {
    const filtered = buckets[key]
    arr.push(...filtered)
  }
  arr.sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
  console.timeEnd('missings')
  const buffer = toTransferable({ id, arr })
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
