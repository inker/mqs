import Worker from 'worker-loader!./worker'

const worker = new Worker()

export const sendMissingKeys = (id, missingKeys) =>
  new Promise(resolve => {
    async function listener(e) {
      console.timeEnd(`worker-${e.data.id}`)
      if (e.data.id !== id) {
        return
      }
      worker.removeEventListener('message', listener)
      const { missingItems, bucketPairs } = e.data
      resolve(missingItems)
      console.time('caching')
      for (let i = 0; i < bucketPairs.length; ++i) {
        const [key, val] = bucketPairs[i]
        localStorage.setItem(key, val)
      }
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
