import dbPromise, { getAll, putToStore } from '../../db'

import parseAndValidate from '../parseAndValidate'
import { toTransferable } from '../conversion'

import getYearMonth from '../getYearMonth'
import getDataFromServer from './getDataFromServer'

async function getBucketsFromServer(variable) {
  console.time('buckets')
  const arr = await getDataFromServer(variable)
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
    variable,
    range: [
      startYear,
      endYear,
    ],
  } = data

  const arr = []
  const missingKeys = []
  console.time('fetch data from db')
  let bucketsPromise
  const db = await dbPromise.catch(err => {
    console.error(err)
  })
  // console.log(db)
  const dataArr = await getAll(variable).catch(err => {
    console.error(err)
  })
  const dataObject = {}
  for (const { yearMonth, data: record } of dataArr.target.result) {
    dataObject[yearMonth] = parseAndValidate(record)
  }
  // const bar = db.objectStoreNames
  for (let year = startYear; year <= endYear; ++year) {
    for (let month = 1; month <= 12; ++month) {
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`
      const key = `${variable}-${yearMonth}`
      const monthArr = dataObject[yearMonth]
      if (monthArr) {
        arr.push(...monthArr)
        continue
      }
      if (!bucketsPromise) {
        bucketsPromise = getBucketsFromServer(variable)
        console.log(variable, 'data is corrupted or incomplete, fetching data from server')
      }
      missingKeys.push(key)
    }
  }
  console.timeEnd('fetch data from db')
  if (missingKeys.length === 0) {
    const buffer = toTransferable(arr)
    postMessage(buffer, [buffer])
    return
  }
  console.time('missings')
  const buckets = await bucketsPromise
  for (const key of missingKeys) {
    const filtered = buckets[key]
    arr.push(...filtered)
  }
  const o = arr.sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
  console.timeEnd('missings')
  const buffer = toTransferable(o)
  console.time('sending data back')
  postMessage(buffer, [buffer])
  console.timeEnd('sending data back')

  // cache
  const bucketPairs = []
  for (const key of missingKeys) {
    const filtered = buckets[key]
    bucketPairs.push([key, JSON.stringify(filtered)])
  }
  for (const [key, val] of bucketPairs) {
    putToStore(variable, {
      yearMonth: key.split('-').slice(1, 3).join('-'),
      data: val,
    }).catch(console.error)
  }
})
