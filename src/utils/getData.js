import getYearMonth from './getYearMonth'

async function getDataFromServer(endpoint) {
  try {
    const response = await fetch(endpoint)
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
    if (val) {
      continue
    }
    let monthArr = o[k]
    if (!monthArr) {
      monthArr = []
      o[k] = monthArr
    }
    monthArr.push(item)
  }
  for (const [k, v] of Object.entries(o)) {
    localStorage.setItem(k, v)
  }
}

// precipitation-2017-11
export default async (factor, [startYear, endYear]) => {
  const arr = []
  let serverData
  for (let year = startYear; year <= endYear; ++year) {
    for (let month = 1; month <= 12; ++month) {
      const k = `${factor}-${year}-${month.toString().padStart(2, '0')}`
      let monthData = JSON.parse(localStorage.getItem(k))
      if (!monthData) {
        if (!serverData) {
          serverData = await getDataFromServer(factor)
          cacheServerData(factor, serverData)
        }
        monthData = serverData
      }
      arr.push(...monthData)
    }
  }
  return arr
}
