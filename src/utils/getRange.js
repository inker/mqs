const getYear = (str) => +str.split(/\D*/)[0]

export default (data) => {
  const mins = []
  const maxes = []
  for (const arr of Object.values(data)) {
    mins.push(arr.reduce((prev, cur) => Math.min(getYear(cur.t), prev), Infinity))
    maxes.push(arr.reduce((prev, cur) => Math.max(getYear(cur.t), prev), -Infinity))
  }
  return [
    Math.max(...mins),
    Math.min(...maxes),
  ]
}
