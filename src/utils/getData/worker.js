import parseAndValidate from '../parseAndValidate'

addEventListener('message', e => {
  if (!e.data) {
    return
  }

  const {
    arr,
    keys,
    vals,
  } = e.data

  console.log('worker received')
  console.time('calc')

  const o = {}
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
  console.timeEnd('calc')  

  postMessage(o, [o])
})
