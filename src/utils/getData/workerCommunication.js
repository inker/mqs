import Worker from 'worker-loader!./worker'

const worker = new Worker()

function cacheData(bucketPairs) {
  for (const [key, val] of bucketPairs) {
    localStorage.setItem(key, val)
  }
}

const sendMissingKeys = (id, missingKeys) =>
  new Promise(resolve => {
    async function listener({ data }) {
      console.timeEnd(`worker-${data.id}`)
      if (data.id !== id) {
        return
      }
      worker.removeEventListener('message', listener)
      resolve(data.missingItems)
      console.time('caching')
      cacheData(data.bucketPairs)
      console.timeEnd('caching')
    }
    worker.addEventListener('message', listener)
    worker.postMessage({
      id,
      missingKeys,
    })
  })

export default (variable) => {
  const id = Math.random().toString(36).slice(2)
  console.time(`worker-${id}`)
  worker.postMessage({
    id,
    variable,
  })
  return (missingKeys) => sendMissingKeys(id, missingKeys)
}
