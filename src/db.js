import { dbName } from './config.json'

let store
let db

const a = new Promise((resolve) => {
  if (store) {
    resolve(store)
  }

  const request = indexedDB.open(dbName, 2)

  request.onerror = () => {
    alert('could not connect to the database')
  }

  let promises  

  request.onupgradeneeded = e => {
    console.log('upgrade needed', e)
    const db = e.target.result

    promises = ['temperature', 'precipitation'].map(storeName => new Promise(res => {
      if (db.objectStoreNames.contains(storeName)) {
        res()
      }
      const s = db.createObjectStore(storeName, { keyPath: 'yearMonth' })
      s.transaction.oncomplete = () => {
        store = db.transaction(storeName, 'readwrite').objectStore(storeName)
        res(store)
      }
    }))
  }

  request.onsuccess = async e => {
    db = e.target.result

    if (!(db instanceof IDBDatabase)) {
      throw new Error('db is not IDBDatabase')
    }

    try {
      // debugger
      if (promises) {
        await Promise.all(promises)
      }
    } catch (err) {
      console.error('promises failed')
      throw err
    }
    console.log('db created', db)
    resolve(db)
  }
})

export default a

export const getFromStore = (storeName, key) =>
  new Promise(resolve => {
    db
      .transaction(storeName)
      .objectStore(storeName)
      .get(key)
      .onsuccess = e => resolve(e.target.result)
  })

export const getAll = (storeName) =>
  new Promise(resolve => {
    db
      .transaction(storeName)
      .objectStore(storeName)
      .getAll()
      .onsuccess = resolve
  })

export const putToStore = (storeName, o) =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .put(o)
    req.onerror = reject
    req.onsuccess = resolve
  })

export const clearStore = (storeName) =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .clear()
    req.onerror = reject
    req.onsuccess = resolve
  })

export function clearAllStores() {
  const promises = [...db.objectStoreNames].map(clearStore)
  return Promise.all(promises)
}
